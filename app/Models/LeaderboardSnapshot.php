<?php

namespace App\Models;

use App\Models\Concerns\ScopedToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use RuntimeException;

/**
 * أرشيف لوحة الصدارة عند إغلاق الموسم (H §13): «تُؤرشف اللوحة كنسخة نهائية
 * ثابتة، ولا تُحذف أي نتيجة».
 *
 * النسخة **غير قابلة للتعديل ولا للحذف** — الحارس أدناه يرفض أي محاولة على
 * مستوى النموذج، فلا يوجد مسار كود واحد يغيّر أرشيفاً بعد كتابته.
 */
#[Fillable([
    'company_id',
    'community_id',
    'season_id',
    'board',
    'level',
    'unit',
    'payload',
    'generated_at',
    'created_at',
])]
class LeaderboardSnapshot extends Model
{
    use ScopedToCompany;

    public const UPDATED_AT = null;

    public const BOARD_SKILL = 'skill';

    public const BOARD_CONSISTENCY = 'consistency';

    public const LEVEL_INDIVIDUAL = 'individual';

    public const LEVEL_DEPARTMENT = 'department';

    protected static function booted(): void
    {
        static::updating(function (): void {
            throw new RuntimeException('أرشيف لوحة الموسم نسخة نهائية ثابتة — لا يُعدَّل.');
        });

        static::deleting(function (): void {
            throw new RuntimeException('أرشيف لوحة الموسم لا يُحذف — لا تُحذف أي نتيجة.');
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'generated_at' => 'datetime',
            'created_at' => 'datetime',
        ];
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
}
