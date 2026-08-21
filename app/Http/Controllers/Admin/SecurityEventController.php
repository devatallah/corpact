<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * H §19 — «سجل أحداث أمنية منفصل (دخول فاشل، تغيير صلاحية، تغيير بيانات
 * بنكية)». A9 asked for this table explicitly; this is its screen.
 */
class SecurityEventController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'event' => ['sometimes', 'nullable', 'string', 'max:120'],
            'severity' => ['sometimes', 'nullable', 'string', 'max:16'],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date'],
            'sort' => ['sometimes', 'nullable', 'string'],
        ]);

        $direction = ($filters['sort'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $events = SecurityEvent::query()
            ->with(['actor:id,name', 'company:id,name'])
            ->when(filled($filters['search'] ?? null), fn ($query) => $query->where(fn ($inner) => $inner
                ->where('actor_name', 'like', '%'.$filters['search'].'%')
                ->orWhere('actor_identifier', 'like', '%'.$filters['search'].'%')
                ->orWhere('ip_address', 'like', '%'.$filters['search'].'%')))
            ->when(filled($filters['event'] ?? null), fn ($query) => $query->where('event', $filters['event']))
            ->when(filled($filters['severity'] ?? null), fn ($query) => $query->where('severity', $filters['severity']))
            ->when(filled($filters['from'] ?? null), fn ($query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when(filled($filters['to'] ?? null), fn ($query) => $query->whereDate('created_at', '<=', $filters['to']))
            ->orderBy('created_at', $direction)
            ->orderBy('id', $direction)
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SecurityEvent $event) => [
                'id' => $event->id,
                'event' => $event->event,
                'event_label' => SecurityEvent::label($event->event),
                'severity' => $event->severity,
                'actor_name' => $event->actor_name ?? $event->actor?->name,
                'actor_identifier' => $event->actor_identifier,
                'guard' => $event->guard,
                'subject_type' => $event->subject_type === null ? null : class_basename($event->subject_type),
                'subject_id' => $event->subject_id,
                'company' => $event->company?->only(['id', 'name']),
                'ip_address' => $event->ip_address,
                'user_agent' => $event->user_agent,
                'context' => $event->context,
                'created_at' => $event->created_at?->toIso8601String(),
            ]);

        $since = now()->subDay();

        return Inertia::render('admin/security/events', [
            'events' => $events,
            'filters' => $filters,
            'eventTypes' => collect(SecurityEvent::labels())
                ->map(fn (string $label, string $key) => ['value' => $key, 'label' => $label])
                ->values()
                ->all(),
            'stats' => [
                'total' => SecurityEvent::query()->count(),
                'critical_24h' => SecurityEvent::query()
                    ->where('severity', SecurityEvent::SEVERITY_CRITICAL)
                    ->where('created_at', '>=', $since)
                    ->count(),
                'failed_logins_24h' => SecurityEvent::query()
                    ->where('event', SecurityEvent::LOGIN_FAILED)
                    ->where('created_at', '>=', $since)
                    ->count(),
                'permission_changes_24h' => SecurityEvent::query()
                    ->where('event', SecurityEvent::PERMISSION_CHANGED)
                    ->where('created_at', '>=', $since)
                    ->count(),
            ],
        ]);
    }
}
