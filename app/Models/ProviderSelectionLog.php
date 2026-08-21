<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * سجل اختيار المزوّد عند إنشاء الفعالية. سبب التجاوز إلزامي — أسباب التجاوز
 * هي المادة الوحيدة التي ستُبنى عليها أتمتة الاختيار لاحقاً (H §11).
 */
#[Fillable([
    'event_id',
    'community_id',
    'chosen_partner_id',
    'suggested_partner_id',
    'was_override',
    'override_reason',
    'suggestions_json',
    'actor_user_id',
])]
class ProviderSelectionLog extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'was_override' => 'boolean',
            'suggestions_json' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function chosenPartner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'chosen_partner_id');
    }
}
