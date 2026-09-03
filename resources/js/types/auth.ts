/**
 * Teamat staff roles on the platform scope (H §3/§16). The pre-A3 vocabulary
 * (`super_admin | admin | accountant`) exists nowhere in the backend — the
 * authority is `App\Enums\Role`.
 */
export type AdminRole = 'platform_admin' | 'finance_admin' | 'support_agent';

/** Every role carried by `role_assignments`, staff and non-staff alike. */
export type RoleName = 'employee' | 'community_leader' | 'account_manager' | 'coordinator' | 'provider' | AdminRole;

export type PartnerRoleType = 'owner' | 'receptionist' | 'accountant';

export type GuardName = 'admin' | 'company' | 'partner' | 'employee';

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    /** Primary platform role; a user may hold more than one (see `role_label`). */
    role?: AdminRole;
    phone?: string | null;
    status?: string;
    email_verified_at?: string | null;
};

export type CompanyUser = {
    id: number;
    name: string;
    email: string;
    hr_name?: string;
    hr_phone?: string;
    sector?: string;
    city?: string;
    status?: string;
};

export type PartnerUser = {
    id: number;
    name: string;
    email: string;
    city?: string;
    district?: string;
    contact_phone?: string;
    rating?: number;
    role: PartnerRoleType;
    status?: string;
};

export type EmployeeUser = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    department?: string | null;
    company_id?: number;
    status?: string;
};

export type AuthUser = AdminUser | CompanyUser | PartnerUser | EmployeeUser;

/** One company a multi-company account can act inside (H §4 context switch). */
export type Membership = {
    id: number;
    /** The server sends `label` (OtpLoginService::options), never `name`. */
    label: string;
    active?: boolean;
};

export type Auth = {
    guard: GuardName | null;
    user: (AuthUser & { name?: string }) | null;
    /** Every platform role the staff account holds, joined with ' · '. */
    role_label: string | null;
    /** Union of the permissions of every role held on the active scope. */
    permissions: string[];
    partnerRole?: string | null;
    partnerPermissions?: string[];
    /** Shared for the employee and company portals; empty elsewhere. */
    memberships?: Membership[];
};
