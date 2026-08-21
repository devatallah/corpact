# Teamat — Agent Backlog (prioritized)

Derived from the two source documents in this folder — **they remain the source of truth**:

- `technical-handover-v2.md` (وثيقة التسليم التقني v2.0) — cited as **H §n**
- `roles-procedures-guide.md` (دليل الإجراءات لكل الأدوار v1.0) — cited as **G/section-name**

**How to use:** each task below is a self-contained brief for one agent. Run in listed order — it follows the handover's own phase plan (H §23) plus its severity markers. Every agent must:

1. Read the cited sections of both source docs before touching code.
2. Audit what the codebase already implements — much exists; verify, never assume greenfield.
3. Raise doc/code divergences as notes instead of improvising (binding rule: «لا اجتهاد في المنتج» — H §0).
4. Never edit balances directly, never delete financial records, never allow self-approval of financial actions — the three universal rules repeated across both docs.

---

## Priority map

| # | Agent | Phase | Blocking? |
|---|-------|-------|-----------|
| A0 | Production safety & ops baseline | 0 | **Hard gate — no feature work before this** |
| A1 | Auto-`completed` transition + job scheduler skeleton | 0 | Hard gate item |
| A2 | Terminology & schema-rule sweep | 0/cross | Phase-0 item |
| A3 | Identity, auth (OTP), scoped permissions | 1 | Blocks everything multi-tenant |
| A4 | Companies, departments, employee onboarding | 2 | |
| A5 | Communities & leadership | 2 | |
| A6 | Wallets & ledger core | 2/4 | Foundation for all money |
| A7 | Event state machine, join/waitlist | 3 | Backbone («العمود الفقري») |
| A8 | Recurrence templates & scheduling | 3 | |
| A9 | Providers: calendar, decisions, reliability, suggestion | 3 | |
| A10 | Money: pricing, funding, collection, refunds, gateway abstraction | 4 | Gateway choice due end of phase |
| A11 | Settlements, commission, invoicing | 5 | |
| A12 | Attendance, results, seasons, leaderboards | 6 | |
| A13 | Reports, KPI dictionary, exports | 6 | |
| A14 | Notifications (WhatsApp/SMS/in-app) | 7 | WhatsApp onboarding = critical path, start now |
| A15 | Admin & provider panels, audit log, files/security | 8 | |
| A16 | Acceptance test suite (11 scenarios) | 9 | Launch gate |

---

## A0 — Production safety & ops baseline (Phase 0 — HARD GATE)

**Goal:** eliminate the live risks the handover flags as accumulating daily. No work from H §5–18 may start before this is signed off (H §22).

**Read:** H §20, §22. G: أدمن تيمات (ops alerts, backups).

**Build:**
- `APP_DEBUG=false` in production (currently leaks paths/env/secrets on error).
- Migrate file storage local → S3: fully private bucket, signed URLs valid 15 min, no public file ever.
- Real mail driver instead of `log` (nothing reaches users today).
- Automated daily backups, 30-day retention, **documented restore test** («نسخة غير مختبرة ليست نسخة») — RTO 4h, RPO ≤ 24h.
- Queue infra: Redis + Horizon + Supervisor (note: `database/migrations/2026_07_06_151655_create_jobs_table.php` exists uncommitted — reconcile with Redis decision).
- Baseline inventory deliverable: repo, branches, environments, PHP/Laravel/DB versions, packages, current schema.
- Step-by-step deployment document (no single-person knowledge).
- Three environments (dev/test/prod), fully separate DBs and secrets; secrets never in repo.

**Done when:** production is safe, a backup restore was demonstrated, deployment doc exists.

## A1 — Auto-`completed` transition + scheduled-jobs skeleton (Phase 0)

**Goal:** the automatic transition to `completed` at event end — without it settlements, invoicing, leaderboards, activation billing are all broken (Phase-0 item #5).

**Read:** H §9 (state `completed`), §13 (auto-attendance), §20 (jobs table). G: الموظف/الحضور التلقائي.

**Build:**
- Job: move events to `in_progress` then `completed` (every 5 min); on `completed`, all confirmed participants auto-marked `attended` — no check-in of any kind.
- Full scheduled-job skeleton per H §20 table (template generation 02:00; close registration every 5 min; payment deadline every 1 min; provider/waitlist deadlines every 5 min; attendance window hourly; settlements every 15 days; invoices day 3; dormancy daily; reminders every 15 min; balance reconciliation 04:00).
- Every job idempotent, keyed (entity + job + period).
- Retry 3× exponential backoff → failure list + admin alert; **dead-man watchdog**: alert if a critical job hasn't run within 2× its cadence («الصمت ليس دليل نجاح»).

**Done when:** an event crosses open→completed with zero human intervention (Phase-3 acceptance depends on this plumbing).

## A2 — Terminology & schema-rule sweep (Phase 0 / cross-cutting)

**Goal:** enforce the binding vocabulary and schema rules everywhere — UI, code, tables, columns, endpoints, notifications.

**Read:** H §2, §21 (قواعد إلزامية في المخطط). G: أساسيات/المصطلحات.

**Build:**
- Term substitutions: الشركة (not HR), مسؤول الحساب, مزوّد الخدمة, رسوم النظام, فعالية, الفعالية المكتملة, مجتمع, حصة الفرد, استقطاع/سحب. Banned outright: «خصم» (as discount), «مجاني», «HR», «نادٍ», «تطبيق حجز», «اشتراك».
- ⚠️ Divergence to resolve: spec wants `hr_name/hr_phone` → `company_admin_name/company_admin_phone`; repo already renamed them to `contact_*` (commit a52783c). Verify and either align or document the deviation.
- Schema rules audit: no `company_id`/`role` on `users`; no `leader_id` on `communities`; no writable balance column; three separate participant status fields; `filled` state removed everywhere; all amounts integer halalas (never float); `deleted_at` on all entities.
- ERD deliverable (keys, indexes, unique constraints) reviewed **before** further migrations (H §21 gate); minimum table list per H §21.

## A3 — Identity, auth, scoped permissions (Phase 1)

**Goal:** one global account, role-with-scope permissions, watertight company isolation.

**Read:** H §3, §4. G: أساسيات (auth), ملحق أ (sessions), ملحق ب (permission matrix).

**Build:**
- `users` = identity only; `company_memberships`; `role_assignments` (user, role, scope_type ∈ platform/company/community/provider, scope_id).
- Every authz check = permission + scope pair, never bare role. Implement the full G/ملحق-ب matrix.
- Company isolation via Eloquent **Global Scope** at query level; `company_id` only from session context, request input ignored; cross-company entity access returns **404, not 403**, and is audit-logged.
- Auth matrix: employee/leader/AM = phone + WhatsApp OTP (30-day session); provider = phone + OTP, admin-invited (14-day); Teamat admin/finance = email + password + OTP, both factors (12-hour).
- OTP: 6 digits, 5-min validity, 3 resends/hour; 5 failures → 15-min lock; SMS fallback if WhatsApp fails within 60s.
- Global account linking: existing phone under another company → new membership, never a duplicate account; context switcher for multi-scope users, every switch audited.
- Departure cascade: deactivate, revoke all sessions immediately, remove/transfer leaderships (notify AM), cancel unconfirmed participations; confirmed paid events survive.
- No self-approval of financial actions **enforced in code**.

**Done when:** one user with three roles in three scopes sees only their own; cross-company probe → 404 (acceptance scenario 11).

## A4 — Companies, departments, employee onboarding (Phase 2)

**Goal:** company setup and clean employee lifecycle.

**Read:** H §5. G: دليل الشركة, دليل مسؤول الحساب.

**Build:**
- Company: name, CR, logo, contract (fee/minimum/coordinator — values from owner), settings, main wallet; timezone field (v1 fixed Asia/Riyadh).
- Settings with defaults: `employee_can_create_event` (off), `default_funding_mode` (مختلط), `default_subsidy` (0), `registration_close_hours` (24), `allow_absence_marking` (on).
- Departments; one per employee at a time; `department_history` — historical reports attribute to department **at event time**.
- CSV/Excel upload (name, email, phone, department, employee# optional); instant validation (Saudi phone format, in-file dupes, existing dupes) → downloadable per-row error report; invites blocked until clean.
- WhatsApp invite, 7-day resendable link; no new account on expiry — resend only.
- Departed employee still counts in the cycle's invoice if activated before leaving.

**Done when:** 100-employee file yields a correct row-level error report (Phase-2 acceptance).

## A5 — Communities & leadership (Phase 2)

**Goal:** community entity with multi-leader model and lifecycle states.

**Read:** H §6. G: دليل قائد المجتمع, دليل مسؤول الحساب (المجتمعات).

**Build:**
- Community = one company + one activity; identity, status, sub-wallet, members, events, templates, leaderboards, seasons. No cross-company communities.
- Leaders via `role_assignments` with `is_primary` on exactly one; **drop `leader_id` column** if present; leadership transfer manual only — never auto-assigned.
- Leaderless: 14 days → alert AM; 30 days → dormant (خامل), generation stops.
- Membership open by default; leave/rejoin recorded as states+dates, never deletes; leaving doesn't cancel confirmed paid participation; leaderboard rank survives leaving.
- Remove (leader, documented reason) vs ban (AM only).
- Announcements: text+link only, leader/coordinator only; comments only under events; 15-min edit/delete window; report button → AM. No chat, no DMs.

## A6 — Wallets & ledger core (Phase 2 foundation, Phase 4 rules)

**Goal:** the financial spine — ledger-only money, holds, top-ups.

**Read:** H §12.5. G: أساسيات (القاعدتان الماليتان), الأدمن المالي.

**Build:**
- Main wallet per company; community sub-wallets funded by AM allocation; leader sees balance, cannot fund.
- No writable balance column; balance = Σ ledger. Cached balance allowed only if updated in the same transaction + nightly reconciliation job that alerts on any mismatch. Negative balance must not persist one hour.
- Transaction types: top_up, allocation, allocation_reversal, hold, hold_release, capture, refund, commission, settlement, adjustment; fields: wallet, type, amount (halalas), direction, reference, actor, idempotency key, timestamp.
- Immutability: no edit/delete ever; corrections = linked reversal transactions; deliberately no delete button anywhere.
- Bank top-up flow: request (amount, date, last-4, reference, receipt image) → submitted → under_review → approved/rejected; **unique (reference + amount)**; finance-admin approval, no self-approval; rejection documented + notifies AM; un-approval = reversal with higher privilege.

**Done when:** community allocation shows in ledger, not a balance column (Phase-2 acceptance).

## A7 — Event state machine, join/withdraw/waitlist (Phase 3)

**Goal:** the single state machine — «العمود الفقري للنظام كله» — implemented in one class with exhaustive transitions.

**Read:** H §7, §9, §10. G: الموظف (الانضمام/الانسحاب/الدفع), قائد المجتمع (آلة الحالات).

**Build:**
- One StateMachine class; any transition not in the H §9 table is forbidden; every transition → `event_status_history` (actor, reason, time).
- States: pending_approval → open → pending_provider → provider_alternative → booked → awaiting_payment → confirmed → in_progress → completed → settled; cancels: cancelled_min_not_met / cancelled_provider / cancelled_company / cancelled_payment_failed; expired. `filled` deleted permanently; capacity-full is the `is_full` **flag**, not a state.
- Event fields per H §7 (UTC storage/Riyadh display, registration_closes_at derived, status + funding_status separate, snapshot at confirmed…). Creator never sets price; creator's name+phone shown to provider (disclose at creation).
- Employee proposals: 48h approval window then auto-reject with notification.
- `event_participants`: three separate fields — seat_status / payment_status / attendance_status — plus `participant_events` change log (actor, time, reason).
- Join: members only, instant reserve, **zero charge at join**; atomic reserve with `lockForUpdate` in transaction — read-then-write forbidden. Acceptance: 100 concurrent joins on 10 seats → exactly 10 + 90 waitlisted.
- Waitlist: strict FIFO; offer window 120 min → 30 min (<6h to close) → immediate first-wins (<1h); closes with registration + notification; window configurable platform-wide only.
- Withdrawal: free before close; none-with-refund after; no-show = no refund.
- provider_alternative acceptance → back to open with new date + 6-hour free-withdrawal window for participants.

## A8 — Recurrence templates & scheduling (Phase 3)

**Goal:** the automation engine — success is events happening without human touch.

**Read:** H §8. G: قائد المجتمع (قوالب التكرار), أدمن تيمات (blackout).

**Build:**
- Templates by leader/coordinator/AM; weekly, biweekly, monthly; generated 14 days ahead; week starts Sunday; day-31 → last day of month.
- `blackout_dates` (admin-managed: holidays, Ramadan): skip by default or shift one week per template setting.
- Pause stops future generation only; edits apply only to later generations — never touch generated events.
- Min-not-met at close: reschedule **once**, same day/time +7 days, **same record** (`reschedule_attempt`, `original_starts_at` — never a new row); second failure → `cancelled_min_not_met` + review-minimum alert; **no money moves on either attempt**; provider (if accepted) informed immediately.
- Deferred cross-community alternative: extend registration once by 24h, then reschedule.

## A9 — Providers: calendar, decisions, reliability, suggestion (Phase 3)

**Goal:** provider hierarchy and the binding decision channel.

**Read:** H §11, §17. G: دليل مزوّد الخدمة.

**Build:**
- Hierarchy: provider (CR, contact, bank account **manually approved before any payout**, commission rate, reliability, status) → branches (address, coords, hours) → activity units (activity, min/max capacity, pricing type, price, duration) → availability calendar.
- Platform calendar = sole source of truth; external bookings marked «حجز خارجي»; acceptance locks the unit in a locking transaction (no double booking); stale-availability conflicts: provider bears cancellation + reliability drop.
- Decisions only in the panel: WhatsApp/email are notification-only with signed single-use 72h links; textual "yes" binds nothing; first response wins, later ones get «تم اتخاذ القرار مسبقاً»; deadline 12h or 6h-before-slot.
- Provider sees: community+company names, count, slot, creator contact — never participant names/numbers, never attendance role.
- Reliability: 0–100 start 80; +2 timely accept, −3 late, −1 reject, −15 cancel-after-accept, +3 clean completion; hidden until 10 samples; provider sees behaviors only (v1); admin-only manual adjustment with documented reason.
- Suggestion algorithm (no ML): preferred providers first → exclude unavailable/wrong-activity/over-budget/disabled → order by price, reliability, not-same-provider-3×-running, proximity; zero results surfaced with reason (never create with unavailable provider); override always allowed with **mandatory** logged reason (future automation training data).
- Price edits only before acceptance; admin approval required when a price contract exists.

## A10 — Money: pricing, funding, collection, refunds, gateway (Phase 4)

**Goal:** the five inviolable rules plus the full collection pipeline. **Gateway decision due from owner before this phase ends.**

**Read:** H §12.1–12.6. G: الموظف (الدفع), الأدمن المالي.

**Build:**
- Pricing types: per unit/hour, package, per person (count frozen at request-send, capacity locks, joiners = substitutes). SAR only; prices VAT-inclusive, decomposed into base_amount + vat_amount; integer halalas; no discounts/promos.
- Funding: subsidy = min(defined, wallet balance, total) at close; max share = (total − subsidy) ÷ minimum shown at join — **binding ceiling enforced in code** («وعد ملزم»); actual share = remaining ÷ final count, locked at close; never charge more, never charge twice, never surcharge after payment.
- Collection: nothing during registration (`not_due`) → at close fix count, final share, wallet hold → WhatsApp payment demand with link; window 120 min or until 6h before start; seat held whole window; non-payers replaced from waitlist.
- Exceptions (all mandatory): below-min after payment failure → cancel + refund all + release hold; shortfall above min → wallet covers or cancel (shares never change); wallet can't cover subsidy → partial hold + recompute within cap, else cancel; **proactive low-balance alert at minimum-reached** to leader + AM.
- Gateway: everything behind `PaymentGatewayInterface` (createPayment/getStatus/refund/verifyWebhook/parseWebhook) + `LocalTestGateway`; no SDK calls in controllers/models; mada + cards + Apple Pay; Teamat = Merchant of Record (statement shows تيمات); gateway fees out of Teamat commission.
- Webhooks: stored raw in `payment_webhooks` (signature, status, idempotency key); duplicates ignored via key; late webhook honored unless seat re-assigned → auto-refund.
- Refunds: always to original method (no employee wallet — regulatory); atomic (reversal entry + gateway call + idempotency key); failures → visible finance-admin queue with auto-retry, never silent.
- Full-refund cases: provider cancel, company cancel, min not met, mass collection failure, admin cancel. No refund: post-close withdrawal, no-show.

**Done when:** the §12.2 padel worked example reproduces to the halala (300 total, 100 subsidy, min 4, 6 joined → 33.33 share, 199.98 collected, 264.00 provider net); duplicate webhook creates no second entry.

## A11 — Settlements, commission, invoicing (Phase 5)

**Goal:** provider payouts and company billing, all triggered only by `completed`.

**Read:** H §12.7–12.10. G: مزوّد الخدمة (التسويات), الأدمن المالي, مسؤول الحساب (الفوترة).

**Build:**
- Commission entry **only** at `completed`; settlement item created at `completed`, never before.
- Statements every 15 days per provider; draft → approved → paid; payout only after bank account approved; recorded after actual transfer → events `settled`; generator ≠ approver.
- `settlement_items` with snapshot_json (provider name, price, commission rate at computation) — paid statements never edited; corrections = reversal + corrective item in **next** statement, audited; schema carries `disputed`/`adjusted` states from day one (dispute UI deferred).
- Billing: activated employee = attended ≥1 completed event in cycle, not absent, counted once; Gregorian monthly cycle; invoice day 3, due 15 days; 15% VAT on fees; contractual monthly minimum; departed-but-activated counted.
- Late payment: remind day 7, day 15; block **new event creation** after day 30 — never block logins, never cancel confirmed events («الموظف لم يخطئ»).
- `tax_treatment` + `invoice_issuer` on every transaction (agent on activity value, principal on commission/fees — provisional pending accountant); Fatoora-ready invoice fields (serial, QR, VAT numbers); fee/commission changes only via future `effective_from`.
- `event_snapshot` at confirmed is the sole source for all financial history.

## A12 — Attendance, results, seasons, leaderboards (Phase 6)

**Goal:** automatic attendance with its safeguards, and the two boards.

**Read:** H §13. G: قائد المجتمع (الحضور والنتائج), الموظف (اللوحات).

**Build:**
- Auto-attendance at completed (no QR, no provider role); leader/coordinator edit window 24h; then locked — admin-only exception with documented reason.
- Absence: zero financial effect; excluded from consistency board and that month's activation count; recorded on employee.
- Monitor post-completion edit rate + manual intervention rate as ghost-event early-warning KPI.
- Two measurement types only (individual value, consistency); results by leader/coordinator; corrections need reason + audit + recomputation.
- Boards: skill + consistency (points from first participation), individual + department levels; consistency prioritized; no cross-company comparison.
- `seasons` auto-created quarterly per community; close → immutable archive snapshot, nothing deleted, new season from zero.
- Schema must pre-accommodate deferred leagues (`matches`, `match_teams`) without breaking.

## A13 — Reports, KPI dictionary, exports (Phase 6)

**Goal:** fixed formulas, correct attributions, audited exports.

**Read:** H §15. G: مسؤول الحساب (التقارير), المنسّق المُدار (التقرير الشهري).

**Build:**
- KPI dictionary as implemented formulas (Riyadh time, monthly default, cancelled excluded): activation rate, attendance rate, cost per participation, cancellation rate, participation by department (at-event-time attribution), active communities (≥1 completed / 30 days).
- **GMV ≠ revenue**: never in one card, never summed in one field.
- Exports (Excel + PDF): employees/activation, events & results, wallet transactions, invoices; same permission + company-scope checks; every export audited (who/what/when/row count); phone numbers only in AM's export; leader export carries no financial data.
- Coordinator monthly report: auto day 2 (completed events, activation, dormant communities, cancellation reasons, MoM), recommendations from **closed list** + one note field, delivered AM + admin copy, stored as fixed monthly snapshot.

## A14 — Notifications (Phase 7) — WhatsApp onboarding is critical path, start immediately

**Goal:** WhatsApp-first messaging that degrades safely.

**Read:** H §14. G: أساسيات (الإشعارات), وكيل الدعم (سجل الإشعارات).

**Build:**
- Hierarchy: WhatsApp Business API → SMS fallback → in-app; login must survive WhatsApp failure entirely (Phase-7 acceptance).
- Mandatory list (never disableable): invite, OTP, booking request, confirmation, payment demand, cancellation/reschedule, waitlist offer, low-wallet alert, invoice, settlement ready. Optional (user-disableable): new event, closing-soon, reminders.
- Reminders exactly 2 (24h, 2h); quiet hours 22:00–08:00 defer non-mandatory (OTP exempt).
- Templates admin-managed, **never hardcoded**; `notification_logs` (template, vars, channel, delivery status, time) — support's first diagnostic for «ما وصلني شيء».
- Failure: 3 retries exponential → fallback channel → log + admin alert.
- ⚠️ Off-code critical path: WhatsApp Business account + template approval takes days–weeks and login depends on it; SMS must work standalone before any pilot.

## A15 — Admin & provider panels, audit, files & security (Phase 8)

**Goal:** the operational cockpit with enforced role separation.

**Read:** H §16, §17, §18, §19. G: أدمن تيمات, الأدمن المالي, وكيل الدعم.

**Build:**
- Admin roles in code: platform_admin (all but financial approvals), finance_admin (financial approvals only), support_agent (read + limited); finance admin cannot approve own creations (Phase-8 acceptance).
- Admin screens per H §16; provider panel per H §17; global screen rules (H §18): search/filter/sort/pagination-20, empty/loading/error states, confirm dialogs showing amount+effect for financial/cancel actions, mobile-first employee/leader, desktop-first the rest.
- Manual event state change: admin-only, written reason, before/after values logged; state history readable before intervening.
- `audit_logs` append-only; mandatory catalog: permission changes, all financial ops, bank account changes (a change after approval = security event), manual state changes, post-window attendance edits, result corrections, suggestion overrides, exports, deactivations, context switches. Admin sees all; AM sees own-company summary.
- Files: upload matrix (logo ≤2MB, receipt ≤5MB, contract ≤10MB), real MIME check, no executables, versioning, contracts/financial files never hard-deleted; retention schedule per H §19.
- Security ops: separate security-event log, quarterly permission review, rotate all secrets on any contractor departure (non-negotiable).
- Central category/activity/measurement tree admin-owned; providers cannot extend it. Blackout days + platform thresholds screens.
- Support tooling: search + state history read, notification log read, resend invite/OTP within limits, escalation matrix per G.

## A16 — Acceptance test suite (Phase 9 — launch gate)

**Goal:** automate the 11 owner-acceptance scenarios (H §23) as repeatable tests.

1. Full Path-A lifecycle (wallet-funded) creation → settlement.
2. Full Path-B lifecycle (employee-paid).
3. Mixed funding reproducing the §12 worked example to the halala.
4. Double min-failure → reschedule → final cancel, zero deductions.
5. Provider cancellation after confirmation → full refund + hold release + no commission.
6. 100 concurrent joins on 10 seats → exactly 10 + 90.
7. Duplicate webhook (no second entry) + late webhook handling.
8. Attendance edit within 24h reflects in leaderboard + billing count.
9. Settlement statement for a provider with 12 events.
10. Monthly invoice with activated / non-activated / mid-cycle-departed employees.
11. Cross-company access → 404 + audit entry.

---

## Blocked on the product owner (not agent work — track separately)

| Item | Blocks | Doc says |
|------|--------|----------|
| Payment gateway choice + sandbox keys | Commercial launch; due before end of Phase 4 | build behind interface meanwhile |
| Chartered accountant tax sign-off | **First real invoice** — hard stop | build direction: agent on activity value, principal on commission/fees |
| PDPL legal review of privacy/retention | Launch | |
| Contract numbers (fee per activated employee, monthly minimum, commission %) | Billing config | no defaults allowed |
| WhatsApp Business API account + templates | Any pilot (login depends on it) | start immediately |
| Brand identity file | UI polish | Almarai/Inter, #C8FF00/#0A0A0A, no gradients/shadows |
| Pending assumptions to confirm | Launch review | subsidy default type, halala fractions → Teamat commission, below-min after provider accept → cancel, departed-creator alternative-time → primary leader, bilingual content policy |

## Standing prohibitions (apply to every agent)

- No monetizable or transferable points — active prohibition, not a deferral.
- Deferred v1 items (leagues, calendar sync, SSO, dispute UI, QR check-in, ratings, promo codes, provider API) must not require schema or state-machine changes when added later.
- Never punish employees for company arrears (no login blocks, no cancelling confirmed events).
- Delivery is judged by acceptance criteria, not by declaring done.
