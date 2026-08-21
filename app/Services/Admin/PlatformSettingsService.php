<?php

namespace App\Services\Admin;

use App\Models\PlatformSetting;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use App\Support\Identity\CurrentActor;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A15 — the admin-managed platform thresholds (H §16 «العتبات والمهل»,
 * G/أدمن تيمات §4: «العتبات والمهل على مستوى المنصة، ومنها مهلة قائمة
 * الانتظار (لا تُضبط من القالب)»).
 *
 * Each setting names the `config()` key it overrides, so the engines that
 * already read config (A7's waitlist, provider deadlines…) keep working
 * untouched — {@see self::apply()} pushes the stored overrides into the
 * config repository once per request.
 */
class PlatformSettingsService
{
    public const CACHE_KEY = 'platform_settings.overrides';

    /**
     * The editable surface. Anything not listed here cannot be written from
     * the admin screen.
     *
     * @return array<string, array{config: string, label: string, unit: string, min: int, max: int, group: string, hint: string}>
     */
    public static function schema(): array
    {
        return [
            'waitlist.offer_minutes' => [
                'config' => 'events.waitlist.offer_minutes',
                'label' => 'مهلة عرض مقعد قائمة الانتظار',
                'unit' => 'دقيقة',
                'min' => 5,
                'max' => 1440,
                'group' => 'قائمة الانتظار',
                'hint' => 'المهلة الافتراضية لتأكيد المقعد المعروض (G/ملحق أ: 120 دقيقة).',
            ],
            'waitlist.offer_minutes_near_close' => [
                'config' => 'events.waitlist.offer_minutes_near_close',
                'label' => 'مهلة العرض قرب الإغلاق',
                'unit' => 'دقيقة',
                'min' => 5,
                'max' => 720,
                'group' => 'قائمة الانتظار',
                'hint' => 'تُستخدم إذا تبقّى أقل من «ساعات اقتراب الإغلاق» (G/ملحق أ: 30 دقيقة).',
            ],
            'waitlist.near_close_hours' => [
                'config' => 'events.waitlist.near_close_hours',
                'label' => 'ساعات اقتراب الإغلاق',
                'unit' => 'ساعة',
                'min' => 1,
                'max' => 48,
                'group' => 'قائمة الانتظار',
                'hint' => 'دونها تُطبَّق المهلة القصيرة (G/ملحق أ: 6 ساعات).',
            ],
            'waitlist.instant_promotion_within_hours' => [
                'config' => 'events.waitlist.instant_promotion_within_hours',
                'label' => 'الترقية الفورية دون',
                'unit' => 'ساعة',
                'min' => 1,
                'max' => 24,
                'group' => 'قائمة الانتظار',
                'hint' => 'أقل من هذه المدة على الإغلاق: الأسبق يفوز بلا عرض (G/ملحق أ: ساعة).',
            ],
            'proposal_approval_hours' => [
                'config' => 'events.proposal_approval_hours',
                'label' => 'مهلة اعتماد اقتراح الموظف',
                'unit' => 'ساعة',
                'min' => 1,
                'max' => 168,
                'group' => 'الفعاليات',
                'hint' => 'بانقضائها يُرفض الاقتراح تلقائياً (G/ملحق أ: 48 ساعة).',
            ],
            'provider_response_hours' => [
                'config' => 'events.provider_response_hours',
                'label' => 'مهلة رد المزوّد',
                'unit' => 'ساعة',
                'min' => 1,
                'max' => 72,
                'group' => 'المزوّدون',
                'hint' => 'أو حتى «الحد الأدنى قبل البدء» أيهما أقرب (G/ملحق أ: 12 ساعة).',
            ],
            'provider_response_min_hours_before_start' => [
                'config' => 'events.provider_response_min_hours_before_start',
                'label' => 'أقل مهلة رد قبل البدء',
                'unit' => 'ساعة',
                'min' => 1,
                'max' => 48,
                'group' => 'المزوّدون',
                'hint' => 'G/ملحق أ: 6 ساعات.',
            ],
            'alternative_response_hours' => [
                'config' => 'events.alternative_response_hours',
                'label' => 'مهلة الرد على الوقت البديل',
                'unit' => 'ساعة',
                'min' => 1,
                'max' => 72,
                'group' => 'المزوّدون',
                'hint' => 'G/ملحق أ: 12 ساعة.',
            ],
            'alternative_free_withdrawal_hours' => [
                'config' => 'events.alternative_free_withdrawal_hours',
                'label' => 'نافذة الانسحاب الحر بعد قبول البديل',
                'unit' => 'ساعة',
                'min' => 1,
                'max' => 48,
                'group' => 'المزوّدون',
                'hint' => 'G/ملحق أ: 6 ساعات.',
            ],
        ];
    }

    /**
     * Stored overrides, keyed by setting key.
     *
     * @return array<string, int>
     */
    public function overrides(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            if (! Schema::hasTable('platform_settings')) {
                return [];
            }

            return PlatformSetting::query()
                ->pluck('value', 'key')
                ->map(fn ($value) => is_array($value) ? ($value['value'] ?? null) : $value)
                ->filter(fn ($value) => $value !== null)
                ->map(fn ($value) => (int) $value)
                ->all();
        });
    }

    /**
     * Current effective values (override ?? config default).
     *
     * @return array<string, int>
     */
    public function values(): array
    {
        $overrides = $this->overrides();
        $values = [];

        foreach (self::schema() as $key => $definition) {
            $values[$key] = (int) ($overrides[$key] ?? config($definition['config']));
        }

        return $values;
    }

    /**
     * Push stored overrides into the config repository for this request, so
     * every engine that already reads `config('events.…')` honours them.
     */
    public function apply(): void
    {
        $overrides = $this->overrides();

        if ($overrides === []) {
            return;
        }

        $schema = self::schema();

        foreach ($overrides as $key => $value) {
            if (isset($schema[$key])) {
                config([$schema[$key]['config'] => $value]);
            }
        }
    }

    /**
     * @param  array<string, int|string>  $values
     */
    public function update(array $values): void
    {
        $schema = self::schema();
        $before = $this->values();
        ['id' => $actorId] = CurrentActor::resolve();

        DB::transaction(function () use ($values, $schema, $actorId) {
            foreach ($values as $key => $value) {
                if (! isset($schema[$key])) {
                    continue;
                }

                PlatformSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => ['value' => (int) $value], 'updated_by_user_id' => $actorId],
                );
            }
        });

        Cache::forget(self::CACHE_KEY);

        $after = $this->values();

        AuditLogService::record(
            action: AuditAction::PLATFORM_SETTING_UPDATED,
            before: array_intersect_key($before, $after),
            after: array_diff_assoc($after, $before) ?: $after,
            reason: 'تعديل عتبات ومهل المنصة من لوحة الأدمن',
        );
    }
}
