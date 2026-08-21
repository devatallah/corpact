# Teamat — Deployment Guide (Phase-0 deliverable)

Spec references: `technical-handover-v2.md` §20 (البنية التقنية), §22 (المرحلة صفر).
Rule: deployment must never be single-person knowledge — this document is the procedure.

Stack: Laravel 13 (PHP 8.3+/8.4) · Inertia + React 19 (Vite) · MySQL or PostgreSQL in production (SQLite is dev-only) · Redis (queues, Horizon) · S3 (private, user uploads) · Supervisor (Horizon worker) · cron (scheduler).

---

## 1. Environments

Three fully separate environments — **separate databases and separate secrets, never shared** (H §20):

| Environment | `APP_ENV` | `APP_DEBUG` | Notes |
|---|---|---|---|
| dev | `local` | `true` | developer machines, SQLite ok |
| test/staging | `staging` | `false` | mirrors production topology |
| production | `production` | **`false` — mandatory** | leaking debug pages exposes paths/env/secrets (H §22 #1) |

Secrets live only in each server's `.env` (or a secret manager). **Nothing secret is ever committed to the repo.** `.env` is git-ignored; `.env.example` documents every key without values.

## 2. Server prerequisites

- PHP 8.3+ with extensions: `pdo_mysql` (or `pdo_pgsql`), `redis` (phpredis), `gd`, `zip`, `intl`, `mbstring`, `bcmath`, `pcntl` (required by Horizon)
- Composer 2.x, Node.js 20+ (build only), nginx (or equivalent), Supervisor, cron
- Redis server (queues + Horizon)
- MySQL 8 / PostgreSQL 15 database + dedicated DB user per environment
- For DB dumps used by backups: `mysqldump` (or `pg_dump`) available on the app server

## 3. First-time provisioning

```bash
# 1. Code
git clone <repo> /var/www/teamat && cd /var/www/teamat

# 2. Dependencies
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# 3. Environment
cp .env.example .env
# Edit .env with production values — see checklist in §8 below
php artisan key:generate

# 4. Database
php artisan migrate --force

# 5. Caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Permissions
chown -R www-data:www-data storage bootstrap/cache
```

Point nginx at `public/`, standard Laravel vhost. Do **not** expose `storage/` or any path except `public/`.

## 4. Queues — Redis + Horizon + Supervisor (H §20)

Production `.env`: `QUEUE_CONNECTION=redis` (the `database` driver and the `jobs` table remain as a local/dev fallback only).

Supervisor program (`/etc/supervisor/conf.d/teamat-horizon.conf`):

```ini
[program:teamat-horizon]
process_name=%(program_name)s
command=php /var/www/teamat/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/teamat-horizon.log
stopwaitsecs=3600
```

```bash
supervisorctl reread && supervisorctl update && supervisorctl start teamat-horizon
```

- Worker retry policy is set in `config/horizon.php`: `tries=3`, exponential backoff `[10, 60, 300]` seconds, then the job lands in the failed list (`failed_jobs` / Horizon UI) — per H §20.
- Horizon dashboard: `https://<host>/horizon`, restricted by the `viewHorizon` gate to the comma-separated emails in `HORIZON_ALLOWED_EMAILS`.
- After every deploy run `php artisan horizon:terminate` so Supervisor restarts workers on the new code.

## 5. Scheduler (cron)

One cron entry per app server:

```cron
* * * * * www-data cd /var/www/teamat && php artisan schedule:run >> /dev/null 2>&1
```

`routes/console.php` contains the full H §20 job table plus the ops jobs:

| Job | Cadence |
|---|---|
| `backup:clean` (apply 30-day retention) | daily 00:30 |
| `backup:run` (DB + storage) | daily 01:00 |
| `backup:monitor` (alert if newest backup > 1 day old) | daily 07:00 |
| `horizon:snapshot` (queue metrics) | every 5 min |

Verify after provisioning: `php artisan schedule:list`.

## 6. File storage — private S3 (H §22 #2)

- Create a bucket per environment. **Block all public access** at the bucket level; no public ACLs, no website hosting. No file is ever public (H §20).
- Create an IAM user restricted to that bucket (`s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`).
- Production `.env`: `FILESYSTEM_DISK=s3` + the `AWS_*` keys.
- The app serves files exclusively through **temporary signed URLs, 15 minutes** (`config/filesystems.php` → `signed_url_minutes`, resolved by `App\Support\FileUrl` and model accessors on `Employee.avatar` / `Category.icon`).

### One-time migration of legacy local files

Old uploads live on the local public disk. After S3 is configured:

```bash
# avatars and category icons → S3 (same relative paths, private)
aws s3 sync storage/app/public/avatars    s3://<bucket>/avatars
aws s3 sync storage/app/public/categories s3://<bucket>/categories
```

Then normalize legacy DB values (paths stored as `/storage/...` from the old public disk) to bare relative paths, e.g. in tinker:

```php
// categories: '/storage/categories/x.svg' -> 'categories/x.svg'
Category::withTrashed()->where('icon', 'like', '/storage/categories/%')->get()
    ->each(fn ($c) => $c->forceFill(['icon' => substr($c->getRawOriginal('icon'), 9)])->save());
```

Seeded static assets under `/storage/sports/…` are repo-shipped defaults and may stay on the public disk (they contain no user data), or be moved to S3 the same way in a later pass.

## 7. Backups & documented restore test (H §22 #6)

Package: `spatie/laravel-backup` (`config/backup.php`).

- **What**: database dump + everything under `storage/app` (private uploads and remaining legacy public files).
- **When**: daily 01:00 (see §5). Retention: **30 days** (`keep_all_backups_for_days=30`).
- **Where**: the disk named by `BACKUP_DISK`. Production must set `BACKUP_DISK=s3` — ideally a *separate* bucket (or account) from user uploads so one set of leaked credentials cannot destroy data *and* backups.
- **Integrity**: each archive is re-opened and verified after creation (`verify_backup=true`); failures retry 3× then alert.
- **Alerts**: failure/unhealthy notifications go by mail to `BACKUP_NOTIFICATION_MAIL`.
- Optional encryption at rest: set `BACKUP_ARCHIVE_PASSWORD` (AES-256).

Targets (H §20): **RTO 4 hours, RPO ≤ 24 hours.**

### Restore-test procedure («النسخة غير المختبَرة ليست نسخة»)

Run on the **test** environment, monthly and before launch, and record date/operator/duration each time:

1. Fetch the newest archive: `aws s3 cp s3://<backup-bucket>/<APP_NAME>/<latest>.zip .`
2. Unzip (`unzip -P <BACKUP_ARCHIVE_PASSWORD>` if encrypted). Contents: `db-dumps/…sql` + `storage/app` tree.
3. Restore DB into an empty database: `mysql -u… teamat_restore_test < db-dumps/mysql-teamat.sql`
4. Restore files into the test app's storage (or test S3 bucket).
5. Point a test `.env` at the restored DB/bucket and boot the app.
6. Verify: row counts of key tables match production (`employees`, `events`, `wallet_transactions`), a known avatar/icon renders via signed URL, and `php artisan migrate:status` shows a consistent ledger.
7. Log the result (date, operator, archive name, elapsed time vs 4h RTO) — Phase-0 sign-off requires one restore demonstrated to the owner (H §23).

## 8. Production `.env` checklist (server-side — cannot be done from the repo)

Safety gates (H §22):

- [ ] `APP_ENV=production`, **`APP_DEBUG=false`**, `APP_URL=https://…`
- [ ] `APP_KEY` generated per environment (never reused between environments)
- [ ] `DB_CONNECTION=mysql|pgsql` + real credentials (SQLite is dev-only); separate DB per environment
- [ ] **Mail**: `MAIL_MAILER=smtp` + real `MAIL_HOST/PORT/SCHEME/USERNAME/PASSWORD` (the `log` driver is dev-only — with it no message reaches any user, H §22 #3); confirm SPF/DKIM for `MAIL_FROM_ADDRESS`
- [ ] **Storage**: `FILESYSTEM_DISK=s3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET` (bucket fully private); legacy files migrated (§6)
- [ ] **Queues**: `QUEUE_CONNECTION=redis`, `REDIS_HOST/PORT/PASSWORD`; Horizon running under Supervisor (§4); `HORIZON_ALLOWED_EMAILS` set
- [ ] **Cache/session**: `CACHE_STORE=redis`, `SESSION_DRIVER=database` (or redis) — review with load
- [ ] **Backups**: `BACKUP_DISK=s3` (separate bucket), `BACKUP_NOTIFICATION_MAIL`, optional `BACKUP_ARCHIVE_PASSWORD`; cron entry present (§5); first `backup:run` executed manually and verified; **restore test performed and logged** (§7)
- [ ] Cron entry for `schedule:run` installed and `php artisan schedule:list` reviewed
- [ ] Monitoring per H §20: Sentry DSN configured; Telescope **not** installed in production

## 9. Routine deploy (every release)

```bash
cd /var/www/teamat
php artisan down --retry=30
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
php artisan horizon:terminate      # Supervisor restarts workers on new code
php artisan up
```

Rollback: `git checkout <previous-tag>` + `composer install` + re-cache + `horizon:terminate`. Migrations are forward-only in production — restore from backup rather than `migrate:rollback` if data is involved.

## 10. Secret rotation on any departure (H §19 — non-negotiable) — A15

> **◂ تدوير كل الأسرار عند مغادرة أي متعاقد أو مطوّر — بند غير قابل للتفاوض.**

This is an **exit gate, not a cleanup task**: it runs the same day access ends, before the account is closed, and the run is recorded. Anyone who held a production credential — employee, contractor, agency, or an agent with repo access — triggers it, whatever the terms of the departure.

### Trigger

- Departure, contract end, or role change that removes production access.
- Any suspected exposure (credential in a commit, a shared screen, a leaked laptop) — same procedure, immediately.

### Rotate, in this order (fastest blast-radius reduction first)

1. **Payment gateway** — API keys **and** the webhook signing secret (`config/payments.php`). Re-point the gateway dashboard to the new signing secret before deploying, so no webhook is rejected in the gap.
2. **AWS/S3** — issue new `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, deploy, then **delete** the old key (never just deactivate). The backup bucket credentials are separate (§7) and rotate too.
3. **WhatsApp Business + SMS gateway** — `WHATSAPP_ACCESS_TOKEN`, `SMS_GATEWAY_*`. Login depends on these (H §4): rotate outside peak hours and confirm one real OTP delivery before closing the ticket.
4. **Database** — production DB password; update the app `.env`, Horizon, and the backup job together.
5. **Redis** — `REDIS_PASSWORD` (queues + cache + sessions).
6. **Mail** — SMTP credentials.
7. **`APP_KEY`** — rotate **only** with a planned session/cookie invalidation window; encrypted column values must be re-encrypted first. If that work is not scheduled, record the decision and the date it will happen — do not silently skip it.
8. **Sentry DSN**, and any monitoring/paging tokens.
9. **Server access** — remove the SSH key, the deploy key, the CI secret, and revoke the GitHub/GitLab membership.
10. **Platform accounts** — deactivate the departing person's Teamat staff account from `/admin/admins` (deactivation, never deletion — the audit trail must stay attributable) and revoke their sessions. The app writes `account.deactivated` to `audit_logs` and `account.deactivated` to `security_events` automatically.

### Record the run

- [ ] Date, departing person, who executed the rotation, and the list above with each item ticked.
- [ ] Old AWS key **deleted**, not merely disabled.
- [ ] One end-to-end smoke test after rotation: a login OTP arrives, a webhook is accepted, a backup runs, a signed file URL opens.
- [ ] File the record with the quarterly permission review (`/admin/security/permission-review`) so the two controls are reviewed together.

### Related standing controls (H §19)

- **Quarterly permission review** — `/admin/security/permission-review` lists every elevated `role_assignment` with its scope and permissions; signing off writes a `permission.reviewed` row into the append-only audit log. Due once per quarter; the screen shows whether the current quarter is still open.
- **Security event log** — `/admin/security/events`: failed logins, lockouts, permission changes, bank-detail changes, financial-file access. Append-only at the model and at the database.
- **Secrets live in the environment or a secrets vault, never in the repository** (H §19). `.env` is git-ignored; a secret that ever reached a commit is compromised and rotates under this procedure.
