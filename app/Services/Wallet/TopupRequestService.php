<?php

namespace App\Services\Wallet;

use App\Enums\FileCategory;
use App\Enums\TopupRequestStatus;
use App\Enums\WalletTransactionType;
use App\Models\Company;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTopupRequest;
use App\Models\WalletTransaction;
use App\Services\ActivityLogService;
use App\Services\Files\FileStorageService;
use App\Support\Authorization\SelfApprovalGuard;
use App\Support\Identity\CurrentActor;
use App\Support\Notify;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * شحن المحفظة بتحويل بنكي (H §12.5 + دليل الأدمن المالي §1):
 *
 * ١) مسؤول الحساب يرفع الطلب (المبلغ، تاريخ التحويل، آخر 4 أرقام، مرجع
 *    العملية، صورة الإشعار على القرص الخاص).
 * ٢) submitted ← under_review ← approved أو rejected.
 * ٣) قيد فريد على (مرجع العملية + المبلغ) يمنع اعتماد نفس التحويل مرتين.
 * ٤) الاعتماد للأدمن المالي، ولا يعتمد أحد طلباً أنشأه بنفسه.
 * ٥) الرفض يوثّق سبباً ويُشعر مسؤول الحساب؛ وإلغاء اعتماد سابق حركة عكسية
 *    مرتبطة بسبب مسجَّل.
 */
class TopupRequestService
{
    public function __construct(private LedgerService $ledger) {}

    /**
     * رفع طلب شحن — بحالة submitted.
     *
     * @param  array{amount: float|int|string, transfer_date: string, sender_account_last4: string, bank_reference: string}  $data
     */
    public function submit(Company $company, array $data, UploadedFile $receipt): WalletTopupRequest
    {
        $amountHalalas = (int) round(((float) $data['amount']) * 100);

        if ($amountHalalas <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['المبلغ يجب أن يكون أكبر من صفر.'],
            ]);
        }

        $duplicate = WalletTopupRequest::query()
            ->withoutGlobalScopes()
            ->where('bank_reference', $data['bank_reference'])
            ->where('amount_halalas', $amountHalalas)
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'bank_reference' => ['يوجد طلب سابق بنفس مرجع العملية والمبلغ — لا يُعتمد التحويل نفسه مرتين.'],
            ]);
        }

        $wallet = Wallet::mainFor($company);

        // A15 — H §19 «الملفات»: إشعار التحويل jpg·png·pdf حتى 5MB، بفحص نوع
        // MIME الفعلي لا الامتداد ورفض أي ملف تنفيذي، ويُقيَّد في `stored_files`
        // فلا يُحذف نهائياً أبداً (ملف مالي).
        $storedReceipt = app(FileStorageService::class)->store(
            upload: $receipt,
            category: FileCategory::BankReceipt,
            owner: $company,
            companyId: $company->id,
            field: 'receipt',
        );

        $receiptPath = $storedReceipt->path;

        try {
            $request = WalletTopupRequest::create([
                'company_id' => $company->id,
                'wallet_id' => $wallet->id,
                'amount_halalas' => $amountHalalas,
                'transfer_date' => $data['transfer_date'],
                'sender_account_last4' => $data['sender_account_last4'],
                'bank_reference' => $data['bank_reference'],
                'receipt_path' => $receiptPath,
                'status' => TopupRequestStatus::Submitted,
                'created_by_user_id' => CurrentActor::resolve()['id'],
            ]);
        } catch (UniqueConstraintViolationException) {
            // سباق على قيد التفرّد (مرجع + مبلغ) — نفس رسالة التكرار.
            throw ValidationException::withMessages([
                'bank_reference' => ['يوجد طلب سابق بنفس مرجع العملية والمبلغ — لا يُعتمد التحويل نفسه مرتين.'],
            ]);
        }

        ActivityLogService::log(
            $company->id,
            $request,
            'wallet_topup_submitted',
            "طلب شحن محفظة بتحويل بنكي بمبلغ {$request->amount} ريال — مرجع {$request->bank_reference}",
            ['amount_halalas' => $amountHalalas, 'bank_reference' => $request->bank_reference],
        );

        return $request;
    }

    /**
     * بدء المراجعة (الأدمن المالي) — submitted ← under_review.
     */
    public function startReview(WalletTopupRequest $request, User $reviewer): WalletTopupRequest
    {
        if ($request->status !== TopupRequestStatus::Submitted) {
            return $request;
        }

        $request->update(['status' => TopupRequestStatus::UnderReview]);

        ActivityLogService::log(
            $request->company_id,
            $request,
            'wallet_topup_under_review',
            "بدأت مراجعة طلب الشحن #{$request->id}",
            null,
            $reviewer->id,
            $reviewer->name,
        );

        return $request;
    }

    /**
     * الاعتماد: أدمن مالي، ليس منشئ الطلب، وينشئ حركة top_up في الدفتر
     * بمفتاح تفرّد ثابت — لا اعتماد مزدوج ولا أثر مزدوج.
     */
    public function approve(WalletTopupRequest $request, User $approver): WalletTopupRequest
    {
        SelfApprovalGuard::assertNotSelfApproval($approver, $request);

        if (! in_array($request->status, [TopupRequestStatus::Submitted, TopupRequestStatus::UnderReview], true)) {
            throw ValidationException::withMessages([
                'status' => ['لا يمكن اعتماد طلب في حالة «'.$request->status->label().'».'],
            ]);
        }

        return DB::transaction(function () use ($request, $approver) {
            // تسلسل الاعتماد في المفتاح: إعادة الاعتماد بعد إلغاءٍ حركة جديدة
            // مشروعة، بينما الاعتماد المزدوج المتزامن يصطدم بقيد التفرّد.
            $sequence = WalletTransaction::query()
                ->where('reference_type', $request->getMorphClass())
                ->where('reference_id', $request->id)
                ->where('type', WalletTransactionType::TopUp)
                ->count();

            $transaction = $this->ledger->credit(
                $request->wallet()->withoutGlobalScopes()->firstOrFail(),
                WalletTransactionType::TopUp,
                $request->amount_halalas,
                "topup-request:{$request->id}:approval:{$sequence}",
                [
                    'reference' => $request,
                    'actorUserId' => $approver->id,
                    'note' => "اعتماد تحويل بنكي — مرجع {$request->bank_reference}",
                ],
            );

            $request->forceFill([
                'status' => TopupRequestStatus::Approved,
                'reviewed_by_user_id' => $approver->id,
                'reviewed_at' => now(),
                'approval_transaction_id' => $transaction->id,
            ])->save();

            ActivityLogService::log(
                $request->company_id,
                $request,
                'wallet_topup_approved',
                "اعتُمد طلب الشحن #{$request->id} بمبلغ {$request->amount} ريال",
                ['transaction_id' => $transaction->id],
                $approver->id,
                $approver->name,
            );

            Notify::sendToId(
                'wallet.topup.approved',
                Company::class,
                (int) $request->company_id,
                ['amount' => $request->amount],
                ['data' => ['topup_request_id' => $request->id]],
            );

            return $request;
        });
    }

    /**
     * الرفض: سبب موثَّق إلزامي + إشعار فوري لمسؤول الحساب.
     */
    public function reject(WalletTopupRequest $request, User $reviewer, string $reason): WalletTopupRequest
    {
        if (! in_array($request->status, [TopupRequestStatus::Submitted, TopupRequestStatus::UnderReview], true)) {
            throw ValidationException::withMessages([
                'status' => ['لا يمكن رفض طلب في حالة «'.$request->status->label().'».'],
            ]);
        }

        $request->forceFill([
            'status' => TopupRequestStatus::Rejected,
            'reviewed_by_user_id' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ])->save();

        ActivityLogService::log(
            $request->company_id,
            $request,
            'wallet_topup_rejected',
            "رُفض طلب الشحن #{$request->id} — السبب: {$reason}",
            ['reason' => $reason],
            $reviewer->id,
            $reviewer->name,
        );

        Notify::sendToId(
            'wallet.topup.rejected',
            Company::class,
            (int) $request->company_id,
            ['amount' => $request->amount, 'reason' => $reason],
            ['data' => ['topup_request_id' => $request->id]],
        );

        return $request;
    }

    /**
     * إلغاء اعتماد سابق: حركة عكسية مرتبطة بالحركة الأصلية + سبب مسجَّل،
     * ولا يلغي أحد اعتماداً هو من أنشأ طلبه أو من اعتمده (فصل مزدوج).
     * يعيد الطلب إلى under_review.
     */
    public function unapprove(WalletTopupRequest $request, User $actor, string $reason): WalletTopupRequest
    {
        if ($request->status !== TopupRequestStatus::Approved || $request->approval_transaction_id === null) {
            throw ValidationException::withMessages([
                'status' => ['لا يوجد اعتماد قائم لهذا الطلب.'],
            ]);
        }

        SelfApprovalGuard::assertNotSelfApproval($actor, $request);
        SelfApprovalGuard::assertNotSelfApproval($actor, $request->reviewed_by_user_id);

        return DB::transaction(function () use ($request, $actor, $reason) {
            // مفتاح العكس مشتق من حركة الاعتماد المعكوسة نفسها — عكس واحد
            // لكل اعتماد مهما تكرر الطلب.
            $reversal = $this->ledger->reverse(
                $request->approvalTransaction,
                "topup-unapproval:tx:{$request->approval_transaction_id}",
                "إلغاء اعتماد التحويل البنكي — {$reason}",
                $actor->id,
            );

            $request->forceFill([
                'status' => TopupRequestStatus::UnderReview,
                'unapproved_by_user_id' => $actor->id,
                'unapproved_at' => now(),
                'unapproval_reason' => $reason,
                'reversal_transaction_id' => $reversal->id,
                'approval_transaction_id' => null,
            ])->save();

            ActivityLogService::log(
                $request->company_id,
                $request,
                'wallet_topup_unapproved',
                "أُلغي اعتماد طلب الشحن #{$request->id} بحركة عكسية — السبب: {$reason}",
                ['reversal_transaction_id' => $reversal->id, 'reason' => $reason],
                $actor->id,
                $actor->name,
            );

            Notify::sendToId(
                'wallet.topup.reversed',
                Company::class,
                (int) $request->company_id,
                ['amount' => $request->amount, 'reason' => $reason],
                ['data' => ['topup_request_id' => $request->id]],
            );

            return $request;
        });
    }
}
