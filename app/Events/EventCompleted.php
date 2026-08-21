<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

/**
 * تُطلق عند انتقال فعالية إلى completed (A1's lifecycle). المستمعون الحاليون:
 * A9 — +3 لموثوقية المزوّد عند اكتمال الفعالية بلا مشاكل (H §11).
 */
class EventCompleted
{
    use Dispatchable;

    public function __construct(public int $eventId) {}
}
