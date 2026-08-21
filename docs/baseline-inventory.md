# Teamat — Baseline Inventory (Phase-0 deliverable, H §22 #7)

Snapshot date: 2026-08-19. Produced by the A0 ops-baseline pass so the spec can be reconciled against what the code actually contains («لا يمكن مواءمة المواصفات مع كود لا يُعرف محتواه»).

## Repository

- Remote: `https://github.com/devatallah/corpact.git`
- Main branch: `main` (deploy branch). Other remote branches: `teams`, `workos`, `workos-teams` (historical experiments), second remote `server`.
- Monorepo: Laravel backend + Inertia/React frontend in one tree.

## Runtime versions

| Component | Version |
|---|---|
| PHP (dev machine) | 8.4.3 (composer constraint `^8.3`) |
| Laravel framework | 13.6.0 |
| Database (dev) | SQLite (`database/database.sqlite`) — production must run MySQL/PostgreSQL |
| Node (dev machine) | v25.9.0 / npm 11.12.1 |
| React | 19.2 · Inertia.js 3.0 · Vite (laravel-vite-plugin 3.0) · Tailwind CSS 4.1 |

## Environments

Only **dev** exists today (developer machines, SQLite, `log` mail driver, `local` file disk, `database` queue driver). Test and production environments are **not yet provisioned** — required as three fully separated environments with separate DBs and secrets (H §20). Provisioning steps: `docs/deployment.md`.

## PHP packages (direct dependencies)

| Package | Version | Role |
|---|---|---|
| laravel/framework | 13.6.0 | framework |
| inertiajs/inertia-laravel | 3.0.6 | Inertia bridge |
| laravel/fortify | 1.36.2 | auth backend |
| laravel/horizon | 5.48.3 | **added by A0** — Redis queue dashboard/supervision |
| spatie/laravel-backup | 10.3.1 | **added by A0** — daily backups, 30-day retention |
| league/flysystem-aws-s3-v3 | 3.35.2 | S3 driver for private uploads |
| laravel/tinker | 3.0.2 | REPL |
| laravel/wayfinder | 0.1.16 | TS route generation |
| Dev: pest 4.6.3 / phpunit 12.5.23, pint 1.29.1, sail 1.57.0, pail 1.2.6, faker 1.24.1, mockery 1.6.12, collision 8.9.4, pao 1.0.4 | | |

Total installed (with transitives): 146 packages (`composer show`).

JS: React 19, @inertiajs/react 3, Radix UI primitives, Headless UI, lucide-react, Tailwind 4, TypeScript + ESLint 9 + Prettier toolchain (see `package.json`).

## Queue / mail / storage / debug — current state

| Concern | Dev default | Production requirement (wired, needs server values) |
|---|---|---|
| `APP_DEBUG` | `true` locally | **false** — `.env.example` defaults to false with warning |
| Mail | `log` (nothing delivered) | SMTP via `MAIL_*` env vars (`config/mail.php` ready) |
| Files | `local` private disk, signed URLs (15 min) | `FILESYSTEM_DISK=s3`, private bucket, same signed-URL path |
| Queue | `database` driver (`jobs` table) | `QUEUE_CONNECTION=redis` + Horizon + Supervisor |
| Backups | spatie/laravel-backup — daily 01:00, 30-day retention, verify-on-create | `BACKUP_DISK=s3` + documented restore test |

## Database schema — current tables (55 migrations applied, 59 files)

Groups as they exist **today** (many spec tables from H §21 do not exist yet — that is later agents' work):

- **Identity/auth**: `users` (admins; still carries `role` — H §21 violation to be fixed by A2/A3), `employees` (carries `company_id` — spec wants membership tables), `sessions`, `password_reset_tokens`, `invitations`, `departments`
- **Companies**: `companies` (H §22 #4 naming fixed: `hr_*` → contact fields renamed 2026-07-10)
- **Communities**: `communities`, `community_member`, `community_announcements`, `community_polls`, `poll_options`, `poll_votes`, `community_requests`
- **Activities/providers**: `categories`, `partners` (renamed from `businesses` 2026-07-13), `partner_category`, `venues`, `venue_pricings`, `slots`, `discounts`
- **Events**: `events`, `event_participants`, `event_venue`, `event_alternatives`, `quick_matches`, `quick_match_options`, `quick_match_votes`
- **Competitions**: `leagues`, `league_departments`, `league_matches`, `challenges`, `challenge_progress`
- **Money**: `wallets`, `wallet_transactions`, `settlements`, `platform_revenue`
- **System**: `notifications`, `activity_logs`, `support_messages`, `cache`, `cache_locks`, `jobs` (DB-queue fallback), `failed_jobs` + `job_batches` (**added by A0**), `job_runs` (added by A1, idempotency ledger)

Known divergences from H §21 already visible at baseline (for A2/A3, raised — not improvised on):

- `users.role` exists; spec forbids `role` on `users` (role_assignments with scopes required)
- `employees.company_id` exists; spec wants `users` + `company_memberships`
- `communities` has `leader_id` (`ledCommunities` relation on Employee); spec forbids it
- No `wallet_holds`, `payment_intents`, `gateway_transactions`, `payment_webhooks`, `refunds`, `settlement_items`, `platform_fee_invoices`, `audit_logs`, `files`, `role_assignments`, `company_memberships`, `department_history` yet
- Spec vocabulary: repo renamed `hr_*` to `contact_*` while the spec asks for `company_admin_*` — flagged in the A2 brief as a divergence to resolve

## Test suite

Pest 4: 144 tests / 320 assertions, all passing at snapshot time (`php artisan test`). Note: `composer test` also runs `pint --test`, which currently fails on ~85 files with pre-existing style drift — a cleanup item, unrelated to functionality.
