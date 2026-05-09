<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexClubRequest;
use App\Http\Requests\Admin\StoreClubRequest;
use App\Http\Requests\Admin\UpdateClubRequest;
use App\Models\Club;
use App\Services\Admin\ClubService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class ClubController extends Controller
{
    public function __construct(
        private ClubService $clubService,
    ) {}

    /**
     * List clubs with optional filters.
     */
    public function index(IndexClubRequest $request): Response
    {
        $filters = $request->validated();

        $clubs = $this->clubService->list($filters);
        $stats = $this->clubService->dashboardStats();

        return Inertia::render('admin/clubs/index', [
            'clubs' => $clubs,
            'stats' => $stats,
            'filters' => $filters,
            'sports' => \App\Models\Sport::select('id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new club.
     */
    public function create(): Response
    {
        return Inertia::render('admin/clubs/create');
    }

    /**
     * Store a newly created club.
     */
    public function store(StoreClubRequest $request): RedirectResponse
    {
        Gate::authorize('create', Club::class);

        $data = $request->validated();
        $data['status'] = 'active';
        $sportIds = $data['sport_ids'] ?? [];
        unset($data['sport_ids']);

        $club = Club::create($data);
        $club->sports()->sync($sportIds);

        return redirect()->route('admin.clubs.index')
            ->with('success', 'تم إنشاء النادي بنجاح.');
    }

    /**
     * Show the form for editing the specified club.
     */
    public function edit(Club $club): Response
    {
        return Inertia::render('admin/clubs/edit', [
            'club' => $club,
        ]);
    }

    /**
     * Update the specified club.
     */
    public function update(UpdateClubRequest $request, Club $club): RedirectResponse
    {
        Gate::authorize('update', $club);

        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $sportIds = $data['sport_ids'] ?? null;
        unset($data['sport_ids']);

        $club->update($data);

        if ($sportIds !== null) {
            $club->sports()->sync($sportIds);
        }

        return back()->with('success', 'تم تحديث النادي بنجاح.');
    }

    /**
     * Approve a pending club.
     */
    public function approve(Club $club): RedirectResponse
    {
        $this->clubService->approve($club);

        return back()->with('success', 'تمت الموافقة على النادي بنجاح.');
    }

    /**
     * Reject a pending club.
     */
    public function reject(Club $club): RedirectResponse
    {
        $this->clubService->reject($club);

        return back()->with('success', 'تم رفض طلب النادي.');
    }

    /**
     * Send a password reset link to the club.
     */
    public function sendResetPassword(Club $club): RedirectResponse
    {
        $status = Password::broker('clubs')->sendResetLink(
            ['email' => $club->email]
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.')
            : back()->with('error', 'فشل إرسال رابط إعادة تعيين كلمة المرور.');
    }

    /**
     * Remove the specified club.
     */
    public function destroy(Club $club): RedirectResponse
    {
        Gate::authorize('delete', $club);

        $club->delete();

        return redirect()->route('admin.clubs.index')
            ->with('success', 'تم حذف النادي بنجاح.');
    }
}
