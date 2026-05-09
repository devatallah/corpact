<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\UpdateProfileRequest;
use App\Services\Employee\ProfileService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileService $profileService,
    ) {}

    /**
     * Show the employee profile page.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $profileData = $this->profileService->profileData($employee);
        $myEvents = $this->profileService->myEvents($employee);
        $myCommunities = $this->profileService->myCommunities($employee);

        return Inertia::render('employee/profile/index', [
            'employee' => $profileData['employee'],
            'stats' => $profileData['stats'],
            'events' => $myEvents,
            'communities' => $myCommunities,
        ]);
    }

    /**
     * Update the employee profile.
     */
    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $employee = auth('employee')->user();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $employee->update($data);

        return back()->with('success', 'تم تحديث الملف الشخصي.');
    }
}
