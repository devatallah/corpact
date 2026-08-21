<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

class EventParticipant extends Pivot
{
    protected $table = 'event_participants';

    public $incrementing = true;

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'position' => 'integer',
            'offered_at' => 'datetime',
            'offer_expires_at' => 'datetime',
            // A12 — H §13: ختم تعديل الحضور («يظهر في سجله»).
            'attendance_marked_at' => 'datetime',
        ];
    }

    /**
     * سجل تغييرات هذا المشارك (participant_events — H §10).
     *
     * @return HasMany<ParticipantEvent, $this>
     */
    public function changeLog(): HasMany
    {
        return $this->hasMany(ParticipantEvent::class, 'event_id', 'event_id')
            ->where('employee_id', $this->employee_id);
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
}
