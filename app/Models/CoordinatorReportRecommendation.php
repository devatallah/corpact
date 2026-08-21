<?php

namespace App\Models;

use App\Enums\ReportAction;
use App\Enums\ReportCause;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * توصية واحدة = زوج (سبب ← إجراء) من **قائمتين مغلقتين** (H §15).
 *
 * الحقلان enum مصبوبان: قيمة خارج القائمة ترمي `ValueError` قبل أن تصل
 * قاعدة البيانات، وقيد `check` هناك يسدّ المسار الخام. لا حقل نص هنا — حقل
 * الملاحظة **واحد على التقرير كله**، لا واحد لكل توصية.
 */
#[Fillable([
    'coordinator_monthly_report_id',
    'community_id',
    'cause',
    'action',
    'created_by_user_id',
])]
class CoordinatorReportRecommendation extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cause' => ReportCause::class,
            'action' => ReportAction::class,
        ];
    }

    /**
     * @return BelongsTo<CoordinatorMonthlyReport, $this>
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(CoordinatorMonthlyReport::class, 'coordinator_monthly_report_id');
    }

    /**
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class)->withoutGlobalScopes();
    }

    /**
     * @return array<string, mixed>
     */
    public function toDisplayArray(): array
    {
        return [
            'id' => (int) $this->id,
            'community_id' => $this->community_id === null ? null : (int) $this->community_id,
            'community_name' => $this->community?->name,
            'cause' => $this->cause->value,
            'cause_label' => $this->cause->label(),
            'action' => $this->action->value,
            'action_label' => $this->action->label(),
        ];
    }
}
