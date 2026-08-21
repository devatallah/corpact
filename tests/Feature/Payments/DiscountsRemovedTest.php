<?php

use App\Enums\PartnerRole;
use App\Http\Controllers\Partner\DiscountController;
use App\Http\Requests\Employee\StoreEventRequest;
use App\Models\Discount;
use App\Models\Partner;
use App\Services\Employee\EventCreationService;
use App\Services\Partner\DiscountService;
use Illuminate\Support\Facades\Schema;

// A10 بند 2 — إزالة ميزة التخفيضات المحظورة (H §12.1: «لا تخفيضات ولا رموز
// ترويجية في الإصدار الأول»): كل مسارات الكتابة والواجهات ماتت، والجدول
// مؤرشف legacy_discounts للقراءة فقط — لا سجل مالي يُحذف أبداً.

test('the discounts table is archived as legacy_discounts, never dropped', function () {
    expect(Schema::hasTable('discounts'))->toBeFalse()
        ->and(Schema::hasTable('legacy_discounts'))->toBeTrue()
        ->and(Schema::hasColumn('legacy_discounts', 'archived_at'))->toBeTrue()
        // تاريخ الفعاليات القديم يبقى قابلاً للقراءة.
        ->and(Schema::hasColumn('events', 'discount_id'))->toBeTrue()
        ->and(Schema::hasColumn('events', 'discount_amount_halalas'))->toBeTrue();
});

test('every partner discount route is gone', function () {
    $partner = Partner::factory()->create(['status' => 'active']);

    $this->actingAs($partner, 'partner')->get('/partner/discounts')->assertNotFound();
    $this->actingAs($partner, 'partner')->post('/partner/discounts', [])->assertNotFound();
    $this->actingAs($partner, 'partner')->put('/partner/discounts/1', [])->assertNotFound();
    $this->actingAs($partner, 'partner')->delete('/partner/discounts/1')->assertNotFound();
});

test('no discount permission, model, service, or controller survives in code', function () {
    foreach (PartnerRole::cases() as $role) {
        expect(collect($role->permissions())->filter(fn ($p) => str_contains($p, 'discount'))->all())->toBe([]);
    }

    expect(class_exists(Discount::class))->toBeFalse()
        ->and(class_exists(DiscountService::class))->toBeFalse()
        ->and(class_exists(DiscountController::class))->toBeFalse();
});

test('event pricing math accepts no discount input anywhere', function () {
    // معادلة التسعير الجديدة: مجموع أسعار المرافق − الدعم ÷ الحد الأدنى فقط.
    $service = app(EventCreationService::class);
    $reflection = new ReflectionMethod($service, 'calculateCosts');
    $doc = (string) $reflection->getDocComment();

    expect(str_contains($doc, 'discount'))->toBeFalse()
        ->and(array_key_exists('discount_id', (new StoreEventRequest)->rules()))->toBeFalse();
});
