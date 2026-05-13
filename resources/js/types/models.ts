/* ── Pagination ── */
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResult<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

/* ── Core Models ── */

export interface Sport {
    id: number;
    name: string;
    name_en: string;
    icon: string;
    color: string;
}

export interface Company {
    id: number;
    name: string;
    email: string;
    hr_name: string;
    hr_phone: string;
    domain: string | null;
    sector: string;
    employee_count: number;
    city: string;
    status: string;
    approved_at: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    employees?: Employee[];
    communities?: Community[];
    wallet?: Wallet;
    employees_count?: number;
    communities_count?: number;
    events_count?: number;
    total_spend?: number;
}

export interface Club {
    id: number;
    name: string;
    email: string;
    city: string;
    district: string;
    contact_phone: string;
    working_hours: string | null;
    rating: number;
    total_bookings: number;
    commission_rate: number;
    status: string;
    approved_at: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    sports?: Sport[];
    courts?: Court[];
    courts_count?: number;
}

export interface Employee {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    company_id: number;
    department_id: number | null;
    status: string;
    // Relationships
    department?: Department;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    company?: Company;
    communities?: Community[];
    communities_count?: number;
    events_count?: number;
}

export interface Community {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    company_id: number;
    sport_id: number;
    leader_id: number | null;
    member_count: number;
    balance: number;
    status: string;
    created_at: string;
    updated_at: string;
    // Relationships
    sport?: Sport;
    leader?: Employee;
    members?: Employee[];
    events?: Event[];
    announcements?: CommunityAnnouncement[];
    members_count?: number;
    events_count?: number;
    is_member?: boolean;
}

export interface Court {
    id: number;
    club_id: number;
    sport_id: number;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    // Relationships
    sport?: Sport;
    club?: Club;
    pricings?: CourtPricing[];
}

export interface CourtPricing {
    id: number;
    court_id: number;
    duration_minutes: number;
    price: number;
}

export interface Event {
    id: number;
    community_id: number;
    company_id: number;
    club_id: number;
    court_pricing_id: number | null;
    sport_id: number;
    created_by: number;
    title: string;
    event_date: string;
    start_time: string;
    duration_minutes: number;
    courts_count: number;
    total_amount: number;
    capacity: number;
    participants_count: number;
    cost_per_person: number;
    company_subsidy: number;
    community_contribution: number;
    player_payment: number;
    notes: string | null;
    rejection_reason: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    // Relationships
    community?: Community;
    company?: Company;
    club?: Club;
    courtPricing?: CourtPricing;
    courts?: Court[];
    sport?: Sport;
    creator?: Employee;
    participants?: Employee[];
    alternatives?: EventAlternative[];
}

export interface EventAlternative {
    id: number;
    event_id: number;
    proposed_date: string;
    proposed_start_time: string;
    proposed_end_time: string;
    proposed_courts_count: number;
    proposed_amount: number;
    notes: string | null;
    status: string;
}

export interface Settlement {
    id: number;
    club_id: number;
    company_id: number;
    period: string;
    events_count: number;
    gross_amount: number;
    commission_amount: number;
    net_amount: number;
    status: string;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    club?: Club;
    company?: Company;
}

export interface Wallet {
    id: number;
    company_id: number;
    balance: number;
}

export interface WalletTransaction {
    id: number;
    wallet_id: number;
    community_id: number | null;
    event_id: number | null;
    type: 'credit' | 'debit';
    amount: number;
    description: string | null;
    created_at: string;
    // Relationships
    community?: Community;
    event?: Event;
}

export interface Notification {
    id: string;
    notifiable_type: string;
    notifiable_id: number;
    type: string | null;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    read_at: string | null;
    created_at: string;
}

export interface Invitation {
    id: number;
    company_id: number;
    invited_by: number | null;
    email: string;
    status: string;
    accepted_at: string | null;
    created_at: string;
}

export interface Department {
    id: number;
    name: string;
    company_id: number;
}

export interface League {
    id: number;
    community_id: number;
    created_by: number;
    name: string;
    format: 'single_round_robin' | 'double_round_robin' | 'knockout';
    status: 'active' | 'completed';
    created_at: string;
    updated_at: string;
    // Relationships
    community?: Community;
    creator?: Employee;
    departments?: Department[];
    matches?: LeagueMatch[];
    matches_count?: number;
}

export interface LeagueMatch {
    id: number;
    league_id: number;
    department_a_id: number | null;
    department_b_id: number | null;
    score_a: number | null;
    score_b: number | null;
    penalty_a: number | null;
    penalty_b: number | null;
    round: number;
    match_number: number;
    round_label: string | null;
    is_third_place: boolean;
    status: 'pending' | 'played';
    // Relationships
    department_a?: Department;
    department_b?: Department;
}

export interface LeagueStanding {
    department: Department;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
}

export interface CommunityAnnouncement {
    id: number;
    community_id: number;
    employee_id: number;
    body: string;
    created_at: string;
    // Relationships
    employee?: Employee;
}

export interface Slot {
    id: number;
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
}

export interface ActivityLog {
    id: number;
    company_id: number | null;
    subject_type: string;
    subject_id: number;
    type: string;
    description: string;
    data: Record<string, unknown> | null;
    created_at: string;
}

export interface PlatformRevenue {
    id: number;
    settlement_id: number | null;
    event_id: number | null;
    amount: number;
    source: string;
    description: string | null;
    revenue_date: string;
}
