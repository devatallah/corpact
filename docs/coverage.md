# Spec coverage — every point, with status

An independent audit of the two source documents against the code on `spec-rebuild`. Four auditors read the specs line by line and verified each requirement against `file:line`, rather than trusting the build agents' own reports.

**462 requirements verified across the technical handover.** Roles-guide coverage is partial — see *Not yet audited* at the end.

| Scope | Total | DONE | +divergence | PARTIAL | MISSING | DEFERRED | PENDING-OWNER |
|---|---|---|---|---|---|---|---|
| Handover §1–8 | 119 | 97 | 4 | 12 | 4 | 0 | 2 |
| Handover §9–13 | 130 | 106 | 5 | 12 | 2 | 3 | 2 |
| Handover §14–21 | 213 | 148 | 5 | 31 | 24 | 2 | 3 |
| **Total** | **462** | **351** | **14** | **55** | **30** | **5** | **7** |

**79% implemented as specified.** The financial core is the strongest part: every exact value checks out (all timing windows, the reliability deltas, 15% VAT in both its inclusive and additive forms), and the §12.2 worked example reproduces to the halala from the code path itself. Several rules are implemented *better* than required — GMV/revenue separation is enforced by a type system rather than a naming convention, and the audit log is append-only at both the model and database-trigger layers.

Statuses: **DONE** verified in code · **PARTIAL** partly implemented · **MISSING** no implementation · **DEFERRED** the spec itself defers it · **PENDING-OWNER** awaiting a decision, provisional behaviour correct.

---

## Fixed during this audit

**Provider-suggestion override threw a fatal 500 on every use.** `ProviderSuggestionService` referenced `AuditLogService`, `AuditAction` and `RoleAssignment` without importing them, so PHP resolved them into its own namespace. 42 occurrences in `storage/logs/laravel.log`. The user saw an error page *after* the event was created, and §19's mandatory "log the override reason" never produced a row. It survived 883 tests because the test asserted only `assertSessionHasNoErrors()` with no response check, and its other assertions read a row written just before the crash. Imports added; the test now asserts the response and the audit row.

---

## MISSING — no implementation found

### Structural

| # | Requirement | §ref | Note |
|---|---|---|---|
| 1 | **`deleted_at` on all entities** | §21 | 4 of 95 tables. The one mandatory schema rule still open; deferred to an ERD review that never happened, so the deferral has no owner or date. The other 5 failing rules were genuinely fixed. |
| 2 | **Bilingual key-based i18n (AR + EN), no strings in code** | §20 | No i18n library; `lang/` holds one validation file; 110 of 110 page components carry inline Arabic. The English half of the UI does not exist. **Gets materially more expensive the longer it waits.** |
| 3 | ERD delivered before any migration | §21 | Gate passed without being met; 91 migrations written. |
| 4 | `activity_unit_id` / `provider_branch_id` / `pricing_type` / `funding_mode` on `events` | §7 | Events still identify bookings via the legacy `partner_id` + `venue_pricing_id` + `event_venue` triple. `pricing_type`'s absence is the mechanical reason gap #6 is hard to fix cleanly. |
| 5 | Tables with no equivalent: `refunds`, `competitions`, `coordinator_incentives`, `measurement_types`, `activities` | §21 | Some folded into other tables defensibly, none documented. |

### Behavioural

| # | Requirement | §ref | Note |
|---|---|---|---|
| 6 | **Per-person pricing: capacity locks at the frozen count** | §7, §12.1 | `frozen_participants_count` is written and displayed but read by nothing. A per-person event keeps seating people past the figure sent to the provider — direct margin leakage. Punted between briefs; never claimed. |
| 7 | **`force()` to `completed` produces a ghost event** | §9 | Sets `completed_at` but never writes `attendance_status` and never fires `EventCompleted` — so an admin-forced completion yields zero activated employees for billing, zero board points, no commission entry, no reliability credit. Silently. This is the exact path §9 rule 2 exists for. |
| 8 | Coordinator context switcher | §18 | Named verbatim in the spec. The switcher exists only on the company/employee guards; the coordinator runs on the admin guard, which has none. |
| 9 | Coordinator: calendar, event/template management, provider follow-up | §18 | The role is enforced in services but every action sits behind `auth:employee` + a same-company employee row, which Teamat staff cannot have. Only `/coordinator/reports` exists. |
| 10 | Same-day crowding check when planning the calendar | Guide/coordinator | Exists only as a post-hoc report *cause*, never as a preventive check. |
| 11 | Consent captured at activation | §19 | No terms-acceptance field anywhere. Most likely to become a launch blocker given the pending legal review. |
| 12 | Employee onboarding: interests step, then community offer | §5 | `interests` exists nowhere; acceptance redirects straight to home. §1 makes the community the product's engine, so this is a funnel gap. |
| 13 | Creator never told their name and phone go to the provider | §11 | Disclosure exists only on the provider's side. A privacy-notice obligation. |
| 14 | Monitoring: error rate >1%, payment failure >10%/hour, upload failure | §20 | Three of seven alerts absent. |
| 15 | **Sentry not installed** | §20 | `docs/deployment.md:169` instructs the operator to configure a DSN for a package that isn't there — a deploy doc that cannot be followed. |
| 16 | p95 < 800ms / 99.5% availability monitoring | §20 | No APM. |
| 17 | Admin ledger screen | §16 | Teamat's own finance role cannot view `wallet_transactions`; the ledger exists only in the company portal. |
| 18 | Contract states; admin-side company settings; admin provider branch/unit browsing | §16 | Three named screen functions with no implementation and no divergence entry. |
| 19 | Measurement units admin-managed | §16 | Config-only; changing a unit needs a deploy. |
| 20 | Back path on every screen | §18 | `Breadcrumbs` used nowhere; three screens have no back affordance. |
| 21 | Employee home: suggested events; community «عن المجتمع» and «اللوحة» tabs; leader panel KPIs | §18 | |
| 22 | Leader approval queue for proposals | §18 | `pending_approval` is excluded from `activeValues()`, so proposals never surface to the approver. |
| 23 | Provider home: upcoming events, outstanding dues | §18 | Dash shows pending requests and this month's revenue instead. |
| 24 | Template-generated vs manual event ratio | Guide/coordinator | `events.template_id` exists but is never read by any reporting code — the coordinator's headline success metric has no backing number. |

---

## PARTIAL — implemented, but not fully to spec

**Highest impact first.**

| # | Requirement | §ref | What's missing |
|---|---|---|---|
| 1 | **Company isolation at query level** | §4 | 14 models carry the global scope; 13 more carry `company_id` without it — `PaymentIntent`, `PlatformFeeInvoice`, `SettlementItem`, `StoredFile`, `CoordinatorMonthlyReport` among them. They rely on controller filters, which §4 explicitly calls insufficient. Only two are documented as intentional. |
| 2 | **WhatsApp→SMS fallback won't fire on silent non-delivery** | §4 | The 60-second value is right, but `delivered_at` records API *acceptance*, not arrival, and the fallback aborts when it is set. Today it covers configuration errors, not non-arrival — and §4 calls this the project's critical path. |
| 3 | **Reliability score leaks below the 10-sample threshold** | §11 | `ProviderOversightController` calls `makeVisible()` unconditionally. The spec says «لا يُعرض لأي مستخدم» with no admin carve-out. |
| 4 | Halala remainder never actually charged | §12.2 | Recorded per event, but no read path deducts it — `RevenueService` reports gross commission. Teamat keeps 35.98 and reports 36.00. Immaterial per event, systematically overstated in aggregate. |
| 5 | `tax_treatment` / `invoice_issuer` not on ledger movements | §12.9 | Present on settlement items and invoices, absent from `wallet_transactions` — which §12.5 defines as "the movements". Its stated purpose was to absorb the pending accountant decision without a rebuild. |
| 6 | Snapshot missing branch, unit address, activity type, pricing type | §12.10 | Since the snapshot alone drives every historical view, a settlement view cannot reconstruct where the event was held. |
| 7 | Subsidy inheritance skips the community layer | §12.2 | Reads company settings only; the code comment admits it. Undocumented. |
| 8 | Unit capacity limits not enforced at event creation | Guide/leader | `max_capacity` is caught incidentally with a misleading error; **`min_capacity` is never checked at all**, in either the manual or template path. |
| 9 | Provider self-registration contradicts "admin invites you" | Guide/provider | `POST /partner/register` is public. Worse, the admin provisioning path sends no invite at all — no notification, no token — so the guide's invite step has no implementation. |
| 10 | Notifications fan out to all leaders, not the primary | Guide/leader | Only the inactivity nudge honours the primary; five other sites notify everyone. The primary invariant also has no DB constraint, and a community can end up with zero primaries while the leaderless clock stays unstarted. |
| 11 | Coordinator cannot answer provider alternatives | Guide/coordinator | Hard-coded to the creator (`created_by !== employee->id ⇒ 403`), with no permission check. |
| 12 | Attendance edit doesn't require the coordinator to have attended | Guide/coordinator | The guide says «بعد الفعالية التي حضرتها»; the code checks permission and window only. |
| 13 | Bank-transfer review step is advisory | Guide/finance | `approve()` accepts a `submitted` request directly, so the matching step can be skipped. No test. |
| 14 | Un-approval permission is a sibling, not "higher" | Guide/finance | Same `FinanceAdmin` role. Documented; compensated by double separation + mandatory reason + audit. |
| 15 | Activation requires a positive `attended` mark | Guide/finance | Stricter than "not marked absent" — an unmarked participant is excluded from billing. **Worth an owner ruling.** |
| 16 | 16 paginated lists still have empty-only states | §18 | No loading or error state. The documented exclusion list covers only 11 derived-aggregate tables. |
| 17 | Two financial actions bypass the confirm dialog | §18 | Wallet allocation and provider acceptance of a priced booking commit money in one click. `ConfirmModal` also has no `amount`/`effect` props, so the rule is upheld by copy authors, not the component. |
| 18 | `refund.approve` is a dead permission | §16 | Declared and named in the escalation matrix, checked by no route. The finance admin's most consequential manual power is nominal. |
| 19 | `wallet.allocate` / `wallet.topup.request` declared but never checked | Guide/leader | Blocking rests on guard separation alone. Holds today; untested. |
| 20 | Only one account manager per company | §5 | The model allows N; the only writer derives one from `companies.contact_*`. |
| 21 | Allocation reversal has no product surface | §6 | `reverseAllocation` works and is tested but has no route or UI. A mis-allocation needs a database edit. |
| 22 | Search missing on 7 lists; filter-without-UI on 1 | §18 | |
| 23 | Decision trace ties to the panel account, not the branch | §11 | Spec: «أثر رقمي مرتبط بحساب الفرع». Undocumented. |
| 24 | Preferred-provider list is leader-only | §11 | Spec says «القائد أو المنسّق»; a coordinator gets 403. |
| 25 | Restore test documented but never performed | §20 | The procedure exists; the doc's own gate («النسخة غير المختبَرة ليست نسخة») is unmet. |
| 26 | Employee right of access/correction | §19 | Per-portal profile editing exists; no consolidated export-my-data path. |
| 27 | Provider "verification" is a status flip | §16/§17 | `cr_number` is plain text with no document review, unlike the company contract pipeline. |
| 28 | Fonts / no-gradients brand rules | §20 | Employee portal uses Readex Pro, not Almarai; the landing page uses a gradient. |
| 29 | Blackout dates: `PUT` route with no UI | §16 | A wrong range must be deleted and recreated. |
| 30 | Static monthly PDF stored | §15 | The data snapshot is frozen and tamper-proof; no PDF binary (same engine gap as exports). |
| 31 | Community "image" is an emoji icon | §6 | No upload column. |

---

## Owner decisions (unchanged, still open)

Seven block launch — payment gateway, accountant tax sign-off, PDPL legal review, contract numbers, WhatsApp Business approval, SMS vendor, `real_invoices_enabled`. Eighteen block a specific flow. The heaviest is **leagues**: fully built and live while the spec defers them from v1 twice over and the leader's guide tells users they don't exist. Containment is genuine (leagues never write to `competition_results` and appear in neither board), so this is a product decision, not silent scope creep — but it would fail a literal acceptance reading. Full register in `docs/acceptance.md`.

---

## Not yet audited

The **roles-guide appendices** were not reached before the audit run was cut short: **ملحق أ** (the consolidated timings table) and **ملحق ب** (the permissions matrix). Most individual timings were independently confirmed correct while auditing §9–§13, and the matrix was partially verified through the coordinator, financial-admin, leader and provider guides — but a systematic cell-by-cell pass of the matrix has not been done. That pass matters specifically for cells where the code might be **more permissive** than the guide, which is the dangerous direction. Also unaudited: the account-manager and employee role guides, and the support-agent guide.

---

## On `docs/divergences.md`

Its verifiable claims largely held up — page size 20 with a working guard test, sort built once and adopted everywhere, `window.confirm` fully eliminated. Two caveats for anyone reading it as current status: its §2 schema table is a **pre-rebuild snapshot** that now understates progress (five rules it marks FAIL are fixed), while its §18 list-states count and its "filter-without-UI swept" claim are stale optimistically. It is wrong in **both** directions.
