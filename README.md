# Teamat (تيمات)

Corporate sports & employee wellness platform for Saudi Arabia. Teamat connects
**companies** (wellness budgets, communities, analytics), **sports service
providers** (venues, pricing, bookings, settlements), and **employees**
(discover, organize, and join sports activities) in a three-sided marketplace,
with a platform **admin** portal overseeing the marketplace.

See `Teamat_Funder_Document.md` for the full product overview.

## Stack

- **Backend:** Laravel 13 (PHP 8.3), Fortify (2FA), multi-guard auth
  (`company`, `partner`, `employee`, `admin`)
- **Frontend:** Inertia + React 19, TypeScript, Tailwind CSS 4, Vite 8
- **Landing pages:** server-rendered Blade (Arabic, RTL) at `/`, `/companies`,
  `/employees`, `/partners`
- **Database:** SQLite for local development, MySQL in production
- **Queues:** database driver (a running worker is required — emails,
  notifications, and invitations are queued)

## Local development

Requirements: PHP 8.3+, Composer, Node 20+.

```bash
composer run setup   # composer install, .env, key, migrations, npm install, build
composer run dev     # serves app (:8000) + queue worker + logs + Vite HMR
```

`.env` notes for local work:

- `APP_DEBUG=true` (the template ships with `false` — never enable it in production)
- `MAIL_MAILER=log` writes emails to `storage/logs/laravel.log` instead of sending

### Tests & linting

```bash
composer test        # pint --test + php artisan test
composer run ci:check  # eslint, prettier, tsc, then the test suite
```

## Portals

| Portal | URL prefix | Users |
|---|---|---|
| Company | `/company` | Companies managing budgets, communities, employees |
| Service provider | `/partner` | Venues managing bookings, pricing, settlements |
| Employee | `/employee` | Employees joining communities and events |
| Admin | `/admin` | Platform operators |

Companies and providers self-register from the landing pages (`#register`
forms) and start in **pending** status until approved from the admin portal.
Employees register with their corporate email; the domain must belong to an
active company.

## Deployment checklist

The app is not production-ready with the defaults. Before going live:

1. **Environment**
   - `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://…`
   - `php artisan key:generate` on first deploy
2. **Database** — point `DB_*` at MySQL and run `php artisan migrate --force`
3. **Mail** — `MAIL_MAILER=smtp` with real provider credentials
   (the `log` default silently discards all email: invitations, activation
   links, password resets, and verification mail will not be delivered)
4. **Files** — `FILESYSTEM_DISK=s3` and fill the `AWS_*` vars
   (`league/flysystem-aws-s3-v3` is installed); local disk uploads do not
   survive redeploys
5. **Queue worker** — run `php artisan queue:work` under a supervisor;
   without it queued mail and notifications never leave the queue
6. **Caches** — `php artisan config:cache && php artisan route:cache && php artisan view:cache`
7. **Assets** — `npm ci && npm run build` (or `build:ssr` if using Inertia SSR)
8. **HTTPS** — serve behind TLS; the app sends HSTS and security headers

Known gaps tracked for launch (see the code-review tracker): no payment
gateway (settlements are accounting-only) and no SMS gateway integration yet.
