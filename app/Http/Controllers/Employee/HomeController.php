<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PaymentIntent;
use App\Services\Competition\BoardService;
use App\Services\Employee\ChallengeService;
use App\Services\Employee\EmployeeStatsService;
use App\Services\Employee\HomeService;
use App\Services\Employee\QuickMatchService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private HomeService $homeService,
        private EmployeeStatsService $employeeStatsService,
        private BoardService $boardService,
        private ChallengeService $challengeService,
        private QuickMatchService $quickMatchService,
    ) {}

    /**
     * Show the employee home page.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $events = $this->homeService->upcomingEvents($employee);

        $joinedEventIds = $employee->events()
            ->whereIn('events.id', $events->pluck('id'))
            ->wherePivot('seat_status', 'reserved')
            ->pluck('events.id')
            ->all();

        return Inertia::render('employee/home', [
            'pendingPayment' => $this->pendingPayment($employee),
            'employee' => $employee,
            'communities' => $this->homeService->myCommunities($employee),
            'events' => $events,
            'joinedEventIds' => $joinedEventIds,
            'activityStats' => $this->employeeStatsService->getStats($employee),
            'challenges' => $this->challengeService->getActiveChallenges($employee),
            'leaderboard' => $this->boardService->companyOverview($employee->company_id),
            'quickMatches' => $this->quickMatchService->getForEmployee($employee),
        ]);
    }

    /**
     * H §12.3 — المطالبة المفتوحة: حصة محجوزة بانتظار السداد ومهلتها لم تنتهِ.
     *
     * أول ما تعرضه الشاشة لأن انقضاء المهلة يُسقط المقعد ويُعرض على قائمة
     * الانتظار، فتأخيرها أسفل الصفحة يكلّف الموظف مقعده.
     */
    private function pendingPayment(Employee $employee): ?array
    {
        $intent = PaymentIntent::query()
            ->where('employee_id', $employee->id)
            ->where('status', PaymentIntent::STATUS_PENDING)
            ->where('expires_at', '>', now())
            ->with(['event.community:id,name', 'event.partner:id,name'])
            ->orderBy('expires_at')
            ->first();

        if ($intent === null || $intent->event === null) {
            return null;
        }

        return [
            'id' => $intent->id,
            'amount' => $intent->amount_halalas / 100,
            'expires_at' => $intent->expires_at->toIso8601String(),
            'minutes_left' => (int) max(0, now()->diffInMinutes($intent->expires_at, false)),
            'event' => [
                'id' => $intent->event->id,
                'title' => $intent->event->title,
                'event_date' => $intent->event->event_date?->toDateString(),
                'start_time' => $intent->event->start_time,
                'community_name' => $intent->event->community?->name,
                'partner_name' => $intent->event->partner?->name,
            ],
        ];
    }
}
