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
    contact_name: string;
    contact_phone: string;
    domain: string | null;
    sector: string;
    employee_count: number;
    city: string;
    status: string;
    approved_at: string | null;
    email_verified_at: string | null;
    // عقد الشركة (A4) — مبالغ بالهللة كعدد صحيح
    commercial_registration?: string | null;
    contract_fee_per_activated_employee?: number | null;
    contract_monthly_minimum?: number | null;
    contract_coordinator_service?: boolean | null;
    vat_number?: string | null;
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

export interface Partner {
    id: number;
    name: string;
    email: string;
    city: string;
    district: string;
    contact_name?: string | null;
    contact_phone: string;
    working_hours: string | null;
    rating: number;
    total_bookings: number;
    commission_rate: number;
    role: 'owner' | 'accountant' | 'receptionist';
    status: string;
    parent_id: number | null;
    approved_at: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    categories?: Category[];
    venues?: Venue[];
    venues_count?: number;
    parent?: Partner;
    staff?: Partner[];
    // A9 — provider hierarchy / bank / reliability
    trade_name?: string | null;
    cr_number?: string | null;
    reliability_score?: number;
    reliability_samples?: number;
    bank_account_holder?: string | null;
    bank_iban?: string | null;
    bank_status?: 'missing' | 'pending' | 'approved';
    bank_approved_at?: string | null;
    has_price_contract?: boolean;
    branches?: ProviderBranch[];
}

/* ── A9: Provider hierarchy & decision channel ── */

export interface WorkingWindow {
    from: string;
    to: string;
}

export interface ProviderBranch {
    id: number;
    partner_id: number;
    name: string;
    address: string | null;
    city: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
    working_hours: Record<string, WorkingWindow[]> | null;
    contact_name: string | null;
    contact_phone: string | null;
    status: 'active' | 'inactive';
    units?: ActivityUnit[];
    partner?: Partner;
}

export interface ActivityUnit {
    id: number;
    provider_branch_id: number;
    category_id: number;
    venue_id: number | null;
    name: string;
    min_capacity: number;
    max_capacity: number;
    pricing_type: 'unit_hour' | 'package' | 'per_person';
    price: number;
    default_duration_minutes: number;
    status: 'active' | 'maintenance' | 'disabled';
    category?: Category;
    branch?: ProviderBranch;
    price_changes?: UnitPriceChange[];
}

export interface UnitSlot {
    id: number;
    activity_unit_id: number;
    date: string;
    start_time: string;
    end_time: string;
    booking_type: 'internal' | 'external';
    event_id: number | null;
    event_provider_request_id: number | null;
    note: string | null;
}

export interface UnitPriceChange {
    id: number;
    activity_unit_id: number;
    old_price: number;
    new_price: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    unit?: ActivityUnit;
}

export interface ProviderRequestEventSummary {
    id: number;
    community_name: string | null;
    company_name: string | null;
    participants_count: number;
    event_date: string | null;
    start_time: string | null;
    duration_minutes: number;
    status: string;
    creator_name: string | null;
    creator_phone: string | null;
}

export interface ProviderRequest {
    id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'alternative_proposed' | 'expired' | 'cancelled';
    requested_date: string;
    start_time: string;
    duration_minutes: number;
    quantity: number;
    pricing_type: string | null;
    frozen_participants_count: number | null;
    total_amount: number | null;
    sent_at: string | null;
    deadline_at: string | null;
    responded_at: string | null;
    late_response: boolean;
    rejection_reason: string | null;
    cancellation_reason: string | null;
    unit: { id: number; name: string; pricing_type: string } | null;
    event: ProviderRequestEventSummary | null;
}

export interface ProviderBehaviors {
    acceptance_rate: number | null;
    avg_response_minutes: number | null;
    total_requests: number;
    accepted: number;
    rejected: number;
    expired: number;
}

export interface ProviderReliabilityLogEntry {
    id: number;
    partner_id: number;
    delta: number;
    score_before: number;
    score_after: number;
    reason: string;
    note: string | null;
    created_at: string;
    partner?: Partner;
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
    pivot?: EventParticipantPivot;
}

export interface Community {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    company_id: number;
    category_id: number;
    member_count: number;
    balance: number;
    status: string;
    created_at: string;
    updated_at: string;
    // Relationships
    category?: Category;
    leader?: { id: number; name: string } | null;
    members?: Employee[];
    events?: Event[];
    announcements?: CommunityAnnouncement[];
    members_count?: number;
    events_count?: number;
    is_member?: boolean;
}

export interface Venue {
    id: number;
    partner_id: number;
    category_id: number;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    // Relationships
    category?: Category;
    partner?: Partner;
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

/**
 * A10 — مطالبة دفع حصة مشارك (H §12.3): المبلغ حصة مقفلة شاملة الضريبة،
 * بنافذة دفع ورابط موقّع. لا تخفيضات في المنصة (H §12.1) — ميزة التخفيضات
 * القديمة أُزيلت وجدولها مؤرشف.
 */
export interface PaymentIntent {
    id: number;
    event_id: number;
    employee_id: number;
    amount_halalas: number;
    base_amount_halalas: number;
    vat_amount_halalas: number;
    currency: string;
    amount: string;
    base_amount: string;
    vat_amount: string;
    status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded';
    gateway: string | null;
    gateway_reference: string | null;
    expires_at: string;
    paid_at: string | null;
    refund_status: 'none' | 'pending' | 'failed' | 'refunded';
    refund_reason: string | null;
    refund_attempts: number;
    refund_last_error: string | null;
    refunded_at: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    event?: Event;
    employee?: Employee;
}

/** آلة حالات الفعالية (H §9 — A7). `full` القديمة ماتت: الامتلاء عَلَم is_full. */
export type EventStatusValue =
    | 'pending_approval'
    | 'open'
    | 'rejected'
    | 'pending_provider'
    | 'provider_alternative'
    | 'booked'
    | 'awaiting_payment'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'settled'
    | 'expired'
    | 'cancelled_min_not_met'
    | 'cancelled_provider'
    | 'cancelled_company'
    | 'cancelled_payment_failed';

/** حقول مشارك الفعالية الثلاثة المنفصلة (H §10 — A7) */
export interface EventParticipantPivot {
    seat_status?: 'reserved' | 'waitlisted' | 'released' | 'cancelled';
    payment_status?: 'not_due' | 'due' | 'paid' | 'failed' | 'refunded';
    attendance_status?: 'attended' | 'absent' | null;
    /** A12 — H §13: أثر الغياب يظهر في سجل الموظف */
    attendance_reason?: string | null;
    attendance_marked_at?: string | null;
    joined_at?: string;
    position?: number | null;
    offered_at?: string | null;
    offer_expires_at?: string | null;
    [key: string]: unknown;
}

export interface Event {
    id: number;
    community_id: number;
    company_id: number;
    partner_id: number;
    venue_pricing_id: number | null;
    category_id: number;
    created_by: number;
    parent_event_id: number | null;
    title: string;
    event_date: string;
    start_time: string;
    duration_minutes: number;
    venues_count: number;
    /** عرض بالريال — الحساب كله هللات صحيحة على الخادم (A10) */
    total_amount: number;
    capacity: number;
    participants_count: number;
    cost_per_person: number;
    company_subsidy: number;
    community_contribution: number;
    player_payment: number;
    /** A10 — H §12.1/§12.2: هللات صحيحة + السقف الملزم والحصة المقفلة */
    total_amount_halalas?: number;
    base_amount_halalas?: number;
    vat_amount_halalas?: number;
    subsidy_type?: 'fixed' | 'percentage';
    subsidy_value?: number;
    subsidy_halalas?: number | null;
    max_share_halalas?: number;
    final_share_halalas?: number | null;
    max_share?: string;
    final_share?: string | null;
    rounding_remainder_halalas?: number;
    collection_deadline_at?: string | null;
    notes: string | null;
    rejection_reason: string | null;
    refund_percentage: number | null;
    refund_amount: number | null;
    /** آلة حالات H §9 (A7) — الحالات الست عشرة الجديدة */
    status: EventStatusValue;
    /** حالة التمويل منفصلة عن حالة الفعالية (H §7) — دلالاتها لـ A10 */
    funding_status?: string;
    starts_at?: string | null;
    ends_at?: string | null;
    registration_closes_at?: string | null;
    free_withdrawal_until?: string | null;
    min_participants?: number;
    is_full?: boolean;
    template_id?: number | null;
    reschedule_attempt?: number;
    original_starts_at?: string | null;
    registration_extended_at?: string | null;
    event_snapshot?: Record<string, unknown> | null;
    creator_role?: string | null;
    budget_deducted_at: string | null;
    payment_deadline: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    community?: Community;
    company?: Company;
    partner?: Partner;
    venuePricing?: VenuePricing;
    venues?: Venue[];
    category?: Category;
    creator?: Employee;
    participants?: Employee[];
    waitlist_entries?: Employee[];
    alternatives?: EventAlternative[];
    parent_event?: Event;
    occurrences?: Event[];
}

/** A8 — قالب التكرار (H §8): أسبوعي/كل أسبوعين/شهري، توليد قبل 14 يوماً */
export interface EventTemplate {
    id: number;
    company_id: number;
    community_id: number;
    partner_id: number | null;
    activity_unit_id: number | null;
    category_id: number | null;
    venue_pricing_id: number | null;
    venue_ids: number[] | null;
    created_by: number | null;
    title: string | null;
    notes: string | null;
    recurrence_pattern: 'weekly' | 'biweekly' | 'monthly';
    day_of_week: number | null;
    day_of_month: number | null;
    anchor_date: string;
    ends_on: string | null;
    start_time: string;
    duration_minutes: number;
    capacity: number;
    min_participants: number;
    venues_count: number;
    total_amount: number;
    company_subsidy: number;
    community_contribution: number;
    player_payment: number;
    cost_per_person: number;
    blackout_behavior: 'skip' | 'shift_week';
    reschedule_interval_days: number;
    status: 'active' | 'paused';
    paused_at: string | null;
    created_at: string;
    updated_at: string;
    events_count?: number;
    partner?: Partner;
    category?: Category;
    activity_unit?: { id: number; name: string } | null;
    /** معاينة المواعيد القادمة مع مؤشر الحظر */
    upcoming?: TemplateOccurrencePreview[];
    generated_events?: Pick<Event, 'id' | 'event_date' | 'start_time' | 'status' | 'participants_count' | 'min_participants' | 'reschedule_attempt'>[];
}

export interface TemplateOccurrencePreview {
    pattern_date: string;
    effective_date: string | null;
    action: 'generate' | 'skip_blackout';
    blackout_name: string | null;
    shifted: boolean;
}

/** A8 — أيام الحظر (H §8): يديرها أدمن تيمات */
export interface BlackoutDate {
    id: number;
    name: string;
    starts_on: string;
    ends_on: string;
    created_by: number | null;
    created_at: string;
    updated_at: string;
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

/**
 * كشف تسوية مزوّد (A11 — H §12.7): كل 15 يوماً، draft ← approved ← paid.
 * كل المبالغ هللات صحيحة على الخادم؛ الحقول النصية قيم عرض بالريال.
 */
export interface SettlementStatement {
    id: number;
    partner_id: number;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: 'draft' | 'approved' | 'paid';
    items_count: number;
    gross_amount_halalas: number;
    commission_amount_halalas: number;
    vat_amount_halalas: number;
    net_amount_halalas: number;
    approved_at: string | null;
    paid_at: string | null;
    transferred_at: string | null;
    payout_reference: string | null;
    // Relationships
    partner?: Partner;
    items?: SettlementItem[];
}

/**
 * بند تسوية لكل فعالية مكتملة، مع لقطة مجمّدة وقت الاحتساب. المبالغ موقّعة:
 * البند التصحيحي (`type = correction`) يحمل الفرق وقد يكون سالباً.
 */
export interface SettlementItem {
    id: number;
    partner_id: number;
    event_id: number;
    company_id: number | null;
    settlement_statement_id: number | null;
    type: 'event' | 'correction';
    corrects_item_id: number | null;
    gross_amount_halalas: number;
    commission_amount_halalas: number;
    vat_amount_halalas: number;
    net_amount_halalas: number;
    commission_rate_percent: number | null;
    status: 'pending' | 'included' | 'paid' | 'disputed' | 'adjusted';
    tax_treatment: 'agent' | 'principal';
    invoice_issuer: string;
    reason: string | null;
    computed_at: string | null;
}

export interface Wallet {
    id: number;
    company_id: number;
    owner_type: string;
    owner_id: number;
    balance_halalas: number;
    /** بالريال — accessor مشتق من الدفتر (H §12.5) */
    balance: number;
}

export type WalletTransactionType =
    | 'top_up'
    | 'allocation'
    | 'allocation_reversal'
    | 'hold'
    | 'hold_release'
    | 'capture'
    | 'refund'
    | 'commission'
    | 'settlement'
    | 'adjustment';

/** قيد دفتر مُسلسَل للواجهة (المبلغ بالريال للعرض) */
export interface WalletTransaction {
    id: number;
    type: WalletTransactionType;
    type_label: string;
    direction: 'credit' | 'debit';
    amount: number;
    note: string | null;
    occurred_at: string | null;
}

export type TopupRequestStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

/** طلب شحن بتحويل بنكي (H §12.5) */
export interface WalletTopupRequest {
    id: number;
    amount: number;
    transfer_date: string | null;
    sender_account_last4: string;
    bank_reference: string;
    status: TopupRequestStatus;
    status_label: string;
    rejection_reason: string | null;
    created_at: string | null;
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

/**
 * فاتورة رسوم النظام الشهرية (A11 — H §12.8/§12.9). `issuance_mode` يبقى
 * `provisional` حتى اعتماد المحاسب القانوني للصفة الضريبية.
 */
export interface PlatformFeeInvoice {
    id: number;
    company_id: number;
    serial: string;
    invoice_uuid: string;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: 'draft' | 'issued' | 'paid' | 'void';
    issuance_mode: 'provisional' | 'real';
    activated_employees_count: number;
    departed_activated_count: number;
    fee_per_activated_employee_halalas: number;
    fees_subtotal_halalas: number;
    monthly_minimum_halalas: number | null;
    minimum_adjustment_halalas: number;
    subtotal_halalas: number;
    vat_amount_halalas: number;
    total_amount_halalas: number;
    vat_rate_percent: number;
    tax_treatment: 'agent' | 'principal';
    invoice_issuer: string;
    seller_vat_number: string | null;
    buyer_vat_number: string | null;
    qr_payload: string | null;
    issued_at: string | null;
    due_at: string | null;
    paid_at: string | null;
    blocked_at: string | null;
}

export interface InvoiceItem {
    id: number;
    platform_fee_invoice_id: number;
    type: 'activation_fee' | 'monthly_minimum' | 'coordinator_service' | 'correction';
    description: string;
    quantity: number;
    unit_amount_halalas: number;
    amount_halalas: number;
    vat_amount_halalas: number;
    total_amount_halalas: number;
    tax_treatment: 'agent' | 'principal';
    invoice_issuer: string;
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

/* ── A12 — المواسم والنتائج ولوحتا الصدارة (H §13) ── */

export interface Season {
    id: number;
    company_id?: number;
    community_id: number;
    category_id?: number | null;
    name: string;
    starts_on: string;
    ends_on: string;
    status: 'active' | 'closed';
    period_key?: string | null;
    is_auto: boolean;
    closed_at?: string | null;
}

/** نوعا القياس الوحيدان في الإصدار الأول */
export type MeasurementType = 'individual_value' | 'consistency';

export interface CompetitionResult {
    id: number;
    season_id: number;
    community_id: number;
    /** employee الآن · match_team لاحقاً (الدوري المؤجل) */
    subject_type: string;
    subject_id: number;
    employee_id: number | null;
    /** event الآن · match لاحقاً */
    source_type: string;
    source_id: number | null;
    event_id: number | null;
    measurement_type: MeasurementType;
    unit: string | null;
    value: number | null;
    recorded_at: string;
    notes?: string | null;
}

export interface LeaderboardRow {
    rank: number;
    employee_id?: number;
    department_id?: number | null;
    name: string | null;
    avatar?: string | null;
    events_count?: number;
    points?: number;
    members_count?: number;
    first_participation_at?: string | null;
    unit?: string;
    unit_label?: string;
    best_value?: number;
    best_value_formatted?: string;
    results_count?: number;
}

/* ── Notifications infrastructure (A14 — H §14) ── */

export interface NotificationTemplate {
    id: number;
    key: string;
    group: string;
    audience: string | null;
    class: 'mandatory' | 'optional';
    title_ar: string;
    title_en: string | null;
    body_ar: string;
    body_en: string | null;
    channels: string[] | null;
    whatsapp_template_name: string | null;
    whatsapp_variables: string[] | null;
    variables: string[] | null;
    in_app_type: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface NotificationPreferenceRow {
    key: string;
    title: string;
    group: string;
    audience: string | null;
    enabled: boolean;
}

export interface NotificationLog {
    id: number;
    template_key: string | null;
    notification_id: string | null;
    recipient_type: string | null;
    recipient_id: number | null;
    recipient_phone: string | null;
    channel: string;
    status: string;
    attempt: number;
    reason: string | null;
    variables: Record<string, unknown> | null;
    rendered_body: string | null;
    locale: string;
    purpose: string | null;
    provider_message_id: string | null;
    error: string | null;
    queued_at: string | null;
    deferred_until: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    failed_at: string | null;
    created_at: string;
}

export interface AdminAlert {
    id: number;
    key: string;
    level: 'critical' | 'warning';
    title: string;
    body: string | null;
    context: Record<string, unknown> | null;
    occurrences: number;
    last_seen_at: string | null;
    acknowledged_at: string | null;
    acknowledged_by: { id: number; name: string } | null;
    created_at: string;
}
