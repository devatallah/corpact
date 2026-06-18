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

export interface Category {
    id: number;
    parent_id: number | null;
    name: string;
    name_en: string;
    icon: string;
    color: string;
    children?: Category[];
    parent?: Category;
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

export interface Business {
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
    categories?: Category[];
    venues?: Venue[];
    venues_count?: number;
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
    category_id: number;
    leader_id: number | null;
    member_count: number;
    balance: number;
    status: string;
    created_at: string;
    updated_at: string;
    // Relationships
    category?: Category;
    leader?: Employee;
    members?: Employee[];
    events?: Event[];
    announcements?: CommunityAnnouncement[];
    members_count?: number;
    events_count?: number;
    is_member?: boolean;
}

export interface Venue {
    id: number;
    business_id: number;
    category_id: number;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    // Relationships
    category?: Category;
    business?: Business;
    pricings?: VenuePricing[];
}

export interface VenuePricing {
    id: number;
    venue_id: number;
    duration_minutes: number;
    price: number;
    is_peak: boolean;
    label: string | null;
    start_time: string | null;
    end_time: string | null;
    days: number[] | null;
    status: 'active' | 'inactive';
}

export interface Discount {
    id: number;
    business_id: number;
    company_id: number;
    community_id: number;
    name: string | null;
    type: 'fixed' | 'percentage';
    value: number;
    usage: 'one_time' | 'date_range';
    starts_at: string | null;
    expires_at: string | null;
    start_time: string | null;
    end_time: string | null;
    status: 'active' | 'expired';
    created_at: string;
    updated_at: string;
    used_count?: number;
    // Relationships
    business?: Business;
    company?: Company;
    community?: Community;
}

export interface Event {
    id: number;
    community_id: number;
    company_id: number;
    business_id: number;
    venue_pricing_id: number | null;
    discount_id: number | null;
    discount_amount: number | null;
    category_id: number;
    created_by: number;
    parent_event_id: number | null;
    title: string;
    event_date: string;
    start_time: string;
    duration_minutes: number;
    venues_count: number;
    total_amount: number;
    capacity: number;
    participants_count: number;
    cost_per_person: number;
    company_subsidy: number;
    community_contribution: number;
    player_payment: number;
    notes: string | null;
    recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly';
    recurrence_end_date: string | null;
    recurrence_days: number[] | null;
    rejection_reason: string | null;
    status: string;
    budget_deducted_at: string | null;
    payment_deadline: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    community?: Community;
    company?: Company;
    business?: Business;
    venuePricing?: VenuePricing;
    discount?: Discount;
    venues?: Venue[];
    category?: Category;
    creator?: Employee;
    participants?: Employee[];
    alternatives?: EventAlternative[];
    parent_event?: Event;
    occurrences?: Event[];
}

export interface EventAlternative {
    id: number;
    event_id: number;
    proposed_date: string;
    proposed_start_time: string;
    proposed_end_time: string;
    proposed_venues_count: number;
    proposed_amount: number;
    notes: string | null;
    status: string;
}

export interface Settlement {
    id: number;
    business_id: number;
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
    business?: Business;
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

export interface CommunityRequest {
    id: number;
    company_id: number;
    employee_id: number;
    category_id: number;
    name: string;
    description: string | null;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    community_id: number | null;
    created_at: string;
    updated_at: string;
    // Relationships
    employee?: Employee;
    category?: Category;
    community?: Community;
    reviewer?: Company;
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

export interface CommunityPoll {
    id: number;
    community_id: number;
    employee_id: number;
    question: string;
    expires_at: string | null;
    status: 'active' | 'closed';
    created_at: string;
    updated_at: string;
    // Computed
    my_vote: number | null;
    total_votes: number;
    // Relationships
    creator?: Employee;
    options?: PollOption[];
}

export interface PollOption {
    id: number;
    poll_id: number;
    label: string;
    sort_order: number;
    votes_count: number;
}

export interface PollVote {
    id: number;
    poll_id: number;
    option_id: number;
    employee_id: number;
    created_at: string;
}

export interface Slot {
    id: number;
    venue_id: number;
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

export interface Challenge {
    id: number;
    title: string;
    description: string | null;
    type: 'events_count' | 'communities_join';
    target_count: number;
    company_id: number | null;
    starts_at: string;
    ends_at: string;
    status: 'active' | 'completed';
    created_at: string;
    updated_at: string;
}

export interface ChallengeWithProgress {
    id: number;
    title: string;
    description: string | null;
    type: string;
    target_count: number;
    current_count: number;
    completed_at: string | null;
    percentage: number;
}

export interface QuickMatchOption {
    id: number;
    quick_match_id: number;
    date: string;
    time: string;
    votes_count: number;
    sort_order: number;
}

export interface QuickMatch {
    id: number;
    community_id: number;
    created_by: number | null;
    message: string | null;
    source: 'manual' | 'auto';
    status: 'open' | 'converted' | 'expired';
    created_at: string;
    updated_at: string;
    community?: Community & { category?: Category };
    creator?: Employee;
    options?: QuickMatchOption[];
    votes_count?: number;
    my_vote_option_id?: number | null;
}
