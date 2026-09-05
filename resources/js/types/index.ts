import type { Auth } from './auth';

export type { Auth, AuthUser, GuardName, Membership } from './auth';

/** What `HandleInertiaRequests::share()` puts on every page. */
export type SharedProps = {
    name: string;
    auth: Auth;
    flash: {
        success?: string | null;
        error?: string | null;
        status?: string | null;
    };
    unreadNotifications?: number;
    errors: Record<string, string>;
};

/** A Laravel length-aware paginator, as Inertia serialises it. */
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

/**
 * H §18 — sorting is a column plus a direction, never a bare direction. The
 * server whitelists the key (`ListSort`) and echoes back what it applied.
 */
export type SortState = {
    key: string;
    direction: 'asc' | 'desc';
};

/**
 * وكيل دعم صالح للإسناد إلى شركة، ومعه عدد الشركات التي يتابعها.
 *
 * العدد معروض عمداً في المُنتقي: بدونه تُسنَد الشركات كلها إلى أول اسم في
 * القائمة، وهو ما يُفترض أن يمنعه توزيع المتابعة أصلاً.
 */
export type SupportAgent = {
    id: number;
    name: string;
    email: string | null;
    companies: number;
};
