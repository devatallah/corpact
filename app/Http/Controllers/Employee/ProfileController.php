<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\UpdateProfileRequest;
use App\Services\Employee\EmployeeStatsService;
use App\Services\Employee\ProfileService;
use App\Services\Notifications\PreferenceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileService $profileService,
        private EmployeeStatsService $employeeStatsService,
        private PreferenceService $preferences,
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
            'activityStats' => $this->employeeStatsService->getStats($employee),
            // A14 — H §14: القوالب الاختيارية وحدها قابلة للإيقاف.
            'notificationPreferences' => $this->preferences->editable($employee),
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
            // Private default disk (S3 in production); served via signed URLs.
            // Raw DB value, not the accessor (which resolves to a signed URL).
            $oldAvatar = $employee->getRawOriginal('avatar');

            $data['avatar'] = $request->file('avatar')->store('avatars');

            if ($oldAvatar && ! str_starts_with($oldAvatar, '/') && ! str_starts_with($oldAvatar, 'http')) {
                Storage::delete($oldAvatar);
            }
        }

        $employee->update($data);

        return back()->with('success', 'تم تحديث الملف الشخصي.');
    }
}
