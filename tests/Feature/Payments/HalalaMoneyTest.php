<?php

use App\Models\ActivityUnit;
use App\Models\Event;
use App\Models\VenuePricing;
use App\Support\Money;
use Illuminate\Support\Facades\Schema;

// A10 بند 1 — تحويل نطاق مال الفعاليات إلى هللات صحيحة (H §12.1):
// لا float في أي حساب، الأسعار شاملة ضريبة 15% ومفكَّكة base/vat،
// «منزلتان عشريتان بلا تقريب لأعلى»، والأسماء القديمة جسور عرض فقط.

test('money helpers are integer-only: conversion, formatting, VAT decomposition, and floor share split', function () {
    expect(Money::toHalalas('300.00'))->toBe(30_000)
        ->and(Money::toHalalas(33.33))->toBe(3_333)
        ->and(Money::format(3_333))->toBe('33.33')
        ->and(Money::format(2))->toBe('0.02');

    // التفكيك: الأساس floor(الإجمالي×100÷115) والضريبة الباقي — يجمعان دائماً.
    $vat = Money::decomposeVat(30_000);
    expect($vat)->toBe(['base' => 26_086, 'vat' => 3_914])
        ->and($vat['base'] + $vat['vat'])->toBe(30_000);

    // القسمة بلا تقريب لأعلى وفرق الكسور يعود ليُحمَّل على جانب العمولة.
    expect(Money::splitShare(20_000, 6))->toBe(['share' => 3_333, 'remainder' => 2])
        ->and(Money::splitShare(20_000, 4))->toBe(['share' => 5_000, 'remainder' => 0]);
});

test('event money columns are integer halalas and the legacy decimal columns are gone', function () {
    foreach (['total_amount_halalas', 'base_amount_halalas', 'vat_amount_halalas', 'subsidy_type', 'subsidy_value', 'subsidy_halalas', 'max_share_halalas', 'final_share_halalas', 'rounding_remainder_halalas'] as $column) {
        expect(Schema::hasColumn('events', $column))->toBeTrue("events.{$column} missing");
    }

    foreach (['total_amount', 'cost_per_person', 'company_subsidy', 'community_contribution', 'player_payment', 'discount_amount'] as $column) {
        expect(Schema::hasColumn('events', $column))->toBeFalse("events.{$column} still a real column");
    }

    expect(Schema::hasColumn('venue_pricings', 'price_halalas'))->toBeTrue()
        ->and(Schema::hasColumn('venue_pricings', 'price'))->toBeFalse()
        ->and(Schema::hasColumn('activity_units', 'price_halalas'))->toBeTrue()
        ->and(Schema::hasColumn('activity_units', 'price'))->toBeFalse()
        ->and(Schema::hasColumn('event_provider_requests', 'total_amount_halalas'))->toBeTrue()
        ->and(Schema::hasColumn('event_templates', 'total_amount_halalas'))->toBeTrue()
        ->and(Schema::hasColumn('event_templates', 'subsidy_type'))->toBeTrue()
        ->and(Schema::hasColumn('company_settings', 'default_subsidy_type'))->toBeTrue();
});

test('legacy money names are display accessors over the halala columns, VAT-decomposed on write', function () {
    $event = Event::factory()->create([
        'total_amount' => 300.0,
        'subsidy_type' => 'fixed',
        'subsidy_value' => 10_000,
        'max_share_halalas' => 5_000,
    ]);

    expect($event->total_amount_halalas)->toBe(30_000)
        ->and($event->base_amount_halalas)->toBe(26_086)
        ->and($event->vat_amount_halalas)->toBe(3_914)
        ->and((string) $event->total_amount)->toBe('300.00')
        ->and((string) $event->company_subsidy)->toBe('100.00')
        ->and((string) $event->player_payment)->toBe('200.00')
        ->and((string) $event->cost_per_person)->toBe('50.00');

    // بعد قفل الحصة النهائية يعرضها الاسم القديم بدل السقف.
    $event->forceFill(['subsidy_halalas' => 10_000, 'final_share_halalas' => 3_333])->save();
    expect((string) $event->fresh()->cost_per_person)->toBe('33.33');

    $pricing = VenuePricing::factory()->create(['price' => 150]);
    expect($pricing->price_halalas)->toBe(15_000)
        ->and((string) $pricing->price)->toBe('150.00');
});

test('percentage subsidy semantics: path A = 100%, floor arithmetic, capped by the total', function () {
    $event = Event::factory()->create(['total_amount' => 300.0]);
    $event->forceFill(['subsidy_type' => 'percentage', 'subsidy_value' => 100])->save();
    expect($event->fresh()->plannedSubsidyHalalas())->toBe(30_000);

    $event->forceFill(['subsidy_value' => 33])->save();
    // 30000 × 33 ÷ 100 = 9900 — قسمة صحيحة بلا تقريب لأعلى.
    expect($event->fresh()->plannedSubsidyHalalas())->toBe(9_900);

    // fixed أكبر من الإجمالي يُسقف به.
    $event->forceFill(['subsidy_type' => 'fixed', 'subsidy_value' => 99_999])->save();
    expect($event->fresh()->plannedSubsidyHalalas())->toBe(30_000);
});

test('activity unit prices are integer halalas behind the legacy name', function () {
    $unit = ActivityUnit::factory()->create(['price' => 400]);

    expect($unit->price_halalas)->toBe(40_000)
        ->and((string) $unit->price)->toBe('400.00');
});
