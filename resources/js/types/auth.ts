export type AdminRole = 'super_admin' | 'admin' | 'accountant';
export type BusinessRoleType = 'owner' | 'receptionist' | 'accountant';

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: AdminRole;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type CompanyUser = {
    id: number;
    name: string;
    email: string;
    hr_name: string;
    hr_phone: string;
    sector: string;
    city: string;
    status: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type businessUser = {
    id: number;
    name: string;
    email: string;
    city: string;
    district: string;
    contact_phone: string;
    rating: number;
    role: BusinessRoleType;
    status: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type EmployeeUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    department: string | null;
    company_id: number;
    status: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type AuthUser = AdminUser | CompanyUser | businessUser | EmployeeUser;

export type GuardName = 'admin' | 'company' | 'business' | 'employee';

export type Auth = {
    guard: GuardName | null;
    user: AuthUser | null;
    role_label: string | null;
    permissions: string[];
    businessRole?: string | null;
    businessPermissions?: string[];
};
