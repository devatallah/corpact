<?php

namespace App\Services\Auth;

use App\Enums\Role;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Partner;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Support\Identity\PhoneNumber;
use App\Support\Tenancy\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Phone + OTP login for the employee / company (account manager) / partner
 * portals (H §4 auth matrix). A verified phone resolves to ONE global user;
 * what that user can open per portal comes from memberships and scoped role
 * assignments. Multi-scope users pick a context; every switch is audited.
 */
class OtpLoginService
{
    public function __construct(private PortalLoginService $portalLogin) {}

    /**
     * The global user a phone belongs to, or null.
     */
    public function userForPhone(string $phone): ?User
    {
        $normalized = PhoneNumber::normalize($phone);

        if ($normalized === null) {
            return null;
        }

        return User::query()->where('phone', $normalized)->first();
    }

    /**
     * Login options the user has on a portal. Each option:
     * ['id' => scope id, 'label' => display name].
     *
     * @return Collection<int, array{id: int, label: string}>
     */
    public function options(User $user, string $guard): Collection
    {
        return app(CompanyContext::class)->bypass(fn () => match ($guard) {
            'employee' => $user->activeMemberships()
                ->whereNotNull('employee_id')
                ->with('company:id,name,status')
                ->get()
                ->filter(fn ($m) => $m->company !== null && $m->company->status === 'active')
                ->map(fn ($m) => ['id' => $m->company_id, 'label' => $m->company->name])
                ->values(),

            'company' => $user->roleAssignments()
                ->where('role', Role::AccountManager->value)
                ->where('scope_type', RoleAssignment::SCOPE_COMPANY)
                ->pluck('scope_id')
                ->map(fn ($id) => Company::query()->where('status', 'active')->find($id))
                ->filter()
                ->map(fn (Company $c) => ['id' => $c->id, 'label' => $c->name])
                ->values(),

            'partner' => Partner::query()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->get()
                ->filter(fn (Partner $p) => $p->parent_id === null || $p->parent?->status === 'active')
                ->map(fn (Partner $p) => ['id' => $p->id, 'label' => $p->resolvedPartner()->name])
                ->values(),

            default => collect(),
        });
    }

    /**
     * Complete the portal login for one of the user's options.
     *
     * @throws ValidationException when the option is not available
     */
    public function loginInto(Request $request, string $guard, User $user, int $optionId): void
    {
        if (! $this->options($user, $guard)->contains(fn ($option) => $option['id'] === $optionId)) {
            throw ValidationException::withMessages([
                'context' => ['هذا الحساب غير متاح.'],
            ]);
        }

        app(CompanyContext::class)->bypass(function () use ($request, $guard, $user, $optionId): void {
            $account = match ($guard) {
                'employee' => Employee::withoutGlobalScopes()->findOrFail(
                    $user->activeMemberships()->where('company_id', $optionId)->firstOrFail()->employee_id
                ),
                'company' => Company::query()->findOrFail($optionId),
                'partner' => Partner::query()->findOrFail($optionId),
            };

            $this->portalLogin->login($request, $guard, $account, $user);
        });
    }
}
