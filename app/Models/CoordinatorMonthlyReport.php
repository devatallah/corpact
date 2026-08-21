<?php

namespace App\Models;

use App\Exceptions\ImmutableReportSnapshotException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A13 — التقرير الشهري كـ**لقطة ثابتة لكل شهر** (H §15: «يُحفظ نسخة ثابتة
 * لكل شهر»).
 *
 * `snapshot` يُكتب مرة واحدة عند التوليد ولا يُمسّ بعدها: تقرير أغسطس هو ما
 * قيل في 2 سبتمبر، وتعديل حضور متأخر لا يعيد كتابة الماضي. القابل للتحرير
 * بعد التوليد شيئان فقط: **توصيات من القائمة المغلقة**، و**حقل ملاحظة واحد**.
 *
 * الحذف ممنوع كذلك — تقرير مُسلَّم لمسؤول الحساب وأدمن المنصة سجلٌّ لا مسوّدة.
 */
#[Fillable([
    'company_id',
    'coordinator_user_id',
    'period_key',
    'period_start',
    'period_end',
    'status',
    'snapshot',
    'note',
    'generated_at',
    'delivered_at',
    'submitted_at',
])]
class CoordinatorMonthlyReport extends Model
{
    public const STATUS_GENERATED = 'generated';

    public const STATUS_SUBMITTED = 'submitted';

    /** الأعمدة التي لا تتغير بعد التوليد أبداً. */
    private const IMMUTABLE = ['snapshot', 'period_key', 'period_start', 'period_end', 'company_id', 'generated_at'];

    protected static function booted(): void
    {
        static::updating(function (self $report): void {
            foreach (self::IMMUTABLE as $column) {
                if ($report->isDirty($column)) {
                    throw ImmutableReportSnapshotException::forColumn($column);
                }
            }
        });

        static::deleting(function (): never {
            throw new ImmutableReportSnapshotException(
                'لا يُحذف تقرير شهري — اللقطة الشهرية سجل ثابت (H §15).'
            );
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'period_start' => 'datetime',
            'period_end' => 'datetime',
            'generated_at' => 'datetime',
            'delivered_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinator_user_id');
    }

    /**
     * @return HasMany<CoordinatorReportRecommendation, $this>
     */
    public function recommendations(): HasMany
    {
        return $this->hasMany(CoordinatorReportRecommendation::class);
    }

    /**
     * قيمة من داخل اللقطة بمسار نقطي — القراءة الوحيدة المسموحة للصفحات.
     */
    public function metric(string $path, mixed $default = null): mixed
    {
        return data_get($this->snapshot, $path, $default);
    }
}
