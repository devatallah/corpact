<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\RoleAssignment;
use App\Models\Season;
use App\Services\Authorization\AuthorizationService;
use App\Services\Competition\BoardService;
use App\Services\Competition\SeasonService;
use App\Support\Competition\MeasurementUnits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

/**
 * لوحتا الصدارة للموظف (H §13 · G/الموظف — اللوحات): مهارة ومواظبة، فردي
 * وعلى مستوى الإدارة، مع **منتقي الموسم**. المواظبة أولاً لأنها «أهم من
 * لوحة المهارة سلوكياً». لا مقارنة بين الشركات في أي مكان — كل لوحة محصورة
 * بمجتمع من مجتمعات شركة الموظف.
 */
class LeaderboardController extends Controller
{
    public function __construct(
        private BoardService $boards,
        private SeasonService $seasons,
        private AuthorizationService $authorization,
    ) {}

    public function index(Request $request): Response
    {
        $employee = auth('employee')->user();

        // مجتمعات الموظف الحالية + أي مجتمع سبق أن كان عضواً فيه (الترتيب
        // يبقى بعد المغادرة — قيد A5: صفوف العضوية التاريخية لا تُحذف).
        $communityIds = $employee->communityMemberships()->pluck('community_id')->unique();

        $communities = Community::query()
            ->whereIn('id', $communityIds)
            ->orderBy('name')
            ->get(['id', 'name', 'company_id', 'category_id']);

        $communityId = (int) ($request->integer('community') ?: ($communities->first()->id ?? 0));
        $community = $communities->firstWhere('id', $communityId);

        if ($community === null) {
            return Inertia::render('employee/leaderboards/index', [
                'communities' => $communities,
                'community' => null,
                'seasons' => [],
                'season' => null,
                'boards' => null,
                'units' => MeasurementUnits::forUi(),
                'canManageSeasons' => false,
                'myEmployeeId' => $employee->id,
            ]);
        }

        // الموسم الحالي يُنشأ كسولاً إن لم يوجد — فلا تظهر صفحة بلا موسم.
        $this->seasons->seasonFor($community);

        $seasons = Season::query()
            ->where('community_id', $community->id)
            ->orderByDesc('starts_on')
            ->get(['id', 'name', 'starts_on', 'ends_on', 'status', 'is_auto']);

        $seasonId = (int) ($request->integer('season') ?: ($seasons->first()->id ?? 0));
        $season = $seasons->firstWhere('id', $seasonId) ?? $seasons->first();

        $boards = $season === null
            ? null
            : $this->boards->seasonBoards(Season::query()->findOrFail($season->id));

        return Inertia::render('employee/leaderboards/index', [
            'communities' => $communities,
            'community' => $community,
            'seasons' => $seasons,
            'season' => $season,
            'boards' => $boards,
            'units' => MeasurementUnits::forUi(),
            'canManageSeasons' => $this->canManageSeasons($community->id),
            'myEmployeeId' => $employee->id,
        ]);
    }

    /**
     * موسم مخصص — «القائد أو أدمن تيمات» (H §13).
     */
    public function storeSeason(Request $request, Community $community): RedirectResponse
    {
        $this->assertCanManageSeasons($community->id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
        ], [
            'name.required' => 'اسم الموسم مطلوب.',
            'starts_on.required' => 'تاريخ بداية الموسم مطلوب.',
            'ends_on.required' => 'تاريخ نهاية الموسم مطلوب.',
            'ends_on.after_or_equal' => 'نهاية الموسم لا تسبق بدايته.',
        ]);

        $employee = auth('employee')->user();

        try {
            $this->seasons->createCustom(
                $community,
                $data['name'],
                new \DateTimeImmutable($data['starts_on']),
                new \DateTimeImmutable($data['ends_on']),
                $employee?->user,
            );
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'أُنشئ الموسم.');
    }

    /**
     * إغلاق الموسم: تُؤرشف اللوحة كنسخة نهائية ثابتة، ولا تُحذف أي نتيجة،
     * والموسم التالي يبدأ من الصفر.
     */
    public function closeSeason(Season $season): RedirectResponse
    {
        $this->assertCanManageSeasons((int) $season->community_id);

        if ($season->isClosed()) {
            return back()->with('error', 'الموسم مغلق أصلاً — أرشيفه نسخة نهائية لا تُعاد كتابتها.');
        }

        $employee = auth('employee')->user();

        $this->seasons->close($season, $employee?->user);

        return back()->with('success', 'أُغلق الموسم وأُرشفت لوحاته — لم تُحذف أي نتيجة.');
    }

    private function canManageSeasons(int $communityId): bool
    {
        $user = auth('employee')->user()?->user;

        return $user !== null && $this->authorization->can(
            $user,
            'season.manage',
            RoleAssignment::SCOPE_COMMUNITY,
            $communityId,
        );
    }

    private function assertCanManageSeasons(int $communityId): void
    {
        if (! $this->canManageSeasons($communityId)) {
            abort(403, 'إنشاء المواسم وإغلاقها لقائد المجتمع أو أدمن تيمات.');
        }
    }
}
