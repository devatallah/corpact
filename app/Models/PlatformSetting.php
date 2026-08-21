<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * H §21 `settings` — «العتبات والمهل على مستوى المنصة» (H §16 الإعدادات).
 * A7 parked the waitlist offer windows in `config/events.php` «وواجهة إدارتها
 * مع A15»; this is that store.
 */
#[Fillable(['key', 'value', 'updated_by_user_id'])]
class PlatformSetting extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }
}
