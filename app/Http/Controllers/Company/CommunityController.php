<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreCommunityRequest;
use App\Http\Requests\Company\UpdateCommunityRequest;
use App\Models\Community;
use App\Services\Company\CommunityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function __construct(
        private CommunityService $communityService,
    ) {}

    /**
     * List communities for the authenticated company.
     */
    public function index(): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $communities = $this->communityService->listForCompany($company);

        return Inertia::render('company/communities/index', [
            'company' => $company,
            'communities' => $communities,
            'sports' => \App\Models\Sport::select('id', 'name', 'icon')->orderBy('name')->get(),
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Show the form for creating a new community.
     */
    public function create(): Response
    {
        $company = auth('company')->user();

        return Inertia::render('company/communities/create', [
            'employees' => \App\Models\Employee::where('company_id', $company->id)->active()->select('id', 'name')->orderBy('name')->get(),
            'sports' => \App\Models\Sport::select('id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new community.
     */
    public function store(StoreCommunityRequest $request): RedirectResponse
    {
        Gate::authorize('create', Community::class);

        $company = auth('company')->user();

        $data = $request->validated();

        $this->communityService->create($company, $data);

        return redirect()->route('company.communities.index')
            ->with('success', 'تم إنشاء المجتمع بنجاح.');
    }

    /**
     * Show the form for editing the specified community.
     */
    public function edit(Community $community): Response
    {
        $company = auth('company')->user();

        return Inertia::render('company/communities/edit', [
            'community' => $community->load('leader', 'sport'),
            'employees' => \App\Models\Employee::where('company_id', $company->id)->active()->select('id', 'name')->orderBy('name')->get(),
            'sports' => \App\Models\Sport::select('id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified community.
     */
    public function update(UpdateCommunityRequest $request, Community $community): RedirectResponse
    {
        Gate::authorize('update', $community);

        $company = auth('company')->user();

        $data = $request->validated();

        if (isset($data['leader_id'])) {
            $newLeader = \App\Models\Employee::findOrFail($data['leader_id']);
            $this->communityService->changeLeader($company, $community, $newLeader);
            unset($data['leader_id']);
        }

        if (! empty($data)) {
            $community->update($data);
        }

        return back()->with('success', 'تم تحديث المجتمع بنجاح.');
    }

    /**
     * Remove the specified community.
     */
    public function destroy(Community $community): RedirectResponse
    {
        Gate::authorize('delete', $community);

        $community->delete();

        return redirect()->route('company.communities.index')
            ->with('success', 'تم حذف المجتمع بنجاح.');
    }
}
