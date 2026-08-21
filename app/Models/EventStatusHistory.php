<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * سجل انتقالات آلة حالات الفعالية (H §9): كل انتقال — آلياً كان أو يدوياً —
 * سطر واحد بالفاعل والسبب والوقت. لا تعديل ولا حذف.
 */
#[Fillable([
    'event_id',
    'from_status',
    'to_status',
    'actor_type',
    'actor_id',
    'reason',
    'is_manual',
    'metadata',
    'created_at',
])]
class EventStatusHistory extends Model
{
    protected $table = 'event_status_history';

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_manual' => 'boolean',
            'metadata' => 'array',
            'created_at' => 'datetime',
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
     * @return MorphTo<Model, $this>
     */
    public function actor(): MorphTo
    {
        return $this->morphTo();
    }
}
