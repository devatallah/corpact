<?php

use App\Enums\WalletTransactionType;
use App\Exceptions\PaidSettlementImmutableException;
use App\Exceptions\SelfApprovalException;
use App\Models\Community;
use App\Models\Company;
use App\Models\EventStatusHistory;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Models\WalletTransaction;
use App\Services\Billing\ProviderPayableService;
use App\Services\Billing\SettlementStatementService;
use Illuminate\Support\Carbon;
use Tests\Support\FinancialInvariants;

/*
|--------------------------------------------------------------------------
| سيناريو القبول 9 (H §23)
| «توليد كشف تسوية لمزوّد له 12 فعالية في فترة واحدة، وصرفه»
|--------------------------------------------------------------------------
|
| الكشف كل 15 يوماً **لكل مزوّد** (H §12.7)، بحالات `draft ← approved ← paid`
| بلا قفز، و«لا يعتمد أحد إجراءً مالياً أنشأه بنفسه» — ثم الصرف بعد التحويل
| الفعلي ينقل كل فعالية إلى «مسوّاة» عبر آلة A7.
|
| الحساب لكل فعالية: 300.00 إجمالي · 12% عمولة = 36.00 · صافي 264.00،
| والكشف مجموعها: 3,600.00 · 432.00 · 3,168.00.
*/

test('سيناريو 9 — كشف مزوّد بـ12 فعالية مكتملة: يُولَّد، يعتمده غير مولّده، ثم يُصرف فتصير الفعاليات مسوّاة', function () {
    fakeMessages();

    $this->travelTo(Carbon::parse('2026-08-14 12:00'));

    $partner = Partner::factory()->create(['commission_rate' => 12.00, 'bank_status' => 'approved']);
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    // ── 12 فعالية مكتملة داخل الفترة 1–15 أغسطس ───────────────────────────
    $events = [];
    for ($day = 1; $day <= 12; $day++) {
        ['event' => $event] = a11CompletedEvent([
            'partner' => $partner,
            'company' => $company,
            'community' => $community,
            'total' => 300.0,
            'attendees' => 2,
            'completed_at' => Carbon::parse(sprintf('2026-08-%02d 20:00', $day)),
        ]);
        $events[] = $event;
    }

    $payableWallet = app(ProviderPayableService::class)->walletFor($partner);

    // العمولة تُقيَّد عند الاكتمال حصراً — فالمستحق قائم قبل أي كشف.
    expect(SettlementItem::where('partner_id', $partner->id)->count())->toBe(12)
        ->and(SettlementItem::where('partner_id', $partner->id)->pluck('status')->unique()->all())->toBe([SettlementItem::STATUS_PENDING])
        ->and(FinancialInvariants::ledgerBalance($payableWallet))->toBe(12 * 26_400);

    // ── التوليد المجدول يوم 16 عن الفترة P1 ───────────────────────────────
    $this->travelTo(Carbon::parse('2026-08-16 03:00'));
    $this->artisan('app:generate-settlements')->assertSuccessful();

    $statement = SettlementStatement::where('partner_id', $partner->id)->firstOrFail();

    expect(SettlementStatement::count())->toBe(1)
        ->and($statement->period_key)->toBe('2026-08-P1')
        ->and($statement->status)->toBe(SettlementStatement::STATUS_DRAFT)
        ->and($statement->items_count)->toBe(12)
        ->and($statement->gross_amount_halalas)->toBe(360_000)       // 3,600.00
        ->and($statement->commission_amount_halalas)->toBe(43_200)   // 432.00
        ->and($statement->net_amount_halalas)->toBe(316_800);        // 3,168.00

    // كل بند قابل للتتبع إلى فعاليته، ولا فعالية مكررة في الكشف.
    $items = SettlementItem::where('settlement_statement_id', $statement->id)->get();

    expect($items)->toHaveCount(12)
        ->and($items->pluck('event_id')->unique()->count())->toBe(12)
        ->and($items->pluck('event_id')->sort()->values()->all())->toBe(collect($events)->pluck('id')->sort()->values()->all())
        ->and($items->pluck('status')->unique()->all())->toBe([SettlementItem::STATUS_INCLUDED])
        ->and($items->pluck('gross_amount_halalas')->unique()->all())->toBe([30_000])
        ->and($items->pluck('net_amount_halalas')->unique()->all())->toBe([26_400])
        // اللقطة مجمّدة داخل البند نفسه — لا يتغير التاريخ بتغيّر ملف المزوّد.
        ->and($items->first()->snapshot_json)->not->toBeNull();

    // ── «لا يعتمد أحد إجراءً مالياً أنشأه بنفسه» ──────────────────────────
    $service = app(SettlementStatementService::class);
    $generator = a11FinanceAdmin('المولِّد');
    $statement->forceFill(['generated_by_user_id' => $generator->id])->save();

    expect(fn () => $service->approve($statement->fresh(), $generator))
        ->toThrow(SelfApprovalException::class);

    $approver = a11FinanceAdmin('المعتمِد');
    $service->approve($statement->fresh(), $approver);

    expect($statement->fresh()->status)->toBe(SettlementStatement::STATUS_APPROVED)
        ->and($statement->fresh()->approved_by_user_id)->toBe($approver->id)
        ->and($statement->fresh()->approved_by_user_id)->not->toBe($generator->id);

    // والمولِّد ممنوع من تسجيل الصرف أيضاً — الفصل يشمل الخطوتين.
    expect(fn () => $service->markPaid($statement->fresh(), $generator, 'BANK-12'))
        ->toThrow(SelfApprovalException::class);

    // ── الصرف بعد التحويل الفعلي بمرجع إلزامي ─────────────────────────────
    $payer = a11FinanceAdmin('الصارف');
    $service->markPaid($statement->fresh(), $payer, 'BANK-REF-12-EVENTS', Carbon::parse('2026-08-16 10:00'));

    $statement = $statement->fresh();

    expect($statement->status)->toBe(SettlementStatement::STATUS_PAID)
        ->and($statement->payout_reference)->toBe('BANK-REF-12-EVENTS')
        ->and($statement->paid_by_user_id)->toBe($payer->id)
        ->and(SettlementItem::where('settlement_statement_id', $statement->id)->pluck('status')->unique()->all())->toBe([SettlementItem::STATUS_PAID]);

    // ── كل الفعاليات الاثنتي عشرة صارت «مسوّاة» عبر آلة A7 ────────────────
    foreach ($events as $event) {
        expect($event->fresh()->status)->toBe('settled')
            ->and(EventStatusHistory::where('event_id', $event->id)->where('to_status', 'settled')->count())->toBe(1);
    }

    // ── المستحق أُفرغ بقيد صرف واحد بالصافي ──────────────────────────────
    $payout = WalletTransaction::where('idempotency_key', "provider-payout:statement:{$statement->id}")->firstOrFail();

    expect($payout->type)->toBe(WalletTransactionType::Settlement)
        ->and($payout->direction)->toBe(WalletTransaction::DIRECTION_DEBIT)
        ->and($payout->amount_halalas)->toBe(316_800)
        ->and(FinancialInvariants::ledgerBalance($payableWallet))->toBe(0);

    // ── «ولا يُعدَّل كشف مدفوع إطلاقاً» ───────────────────────────────────
    expect(fn () => $statement->forceFill(['net_amount_halalas' => 1])->save())
        ->toThrow(PaidSettlementImmutableException::class);

    // إعادة تشغيل المولّد لنفس الفترة لا تنتج كشفاً ثانياً.
    $this->artisan('app:generate-settlements')->assertSuccessful();
    expect(SettlementStatement::where('partner_id', $partner->id)->count())->toBe(1);

    FinancialInvariants::assertAll();
});
