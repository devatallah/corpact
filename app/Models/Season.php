<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * موسم مسابقات لمجتمع (H §13): المجتمع والنشاط والاسم وتاريخا البداية
 * والنهاية والحالة. الافتراضي موسم ربع سنوي يُنشأ تلقائياً لكل مجتمع
 * (`is_auto` + `period_key`)، والقائد أو أدمن تيمات يستطيعان إنشاء مواسم
 * مخصصة.
 *
 * عند الإغلاق تُؤرشف اللوحة كنسخة نهائية ثابتة في `leaderboard_snapshots`،
 * **ولا تُحذف أي نتيجة** — النتائج تبقى مرتبطة بموسمها إلى الأبد، والموسم
 * الجديد يبدأ بترتيب صفري لأن كل استعلامات اللوحة محصورة بموسمها.
 */
#[Fillable([
    'company_id',
    'community_id',
    'category_id',
    'name',
    'starts_on',
    'ends_on',
    'status',
    'period_key',
    'is_auto',
    'closed_at',
    'closed_by_user_id',
])]
class Season extends Model
{
    use HasFactory, ScopedToCompany;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_CLOSED = 'closed';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_on' => 'date:Y-m-d',
            'ends_on' => 'date:Y-m-d',
            'is_auto' => 'boolean',
            'closed_at' => 'datetime',
        ];
    }

    public function isClosed(): bool
    {
        return $this->status === self::STATUS_CLOSED;
    }

    /**
     * @return BelongsTo<Community, $this>
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<CompetitionResult, $this>
     */
    public function results(): HasMany
    {
        return $this->hasMany(CompetitionResult::class);
    }

    /**
     * @return HasMany<LeaderboardSnapshot, $this>
     */
    public function snapshots(): HasMany
    {
        return $this->hasMany(LeaderboardSnapshot::class);
    }
}
