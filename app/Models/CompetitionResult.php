<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use App\Support\Competition\MeasurementUnits;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * نتيجة مسابقة (H §13). نوعا القياس الوحيدان في الإصدار الأول:
 * `individual_value` (وقت · مسافة · عدد بوحدة من الكتالوج المركزي) و
 * `consistency` (عدد الفعاليات المكتملة بحضور — يحتسبه النظام من الحضور
 * ولا يُدخل يدوياً).
 *
 * **جاهزية الدوري المؤجل بلا كسر المخطط:** الصف لا يفترض أن الفاعل موظف ولا
 * أن المصدر فعالية — `subject_type/subject_id` و`source_type/source_id`
 * تستوعب `match_team` و`match` لاحقاً بلا أي migration.
 *
 * القيمة عدد صحيح مقياسه {@see self::SCALE} — لا عوامات في الترتيب.
 */
#[Fillable([
    'company_id',
    'community_id',
    'season_id',
    'subject_type',
    'subject_id',
    'employee_id',
    'source_type',
    'source_id',
    'event_id',
    'measurement_type',
    'unit',
    'value_scaled',
    'recorded_by_user_id',
    'recorded_at',
    'notes',
])]
class CompetitionResult extends Model
{
    use HasFactory, ScopedToCompany;

    /** ثابت التحجيم: القيمة تُخزَّن مضروبة فيه لتبقى عدداً صحيحاً. */
    public const SCALE = 10000;

    public const TYPE_INDIVIDUAL_VALUE = 'individual_value';

    public const TYPE_CONSISTENCY = 'consistency';

    public const SUBJECT_EMPLOYEE = 'employee';

    /** محجوز للدوري المؤجل — لا يُكتب في الإصدار الأول. */
    public const SUBJECT_MATCH_TEAM = 'match_team';

    public const SOURCE_EVENT = 'event';

    /** محجوز للدوري المؤجل — لا يُكتب في الإصدار الأول. */
    public const SOURCE_MATCH = 'match';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subject_id' => 'integer',
            'source_id' => 'integer',
            'value_scaled' => 'integer',
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * القيمة كما يراها المستخدم (ريال-ستايل: تحويل عند القراءة فقط).
     */
    public function getValueAttribute(): ?float
    {
        return $this->value_scaled === null
            ? null
            : (float) ($this->value_scaled / self::SCALE);
    }

    public static function toScaled(int|float|string $value): int
    {
        return (int) round(((float) $value) * self::SCALE);
    }

    /**
     * القيمة منسّقة بدقة وحدتها من الكتالوج المركزي.
     */
    public function formattedValue(): ?string
    {
        if ($this->value_scaled === null) {
            return null;
        }

        return MeasurementUnits::format($this->unit, (float) $this->value_scaled / self::SCALE);
    }

    /**
     * @return BelongsTo<Season, $this>
     */
    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }

    /**
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * سجل التصحيحات — لا تُحذف نتيجة ولا يُطمس تصحيح (H §13).
     *
     * @return HasMany<CompetitionResultChange, $this>
     */
    public function changes(): HasMany
    {
        return $this->hasMany(CompetitionResultChange::class);
    }
}
