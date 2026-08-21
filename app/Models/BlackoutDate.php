<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * أيام الحظر — يديرها أدمن تيمات (إجازات/رمضان — H §8): الفعالية المولَّدة
 * من قالب والواقعة في نطاق حظر تُتخطى افتراضياً أو تُزاح أسبوعاً حسب إعداد
 * القالب. تسري لحظة التوليد فقط — لا تمس فعاليات مولّدة سلفاً.
 */
#[Fillable([
    'name',
    'starts_on',
    'ends_on',
    'created_by',
])]
class BlackoutDate extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_on' => 'date:Y-m-d',
            'ends_on' => 'date:Y-m-d',
        ];
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeCovering(Builder $query, CarbonInterface $date): Builder
    {
        return $query
            ->whereDate('starts_on', '<=', $date->toDateString())
            ->whereDate('ends_on', '>=', $date->toDateString());
    }

    public static function coveringDate(CarbonInterface $date): ?self
    {
        return static::query()->covering($date)->orderBy('starts_on')->first();
    }
}
