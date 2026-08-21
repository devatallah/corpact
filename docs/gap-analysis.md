# Teamat — Gap Analysis (A3–A16)

**Date:** 2026-08-19 · **Author:** gap-analysis agent · **Scope:** briefs A3–A16 of `docs/agent-backlog.md` (A0–A2 in execution, excluded).
**Method:** read-only audit of routes, migrations, models, controllers, services, scheduled commands, notifications, Inertia pages, and tests. Every claim carries `file:line` evidence (paths relative to repo root `/Users/atallah/dev/corpact`). Items not verified are marked **UNVERIFIED**.

**Classification:** `EXISTS` (matches spec) · `PARTIAL` (exists, diverges — how stated) · `MISSING` · `CONTRADICTS` (implemented in a way the spec forbids → rework, not greenfield).

**Big picture:** the repo is a working *earlier product iteration* (venue-booking app with per-portal logins, community balances, discounts, leagues, quick matches, polls) — not a partial build of the handover spec. Portal shells, CRUD, and some concurrency-safe join plumbing are reusable; the identity model, money model, and state machine are implemented in ways the spec explicitly forbids. Expect **rework-heavy** phases 1–5 and mostly greenfield phases 6–9.

---

## A3 — Identity, auth (OTP), scoped permissions

**Verdict: ~15% exists. Identity architecture is the inverse of the spec: four separate account tables/guards instead of one global account; no OTP anywhere; role checks are bare roles without scope.**

- **`users` = identity only; `company_memberships`; `role_assignments`** — **CONTRADICTS.** Four independent authenticatable tables, each with its own password: `users` (admin-only, with a **`role` string column** — `database/migrations/2026_06_18_000001_add_role_and_parent_id_to_businesses_table.php:11-13`, `app/Models/User.php:18`), `employees` with **`company_id` on the identity row** (`database/migrations/2026_04_21_000008_create_employees_table.php:19`), `companies` and `partners` as login accounts (`database/migrations/2026_04_21_000002_create_companies_table.php`, `..._000003_create_businesses_table.php`). Guards: `config/auth.php:43-63` (admin/employee/partner/company). No `company_memberships`, no `role_assignments` tables (full migration list has neither).
- **Global account linking (same phone, multiple companies → memberships)** — **CONTRADICTS.** `employees.email` is globally unique (`2026_04_21_000008:14`), so one person **cannot exist under two companies at all**; a second company would need a duplicate account with a different email — exactly what H §3 forbids.
- **Permission + scope pairs, never bare role** — **CONTRADICTS.** `app/Http/Middleware/CheckRole.php:19-33` does a bare `in_array($role, $roles)`; `app/Enums/AdminRole.php` and `app/Enums/PartnerRole.php` define flat permission lists with **no scope dimension**. The G/ملحق-ب matrix is not implemented.
- **Company isolation via Eloquent Global Scope; `company_id` from session only** — **MISSING.** Zero `addGlobalScope` in `app/` (verified by grep). Isolation is hand-written `where('company_id', …)` per service (e.g. `app/Services/Company/CompanyEmployeeService.php:22`), and some inputs take entity ids from the request then check ownership afterwards (`app/Http/Controllers/Company/WalletController.php:60-68`).
- **Cross-company probe → 404 + audit log** — **PARTIAL/DIVERGES.** Probes throw `AuthorizationException` → **403, not 404** (`app/Services/Company/WalletService.php:72`, `app/Services/Partner/BookingService.php:291-293`, `app/Services/Company/CommunityService.php:81`), and are not audit-logged. Guard-level isolation is tested (`tests/Feature/Auth/GuardIsolationTest.php:64-88`) but that is portal isolation, not company scoping.
- **Auth matrix (phone + WhatsApp OTP; provider OTP; admin email+password+OTP; 30d/14d/12h sessions)** — **MISSING.** All four portals use email + password (`routes/web.php:110-211`); no OTP code exists anywhere (grep for otp/OTP: zero hits). Single session lifetime 120 min for everyone (`config/session.php:35`). Partner/company activation-token flows exist (`routes/web.php:174-175, 206-207`) — email-based, admin-approval-gated (`app/Http/Controllers/Admin/PartnerController.php` — approve flow, `app/Notifications/PartnerApprovedNotification.php`), which loosely matches "provider is admin-invited" in spirit only.
- **OTP rules (6 digits, 5-min, resend caps, lock, SMS fallback)** — **MISSING.**
- **Departure cascade (revoke sessions, transfer leaderships, cancel unconfirmed participations)** — **MISSING.** Deactivation is a bare status flip (`app/Http/Controllers/Admin/AdminController.php:49,72`; employee status checked at login only, `app/Services/Auth/EmployeeAuthService.php:22-26`). No session revocation, no leadership transfer, no participation cleanup.
- **No self-approval of financial actions enforced in code** — **CONTRADICTS.** A company tops up **its own wallet instantly with no approval of any kind**: `app/Http/Controllers/Company/WalletController.php:43-52` → `app/Services/Company/WalletService.php:34-64`.

**Reusable:** Fortify scaffolding, rate limiting (`throttle:login`, `app/Providers/FortifyServiceProvider.php:74`), guard-isolation tests, password-reset plumbing.

---

## A4 — Companies, departments, employee onboarding

**Verdict: ~30% exists. Company/department CRUD and an email-invite flow exist; contract/settings/CSV-import/WhatsApp/department-history are missing.**

- **Company entity (name, CR, logo, contract values, settings, main wallet, timezone)** — **PARTIAL.** Companies table has name/sector/city/contact fields (`2026_04_21_000002`; `hr_*` already renamed to `contact_*` per `2026_07_10_000001_rename_hr_fields_on_companies_table.php` — the A2 divergence note). **No CR, no logo column, no contract (fee/minimum/coordinator), no settings, no timezone** (`app/Models/Company.php:20-38` fillable list). Main wallet exists (`2026_04_21_000016`, `WalletService::getOrFailWallet` at `app/Services/Company/WalletService.php:115-121`).
- **Settings with defaults (`employee_can_create_event` off, `default_funding_mode`, `default_subsidy`, `registration_close_hours`, `allow_absence_marking`)** — **MISSING.** No settings storage anywhere; note the current behavior contradicts the default: any community member can create events directly (`app/Services/Employee/EventCreationService.php:116-124,188`).
- **Departments; one per employee; `department_history`** — **PARTIAL.** `departments` table (`2026_05_13_000001`) + single `employees.department_id` FK (`2026_05_13_000002`) exist with company CRUD (`app/Http/Controllers/Company/DepartmentController.php`). **`department_history` MISSING** — at-event-time attribution for reports is impossible today (reports join current department: `app/Services/Employee/LeaderboardService.php:43`).
- **CSV/Excel upload with instant validation and per-row error report** — **MISSING.** Onboarding is one-email-at-a-time (`app/Services/Company/CompanyEmployeeService.php:36-77`). No import code exists (grep csv/excel/import: zero hits). Saudi-phone-format validation not found anywhere (**UNVERIFIED** beyond a generic `max:20`, `app/Http/Requests/Employee/UpdateProfileRequest.php:27`).
- **WhatsApp invite, 7-day resendable link, no new account on expiry** — **PARTIAL.** Email invite with token + 7-day expiry job (`app/Http/Controllers/Auth/InvitationController.php`, expiry at `app/Console/Commands/ExpireStaleRecords.php:22-24`). WhatsApp channel MISSING; explicit resend flow not found (pending duplicate invites are blocked instead — `CompanyEmployeeService.php:38-48`).
- **Departed-but-activated employee counted in cycle invoice** — **MISSING** (no invoicing at all — see A11).

---

## A5 — Communities & leadership

**Verdict: ~35% exists. Community entity + membership + announcements exist, but leadership is a `leader_id` column (forbidden), balance is a writable column (forbidden), and leave deletes the membership row (forbidden).**

- **Community = one company + one activity, with sub-wallet, members, events** — **PARTIAL.** `communities` has `company_id` + `category_id` (`2026_04_21_000009`); events/members/announcements relations in `app/Models/Community.php`. But it carries a **writable `balance` decimal column instead of a sub-wallet** (`2026_04_21_000009:19`, cast at `app/Models/Community.php:36`) and a denormalized `member_count`. No cross-company communities: satisfied de facto by `company_id` FK. Templates/leaderboards/seasons on the community: MISSING.
- **Leaders via `role_assignments` + `is_primary`; drop `leader_id`** — **CONTRADICTS.** `communities.leader_id` FK exists and is load-bearing (`2026_04_21_000009:17`; fillable `app/Models/Community.php:20`; used for authorization at `app/Services/Employee/CommunityDetailService.php:215` and `app/Services/Employee/ExploreService.php:70`). A *second*, parallel leadership representation exists as pivot role `captain` (`community_member.role`, `2026_04_21_000010:15`), kept in sync manually (`app/Services/Company/CommunityService.php:96-110`) — two sources of truth, neither is the spec's.
- **Leadership transfer manual only** — **EXISTS** (`CommunityService::changeLeader`, `app/Services/Company/CommunityService.php:78-113`; leaders can't leave without transfer, `app/Services/Employee/ExploreService.php:70-74`).
- **Leaderless 14-day alert / 30-day dormant (خامل)** — **MISSING.** Status enum is only `active|inactive` (`2026_04_21_000009:20`); no dormancy job in `routes/console.php`.
- **Leave/rejoin as states + dates, never deletes; rank survives** — **CONTRADICTS.** Leaving **detaches the pivot row** (`app/Services/Employee/ExploreService.php:86-88`), destroying membership history.
- **Remove (leader, reason) vs ban (AM only)** — **MISSING** (no removal-with-reason or ban concept found).
- **Announcements text+link, leader/coordinator only, 15-min edit window, report button; comments only under events** — **PARTIAL.** Announcements exist, leader/captain-gated (`app/Services/Employee/CommunityDetailService.php:213-231`), body-only schema (`2026_04_21_000023` — no link field, no edited/deleted tracking). No edit/delete window, no report button, no event comments.
- **Out-of-spec extras on this entity:** polls (`2026_05_20_100001`), quick matches (`2026_05_20_200001`), challenges (`2026_05_22_100001`), leagues (`2026_05_13_100001`) — leagues are a **deferred v1 item** in the handover yet fully active here; flag as a divergence for the doc-vs-code note (binding rule H §0).

---

## A6 — Wallets & ledger core

**Verdict: ~10% exists — highest rework risk in the backlog. Money is writable float balance columns, the "ledger" is a 2-type memo table, several balance mutations write no transaction at all, and top-up is an unaudited self-service credit.**

- **No writable balance column; balance = Σ ledger** — **CONTRADICTS.** `wallets.balance` decimal(12,2) (`2026_04_21_000016:15`) and `communities.balance` decimal(10,2) (`2026_04_21_000009:19`) are directly incremented/decremented in at least six code paths: `app/Services/Company/WalletService.php:45,90-91`; `app/Services/Partner/BookingService.php:68,72`; `app/Services/RefundService.php:83`; `app/Console/Commands/ExpireStaleRecords.php:51`; `app/Services/Employee/EventCreationService.php:394`. Balance is never derived from the ledger.
- **Ledger writes in same transaction** — **CONTRADICTS.** Multiple balance mutations create **no transaction record at all**: refunds (`RefundService.php:76-92`), payment-deadline reversals (`ExpireStaleRecords.php:46-58`), provider-approval deduction (`BookingService.php:54-90`), occurrence cancellation (`EventCreationService.php:391-395`). Money moves silently.
- **Transaction types (top_up, allocation, hold, capture, refund, commission, settlement, adjustment…) + amount in integer halalas + actor + idempotency key** — **CONTRADICTS.** Only `credit|debit` enum, `decimal(10,2)` SAR float, description string; **no direction/actor/reference/idempotency/timestamp-beyond-created_at** (`2026_04_21_000017:13-19`; `app/Models/WalletTransaction.php:12-31`).
- **Immutability, corrections as linked reversals, no delete ever** — **MISSING/CONTRADICTS.** No model guards; `wallet_transactions.wallet_id` is `cascadeOnDelete` (`2026_04_21_000017:13`) so deleting a wallet erases financial history; no soft deletes on any financial table (grep SoftDeletes: only `app/Models/Category.php`).
- **Community sub-wallets funded by AM allocation; leader sees, cannot fund** — **PARTIAL.** Allocation flow exists (`WalletService::distributeToCommunity`, `app/Services/Company/WalletService.php:69-110`, company-side UI `app/Http/Controllers/Company/WalletController.php:57-72`) but lands in the forbidden balance column; leaders indeed cannot fund (no employee-side funding route in `routes/web.php:400-440`).
- **Bank top-up flow (request → under_review → approved/rejected, unique reference+amount, finance-admin approval, receipt image)** — **CONTRADICTS.** Top-up is an instant self-credit with only an amount field (`WalletController::charge`, `app/Http/Controllers/Company/WalletController.php:43-52`). No bank/receipt/reference fields exist anywhere (grep bank/iban/receipt: zero hits). No review states, no approver, no reversal privilege model.
- **Nightly reconciliation + negative-balance alarm** — **MISSING** (`routes/console.php:11-16` has no such job).

**Reusable:** almost nothing beyond table names; A6 should be treated as a rebuild plus a data-migration problem (existing balances → opening-balance ledger entries).

---

## A7 — Event state machine, join/withdraw/waitlist

**Verdict: ~25% exists. Atomic join with `lockForUpdate` and FIFO waitlist positions are genuinely reusable; everything about states contradicts §9 — including a live `full` state — and participant tracking is a single merged status field.**

- **One StateMachine class; forbidden transitions blocked; `event_status_history`** — **MISSING.** Transitions are scattered `->update(['status' => …])` calls with ad-hoc guards: `app/Services/Partner/BookingService.php:48-52,86-90,137-146,209`; `app/Http/Controllers/Employee/EventController.php:238,300`; `app/Console/Commands/ExpireStaleRecords.php:55-58`; `app/Console/Commands/CompleteEventsAndSettle.php:30,44`; `app/Http/Controllers/Admin/EventController.php:99`. No history table exists (full migration list).
- **States per H §9 (`pending_approval…settled`, 4 cancel variants, `expired`; `filled` deleted; capacity-full = `is_full` flag)** — **CONTRADICTS.** Actual enum: `open, full, waiting_business(→waiting_partner), confirmed, rejected, alternative_proposed, completed, cancelled` (`2026_04_21_000011:31`). The **forbidden `full`/filled state is present and actively queried** (`app/Http/Controllers/Employee/EventController.php:206`, `app/Services/Employee/HomeService.php:32`, `app/Services/Company/CommunityService.php:125`). Missing: `pending_approval, pending_provider, provider_alternative, booked, awaiting_payment, in_progress, settled, expired` and all four cancel variants (single `cancelled` + free-text `rejection_reason` instead). Capacity-full is handled by auto-jumping to `waiting_partner` when the last seat fills (`EventController.php:236-247`) — i.e., **provider request is triggered by capacity, not by registration close**, a different lifecycle from §9/§10.
- **Event fields (UTC storage, `registration_closes_at` derived, status vs funding_status, snapshot at confirmed)** — **MISSING.** Local `event_date` + `start_time` (`2026_04_21_000011:18-19`); no `registration_closes_at`, no `funding_status`, no snapshot. There is no "registration close" moment anywhere in the codebase (grep close/minimum: zero relevant hits).
- **Creator never sets price** — **PARTIAL.** Price derives from `venue_pricings` (`app/Services/Employee/EventCreationService.php:29-38`), but the creator chooses pricing/venues freely and there is no provider price contract. Creator name+phone shown to provider: bookings load `creator` (`app/Services/Partner/BookingService.php:28`) — **UNVERIFIED** at the UI layer.
- **Employee proposals with 48h approval window** — **CONTRADICTS.** Events go straight to `open` created by any community member (`EventCreationService.php:188`); no approval state or auto-reject job.
- **Three separate fields seat/payment/attendance + `participant_events` change log** — **CONTRADICTS.** Single merged `status` enum `joined|waitlisted|cancelled` (`2026_04_21_000012:15`, pivot `app/Models/EventParticipant.php`); no payment_status, no attendance_status, no change log. Worse, **withdrawal detaches the row** (`EventController::leave`, `app/Http/Controllers/Employee/EventController.php:292`), destroying participation history.
- **Join: members only, instant reserve, zero charge, atomic `lockForUpdate`** — **PARTIAL.** Atomic reserve is real: `Event::lockForUpdate()` inside a transaction (`EventController.php:202-264`), zero charge at join (charging happens later against community balance, `BookingService.php:54-90`). **Community-membership check at join is absent** (`EventController.php:196-276` checks only status + duplicates) — anyone in the guard can join any visible event (company scoping of visibility: **UNVERIFIED**).
- **Waitlist strict FIFO with offer windows (120→30→first-wins), closes with registration** — **PARTIAL.** FIFO positions with reordering (`EventController.php:251-263,332-347,503-521`) exist, but promotion is **instant and silent** — no offer window, no acceptance, no configurable platform setting, no close.
- **Withdrawal: free before close; none-with-refund after; no-show no refund** — **CONTRADICTS.** No close concept; instead a **percentage refund tier table (100/50/0 by hours-before)** governs cancellations (`app/Services/RefundService.php:23-27`, `config/refund.tiers`), which the spec's refund matrix forbids (full refund cases only, otherwise none).
- **provider_alternative acceptance → back to open + 6h free-withdrawal for participants** — **CONTRADICTS.** Accepting an alternative **removes every participant except the creator** (`app/Services/Company/CompanyEventService.php:89-103`) and re-runs funding math against the balance column.

---

## A8 — Recurrence templates & scheduling

**Verdict: ~20% exists. Recurrence is inline event columns generating all occurrences upfront — not templates with rolling 14-day generation; no blackouts; no min-not-met/reschedule machinery at all.**

- **Template entity (leader/coordinator/AM; weekly, biweekly, monthly; 14 days ahead; Sunday week-start)** — **PARTIAL/DIVERGES.** Recurrence lives on the event row (`parent_event_id`, `recurrence_type` incl. **`daily` which the spec doesn't offer, and lacking `biweekly`**, `recurrence_end_date`, `recurrence_days` — `2026_06_18_000001_add_recurrence_fields_to_events_table.php:11-14`). All occurrences (cap 52) are generated **at creation time in one shot** (`app/Services/Employee/EventCreationService.php:218-221,258-300`), not rolling 14 days by a 02:00 job. Day-31→last-day handled correctly (`EventCreationService.php:343-351` uses `min(day, daysInMonth)`).
- **`blackout_dates` (skip/shift per template)** — **MISSING** (grep blackout: zero hits in app + database).
- **Pause stops future generation; edits never touch generated events** — **MISSING.** Only whole-series cancel exists (`EventCreationService::cancelSeries:374-380`); no pause, no template editing semantics.
- **Min-not-met: reschedule once, same record (+7d, `reschedule_attempt`, `original_starts_at`), second failure → `cancelled_min_not_met`, no money moves** — **MISSING.** There is **no minimum-participants concept anywhere** (grep min_participants/minimum/reschedule: zero hits); venues have no min capacity either (`2026_04_21_000007`).
- **Deferred cross-community alternative (extend 24h once)** — **MISSING.**
- Note: generated occurrences also get spec-illegal financials — `company_subsidy=0`, `player_payment=total`, cost split by capacity (`EventCreationService.php:281-286`).

---

## A9 — Providers: calendar, decisions, reliability, suggestion

**Verdict: ~25% exists. A provider portal with panel-only booking decisions, alternatives, and a weekly schedule grid exists; the hierarchy is flat (no branches/activity-units), and bank-account approval, reliability scoring, decision deadlines, and the suggestion algorithm are absent.**

- **Hierarchy provider (CR, bank approved pre-payout, commission, reliability) → branches → activity units → availability calendar** — **PARTIAL.** `partners` has commission_rate (default 10, `2026_04_21_000003:27`), contact info, staff sub-accounts (owner/receptionist/accountant via `role`/`parent_id`, `2026_06_18_000001_add_role_and_parent_id_to_businesses_table.php:16-19`, `app/Enums/PartnerRole.php`). **No CR, no bank account (grep bank/iban: zero), no reliability score** — only a static `rating` decimal(2,1) (`2026_04_21_000003:24`) never updated by events. No branches (city/district sit on the partner row); `venues` ≈ activity units but with no min/max capacity or pricing type (`2026_04_21_000006`, `..._000007` duration+price only). A `slots` table exists but is nearly unused (`2026_04_22_160307`; only read in `app/Services/Partner/ScheduleService.php:88-97`).
- **Platform calendar sole truth; «حجز خارجي»; locking acceptance against double-booking** — **PARTIAL.** Weekly schedule grid from events exists (`ScheduleService::getScheduleGrid:20-70`); an overlap counter exists (`app/Models/Event.php:253-271`) but **`approve()` never checks or locks availability** — it locks only the community balance row (`app/Services/Partner/BookingService.php:63`). External-booking marking: MISSING.
- **Decisions only in the panel; signed single-use 72h links; first response wins; deadline 12h / 6h-before** — **PARTIAL.** Decisions are panel-only today (approve/reject/alternative with status guards that make the first decision stick — `BookingService.php:48-52,137-141,202-206`), which matches by accident of having no other channel. Notification-only links, 72h signing, and any decision deadline are MISSING (the only deadline in the system is the 30-minute post-approval payment window, `BookingService.php:55`).
- **Provider sees counts/slot/creator, never participant names** — **PARTIAL/UNVERIFIED.** Schedule grid exposes counts only (`ScheduleService.php:50-60`); booking list loads `creator` (allowed) — whether any partner page leaks the participant roster needs a UI check of `resources/js/pages/partner/requests/*`.
- **Reliability 0–100 start 80, event-driven deltas, hidden <10 samples, admin manual adjust** — **MISSING.**
- **Suggestion algorithm + mandatory logged override reason** — **MISSING.** The creating employee hand-picks the partner (`app/Services/Employee/EventCreationService.php:166`); no candidate ordering, no exclusion rules, no override log.
- **Price edits only before acceptance; admin approval under price contract** — **PARTIAL.** Alternatives may carry `proposed_amount` pre-acceptance (`BookingService.php:221`); no admin-approval hook, no price contracts.

---

## A10 — Money: pricing, funding, collection, refunds, gateway

**Verdict: ~5% exists. There is no payment collection at all — employees never pay anything, there is no gateway, no webhooks, no VAT, and money is floats. The one spec-aligned trait (nothing charged at join) is a side effect. Discounts — banned by the spec — are a full feature.**

- **Pricing types (unit/hour, package, per-person with frozen count); SAR; VAT-inclusive decomposed; integer halalas; no discounts** — **CONTRADICTS.** Pricing = venue × duration only (`2026_04_21_000007`). No package/per-person types, no VAT anywhere (grep vat: zero), all money `decimal` floats (events `2026_04_21_000011:23-29`, casts `app/Models/Event.php:60-73`). **Discounts are a first-class feature the spec bans**: table `2026_05_22_000002`, event fields `2026_05_22_000003`, partner CRUD (`app/Services/Partner/DiscountService.php`, pages `resources/js/pages/partner/discounts/`), applied in cost math (`app/Services/Employee/EventCreationService.php:42-53,78-86`).
- **Funding: subsidy = min(defined, wallet, total) at close; binding max-share ceiling shown at join; share locked at close; never charge more/twice** — **CONTRADICTS.** Subsidy is computed **at creation** as `min(total, community balance)` (`EventCreationService.php:55-58`) and **recomputed at provider approval, shifting shortfall onto players** (`app/Services/Partner/BookingService.php:70-83` recalculates `cost_per_person` upward) — the exact "binding promise" violation §12.3 forbids. Share divides by `capacity`, never final joined count (`EventCreationService.php:60-62`). No `funding_status`, no `not_due`, no holds.
- **Collection pipeline (fix count at close → wallet hold → WhatsApp demand + link → 120-min window → waitlist replacement)** — **MISSING** in its entirety. `player_payment`/`cost_per_person` are computed and displayed but **never collected from anyone**; the only "payment deadline" is a 30-minute company-side window after provider approval, enforcement = cancel + silent balance refund (`app/Console/Commands/ExpireStaleRecords.php:37-86`).
- **Exceptions (below-min cancel+refund-all, shortfall-above-min wallet cover, partial-hold recompute within cap, proactive low-balance alert)** — **MISSING** (no minimum concept, no holds, no alerts).
- **`PaymentGatewayInterface` + `LocalTestGateway`; mada/cards/Apple Pay; MoR = Teamat** — **MISSING.** No gateway code or package (grep gateway/webhook/checkout across app, config, composer.json: zero).
- **`payment_webhooks` raw store + idempotency; late-webhook auto-refund** — **MISSING.**
- **Refunds to original method, atomic reversal + idempotency, visible finance retry queue** — **CONTRADICTS.** Refunds exist only as percentage-tier credits back to the community balance column with no ledger entry (`app/Services/RefundService.php:76-92`); the 100/50/0 tier table (`RefundService.php:23-27`) is a policy the spec does not contain.
- **§12.2 padel worked example reproduces to the halala** — impossible today (floats, capacity-based split, no collection).

---

## A11 — Settlements, commission, invoicing

**Verdict: ~15% exists. A daily job aggregates commissions into monthly per-partner-per-company settlements at completion; the approval workflow, snapshots, 15-day cadence, bank-gated payout, and the entire company-billing/invoicing side are missing.**

- **Commission entry & settlement item only at `completed`** — **PARTIAL.** `CompleteEventsAndSettle` creates settlements + `platform_revenue` commission rows only for completed events (`app/Console/Commands/CompleteEventsAndSettle.php:52-101`) — trigger condition matches. But it runs **daily at 02:00** (`routes/console.php:11`), groups by **calendar month** (`:50`) and by (partner, company) pair (`settlements.company_id`, `2026_04_21_000018:12`) — not 15-day per-provider statements. Commission math is float `round()` on `total_amount` (`:71,86`).
- **Statement lifecycle draft → approved → paid; generator ≠ approver; payout only after approved bank account; recorded after transfer → events `settled`** — **CONTRADICTS/MISSING.** Statuses are `pending|processing|paid` (`2026_04_21_000018:15`) with no approval step, no approver identity, no bank accounts in the schema at all, and **no `settled` event state** (`2026_04_21_000011:31`). Partner-side view exists (`app/Services/Partner/PartnerSettlementService.php`), admin revenue view exists (`app/Http/Controllers/Admin/RevenueController.php:26-43`).
- **`settlement_items` with `snapshot_json`; paid statements immutable; corrections = reversal in next statement; `disputed`/`adjusted` states from day one** — **MISSING.** Nearest analog is `platform_revenue` rows per event (`2026_04_21_000020`) with no snapshot; nothing prevents editing paid settlements.
- **Billing: activated-employee definition, Gregorian cycle, invoice day 3 due 15, 15% VAT, contractual minimum, departed-but-activated** — **MISSING.** No invoices table, no billing code (grep invoice: zero hits in app + migrations).
- **Late payment: remind 7/15, block new event creation day 30, never block logins/cancel confirmed** — **MISSING.**
- **`tax_treatment` + `invoice_issuer` per transaction; Fatoora fields; `effective_from` fee changes** — **MISSING.**
- **`event_snapshot` at confirmed as sole financial-history source** — **MISSING** (financial reports read live rows, e.g. `app/Services/Admin/RevenueService.php:16-66`).

---

## A12 — Attendance, results, seasons, leaderboards

**Verdict: ~10% exists. A monthly participation-count leaderboard exists; there is no attendance concept, no results, no seasons.**

- **Auto-attendance at `completed`; 24h leader edit window; then admin-only with reason** — **MISSING.** `event_participants` has no attendance field (`2026_04_21_000012:15`); completion touches only the event row (`app/Console/Commands/CompleteEventsAndSettle.php:29-47`).
- **Absence: zero financial effect, excluded from consistency board + that month's activation** — **MISSING.**
- **Ghost-event early-warning KPIs (post-completion edit rate, manual intervention rate)** — **MISSING.**
- **Two measurement types (individual value, consistency); corrections audited + recomputed** — **MISSING.** No results tables. Instead there are out-of-spec gamification systems: challenges (`2026_05_22_100001`, `app/Services/Employee/ChallengeService.php` — progress incremented at join, `app/Http/Controllers/Employee/EventController.php:273`) and quick matches/polls.
- **Boards: skill + consistency, individual + department, points from first participation, no cross-company** — **PARTIAL/DIVERGES.** `app/Services/Employee/LeaderboardService.php` builds monthly top-5 employees/departments/communities by **participation count**, counting `confirmed` as well as `completed` events (`:49,82,112`), joined via *current* department (`:43` — wrong attribution per spec), company-scoped (`:46` — good). No skill/consistency split, no points model.
- **`seasons` auto-quarterly, immutable archive on close** — **MISSING** (no seasons table; leaderboards are rolling-month queries).
- **Schema pre-accommodates leagues (`matches`, `match_teams`) without breaking** — **DIVERGES.** Leagues are a **live feature** (`2026_05_13_100001` creates `leagues`, `league_departments`, `league_matches`; penalties added `2026_05_13_200001`; controllers `app/Http/Controllers/Company/LeagueController.php`, `Employee/LeagueController.php`) even though the spec defers them from v1 — raise as doc/code divergence, don't silently delete.

---

## A13 — Reports, KPI dictionary, exports

**Verdict: ~20% exists. A decent set of ad-hoc company reports exists, but the KPI formulas don't match the dictionary (notably "activation"), exports are a single unaudited JSON dump, and the coordinator monthly report is absent.**

- **KPI dictionary as fixed formulas (activation rate, attendance rate, cost/participation, cancellation rate, dept participation at-event-time, active communities ≥1 completed/30d)** — **PARTIAL/DIVERGES.** `app/Services/Company/ReportService.php` implements: `participationRate` — but defined as *is member of ≥1 community* (`:21-40`), **not** the spec's activation (*attended ≥1 completed event in cycle*); `budgetUtilization` (`:70-110`); `employeeActivity`/`inactiveEmployees`/`mostBookedActivities`/`communitiesReport` (rest of file). Attendance rate impossible (no attendance data); department attribution uses current department (see A12); cancellation-rate and active-communities formulas not implemented as specified.
- **GMV ≠ revenue: never one card, never one field** — **PARTIAL/AT-RISK.** Admin revenue endpoints return `total_gross`, `total_commission`, `total_net` side by side in single payloads/rows (`app/Services/Admin/RevenueService.php:56-66`, `app/Http/Controllers/Admin/RevenueController.php:42`); whether the UI cards conflate them: **UNVERIFIED** (`resources/js/pages/admin/revenue/`).
- **Exports Excel + PDF (employees/activation, events, wallet transactions, invoices), permission + scope checked, every export audited, phones only for AM, no financials for leader** — **CONTRADICTS/MISSING.** One export exists: a JSON `streamDownload` of report arrays (`app/Http/Controllers/Company/ReportController.php:33-50`) — not Excel/PDF, **not audit-logged**, no per-role redaction. Employee-side report page exists (`app/Services/Employee/EmployeeReportService.php`).
- **Coordinator monthly report (auto day 2, closed recommendation list, snapshot stored, AM + admin copies)** — **MISSING** (no coordinator role exists anywhere).

---

## A14 — Notifications

**Verdict: ~10% exists. In-app DB notifications work and are used broadly — but every message body is hardcoded at the call site, and WhatsApp/SMS, templates, logs, retries, quiet hours, and preferences are all absent. The WhatsApp Business onboarding critical path has no code to land on.**

- **Hierarchy WhatsApp → SMS → in-app; login survives WhatsApp failure** — **MISSING.** Only in-app rows (custom `Notification` model, table `2026_04_21_000019`) plus auth email (default mailer **`log`** — `config/mail.php:17`). No WhatsApp/SMS/twilio anywhere (grep: zero). Login is email+password so it trivially "survives" — but only because the OTP dependency (A3) is also missing.
- **Mandatory vs optional lists; user-disableable optionals** — **MISSING.** No preference storage.
- **Reminders exactly 2 (24h/2h); quiet hours 22:00–08:00 defer non-mandatory** — **MISSING.** Existing crons are different products: weekly digest, inactivity nudges, quick-match suggestions (`routes/console.php:12-16`).
- **Templates admin-managed, never hardcoded** — **CONTRADICTS.** Every notification text is an inline hardcoded Arabic string at 30+ call sites, e.g. `app/Services/Partner/BookingService.php:100-119,168-188,235-253`; `app/Http/Controllers/Employee/EventController.php:240-247`; `app/Console/Commands/ExpireStaleRecords.php:61-83`; `app/Services/Employee/EventCreationService.php:241-249`. The admin "notifications" screen composes manual broadcasts (`app/Http/Controllers/Admin/NotificationController.php:40`), it does not manage templates.
- **`notification_logs` (template, vars, channel, delivery status) as support's first diagnostic** — **MISSING.** The notifications table stores title/body/read_at only (`2026_04_21_000019:13-20`) — no channel, no delivery status.
- **Failure: 3 retries exponential → fallback → admin alert** — **MISSING** (no queue usage for notifications; `Notification::create` is synchronous inline).

---

## A15 — Admin & provider panels, audit, files & security

**Verdict: ~30% exists. Broad admin + provider panels exist with role gating and an activity log — but the log has no actor column, admin can hard-delete events, the role split doesn't match (no finance-approval or support roles), and the file/security/blackout apparatus is absent.**

- **Roles platform_admin / finance_admin (approvals only) / support_agent; finance can't approve own creations** — **PARTIAL/DIVERGES.** `AdminRole`: `super_admin | admin | accountant` (`app/Enums/AdminRole.php`) — accountant is **view-only**, there is no approval-capable finance role, no support_agent, and (since no financial-approval flows exist) no self-approval guard. Gating via `role:` middleware on two groups (`routes/web.php:234,270`; `app/Http/Middleware/CheckRole.php`).
- **Admin screens per H §16; provider panel per H §17; global screen rules (pagination-20, states, financial confirm dialogs, mobile/desktop-first)** — **PARTIAL.** 12 admin controllers + pages (`app/Http/Controllers/Admin/*`, `resources/js/pages/admin/*`), full partner portal (`resources/js/pages/partner/*`) with permission-per-route middleware (`app/Http/Middleware/PartnerPermission.php`). Pagination defaults are 15 not 20 (e.g. `app/Services/Partner/BookingService.php:34`). Screen-rule compliance (empty/loading/error states, confirm-dialog contents): **UNVERIFIED** at the UI level.
- **Manual state change: admin-only, written reason, before/after logged, history readable first** — **PARTIAL/CONTRADICTS.** Admin cancel exists but requires **no reason** and logs no before/after (`app/Http/Controllers/Admin/EventController.php:85-110`); `destroy()` **hard-deletes an event outright** (`:72-80`) — deleting financial records, which both docs forbid; there is no state history to read (A7).
- **`audit_logs` append-only with mandatory catalog (permission changes, financial ops, bank changes, exports, deactivations, context switches); AM summary view** — **PARTIAL/CONTRADICTS.** `activity_logs` exists and is written from ~15 sites via `ActivityLogService` (`app/Services/ActivityLogService.php:13-27`), but the schema has **no actor/user column at all** (`2026_04_21_000025:13-20`) — you cannot answer "who did it"; it is not append-only-enforced, and exports/deactivations are not logged. No separate security-event log.
- **Files: upload matrix (logo/receipt/contract), real MIME check, versioning, financial files never hard-deleted; retention** — **MISSING beyond avatars.** Only avatar/image validation found (`app/Http/Requests/Employee/UpdateProfileRequest.php:28`, 2MB); no receipts/contracts, no versioning/retention. S3 driver package is installed (`composer.json:18`) — plumbing available for A0's migration.
- **Central category/activity/measurement tree admin-owned; blackout + thresholds screens** — **PARTIAL.** Category tree with `parent_id` + admin CRUD exists (`2026_06_04_000001`, `app/Http/Controllers/Admin/CategoryController.php`); measurement types and blackout/threshold screens MISSING.
- **Support tooling (search + state history, notification log read, resend invite/OTP, escalation)** — **PARTIAL.** Support inbox = public contact-form messages (`2026_07_13_000001`, `app/Http/Controllers/Admin/SupportMessageController.php`); no state-history or notification-log diagnostics (neither store exists), no resend tooling.
- **Quarterly permission review / secret rotation runbooks** — **MISSING** (ops docs, nothing in repo).

---

## A16 — Acceptance test suite (11 scenarios)

**Verdict: ~5% exists. Test infrastructure (Pest) is healthy; none of the 11 owner-acceptance scenarios is automated — and most cannot be until A6/A7/A10/A11 exist.**

- Existing suite: auth flows, guard isolation, rate limiting, policies, dashboard smoke tests (`tests/Feature/` — 21 files, e.g. `tests/Feature/Auth/GuardIsolationTest.php`, `tests/Feature/Policies/EventPolicyTest.php`). **MISSING:** all of scenarios 1–10.
- Scenario 11 (cross-company → 404 + audit): **PARTIAL-adjacent** — guard isolation is tested (`GuardIsolationTest.php:64-88`) but company-scope probes currently return 403 and are unaudited (see A3), so the scenario as specified would fail today.
- Scenario 6 (100 concurrent joins → 10+90): the `lockForUpdate` join path (`app/Http/Controllers/Employee/EventController.php:202-264`) is the one piece of production code already shaped to pass this.

---

## Summary table

| Brief | % existing | Rework risk | Notes |
|---|---|---|---|
| A3 identity/auth/permissions | ~15% | **Very high — CONTRADICTS** | 4 separate account tables + guards, `users.role`, `employees.company_id`, globally-unique employee email blocks multi-company; no OTP; bare-role checks; 403 not 404; company self-credits wallet |
| A4 companies/departments/onboarding | ~30% | Medium | CRUD + email invites + 7-day expiry exist; no contract/settings/CSV import/dept history/WhatsApp |
| A5 communities/leadership | ~35% | High — CONTRADICTS | `leader_id` column + parallel captain pivot; writable `balance`; leave = row delete; no dormancy; announcements minimal; out-of-spec polls/leagues attached |
| A6 wallets/ledger | ~10% | **Very high — CONTRADICTS** | Writable float balances, 2-type memo ledger, silent balance moves with no transaction row, instant self-service top-up, cascade-delete on financial rows |
| A7 event state machine | ~25% | **Very high — CONTRADICTS** | 8-state legacy enum incl. live `full`; no state-machine class/history; merged participant status; withdrawal deletes rows; % refund tiers; alternative-accept ejects participants. Reusable: `lockForUpdate` join + FIFO waitlist |
| A8 recurrence/scheduling | ~20% | High | Inline recurrence columns, upfront 52-occurrence generation, `daily` type (not in spec), no biweekly/blackouts/pause/min-not-met/reschedule |
| A9 providers | ~25% | Medium-high | Portal + panel-only decisions + staff roles exist; flat hierarchy, no bank/reliability/deadlines/suggestion; approval doesn't lock availability |
| A10 money/collection/gateway | ~5% | **Very high — CONTRADICTS** | No collection, no gateway/webhooks/VAT/halalas; player share raised after join (breaks binding ceiling); discounts feature is spec-banned |
| A11 settlements/invoicing | ~15% | High | Completion-triggered monthly settlement job exists; no draft→approved→paid, no snapshots, no 15-day cadence, no `settled` state, zero invoicing/billing/tax code |
| A12 attendance/results/seasons | ~10% | Medium (mostly greenfield) | No attendance/results/seasons; leaderboard = monthly participation counts w/ wrong attribution; leagues live though spec-deferred |
| A13 reports/KPI/exports | ~20% | Medium | Report set exists but formulas diverge (activation ≠ spec), JSON-only unaudited export, no coordinator report |
| A14 notifications | ~10% | High — CONTRADICTS | In-app only; all texts hardcoded at 30+ sites; no templates/logs/channels/retries/quiet-hours; WhatsApp onboarding has no landing code |
| A15 admin/audit/files/security | ~30% | Medium-high | Panels + role middleware + activity log exist; log has **no actor**, admin hard-deletes events, role split wrong, no files/security/blackout apparatus |
| A16 acceptance suite | ~5% | Low (blocked) | Pest infra + auth/policy tests only; 11 scenarios blocked on A6/A7/A10/A11 |

## Top 10 most dangerous CONTRADICTS findings

1. **Writable balance columns everywhere, ledger optional.** `wallets.balance` + `communities.balance` mutated directly in ≥6 paths; refunds/reversals/approvals move money **with no transaction row** (`app/Services/RefundService.php:76-92`, `app/Console/Commands/ExpireStaleRecords.php:46-58`, `app/Services/Partner/BookingService.php:54-90`). Breaks both universal financial rules; requires ledger rebuild + opening-balance migration.
2. **Identity model inverted:** four account tables with passwords, `users.role`, `employees.company_id`, and a globally-unique employee email that makes multi-company membership *impossible* (`config/auth.php:43-63`, `2026_04_21_000008:14`). Every controller/service/test assumes per-portal guards — pervasive rework.
3. **The forbidden `filled`/`full` state is live** in the events enum and queried in four places (`2026_04_21_000011:31`, `app/Http/Controllers/Employee/EventController.php:206`), and the whole lifecycle (capacity triggers provider request; no registration close; no `awaiting_payment`/`in_progress`/`settled`) contradicts the §9 backbone.
4. **Merged participant status + row deletion on withdrawal** (`2026_04_21_000012:15`, `EventController.php:292`): the spec's three-field model and `participant_events` history cannot be retrofitted without a data migration, and current deletes are already destroying history.
5. **Binding price ceiling violated by design:** provider approval recalculates and **raises** `cost_per_person` when community balance falls short (`app/Services/Partner/BookingService.php:70-83`); shares divide by capacity, not final count (`app/Services/Employee/EventCreationService.php:60-62`) — the «وعد ملزم» rule has no anchor.
6. **Company self-credits its own wallet instantly** — no request/review/receipt/reference, no finance-admin, no self-approval guard (`app/Http/Controllers/Company/WalletController.php:43-52`).
7. **All money is float `decimal` SAR**, with `round()` arithmetic in commissions/refunds/costs (events, wallets, settlements migrations; `CompleteEventsAndSettle.php:71,86`) — the halala-exact §12.2 acceptance example cannot reproduce; every money column needs an integer-halalas migration.
8. **Discounts are a shipped feature** (table, event fields, partner CRUD + UI, cost math) while the spec bans «خصم» outright (`2026_05_22_000002`, `app/Services/Partner/DiscountService.php`, `EventCreationService.php:42-53`).
9. **Audit log has no actor column** (`2026_04_21_000025`, `app/Services/ActivityLogService.php:13-27`) and admin can **hard-delete events** (`app/Http/Controllers/Admin/EventController.php:72-80`); no soft deletes on any entity except categories — "who did what" and "nothing financial is ever deleted" are both unenforceable today.
10. **Notification texts hardcoded at 30+ call sites** with no template/channel/delivery model (`2026_04_21_000019`, e.g. `BookingService.php:100-119`) — A14's admin-managed templates and `notification_logs` mean touching every one of those sites, and the WhatsApp-first hierarchy has no seam to plug into.

**Honorable mentions:** cross-company probes return 403 not 404 and are unaudited (`WalletService.php:72`); `communities.leader_id` plus a *second* captain-pivot leadership representation (`2026_04_21_000009:17`, `2026_04_21_000010:15`); percentage refund tiers 100/50/0 not in the spec (`RefundService.php:23-27`); alternative-acceptance ejects all participants instead of granting a 6h withdrawal window (`CompanyEventService.php:89-103`); spec-deferred leagues fully live (`2026_05_13_100001`).
