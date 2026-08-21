<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * فرع المزوّد — يتبع مزوّداً واحداً (H §11): العنوان، الإحداثيات، أوقات
 * العمل، جهة اتصال الفرع.
 */
#[Fillable([
    'partner_id',
    'name',
    'address',
    'city',
    'district',
    'latitude',
    'longitude',
    'working_hours',
    'contact_name',
    'contact_phone',
    'status',
])]
class ProviderBranch extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'working_hours' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return HasMany<ActivityUnit, $this>
     */
    public function units(): HasMany
    {
        return $this->hasMany(ActivityUnit::class);
    }

    /**
     * هل النافذة المطلوبة تقع داخل أوقات عمل الفرع؟ فرع بلا أوقات عمل
     * مسجلة يُعامل كمفتوح (بيانات قديمة قبل الترحيل).
     */
    public function isWithinWorkingHours(CarbonInterface $start, CarbonInterface $end): bool
    {
        $hours = $this->working_hours;

        if (empty($hours)) {
            return true;
        }

        $dayKey = strtolower($start->format('D')); // sun, mon, ...
        $windows = $hours[$dayKey] ?? [];

        if ($windows === []) {
            return false;
        }

        $startTime = $start->format('H:i');
        $endTime = $end->format('H:i');

        // نافذة تنتهي منتصف الليل تُخزَّن حتى 23:59
        if ($endTime === '00:00') {
            $endTime = '24:00';
        }

        foreach ($windows as $window) {
            $to = ($window['to'] ?? '23:59') === '23:59' ? '24:00' : $window['to'];
            if (($window['from'] ?? '00:00') <= $startTime && $endTime <= $to) {
                return true;
            }
        }

        return false;
    }
}
