<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * صندوق التنبيهات الحرجة لأدمن تيمات (H §20 — «تنبيه فوري لأدمن تيمات عند:
 * فشل ويبهوك دفع · فشل مهمة مجدولة حرجة · رصيد محفظة سالب · فشل استرداد …»).
 *
 * هذه القناة داخل المنصة هي ما يملكه الكود؛ التنبيه الفعلي (بريد/Slack/paging)
 * بنية تحتية يملكها المالك — ووجهتها إعداد لا كود.
 */
#[Fillable([
    'key',
    'level',
    'title',
    'body',
    'context',
    'fingerprint',
    'occurrences',
    'last_seen_at',
    'acknowledged_at',
    'acknowledged_by',
])]
class AdminAlert extends Model
{
    public const LEVEL_CRITICAL = 'critical';

    public const LEVEL_WARNING = 'warning';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'context' => 'array',
            'occurrences' => 'integer',
            'last_seen_at' => 'datetime',
            'acknowledged_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOpen($query)
    {
        return $query->whereNull('acknowledged_at');
    }
}
