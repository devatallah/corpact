# Design system — the teamat.ai.studio port

The visual language of the platform is being replaced with the one from the live
prototype at `teamat.ai.studio`. This file is the contract every agent works against.
Do not invent values. If something you need is not here, read it out of the mirror.

## Source of truth

A complete local mirror of the prototype sits at `scraped-site/teamat.ai.studio/`:

| Path | What it holds |
|---|---|
| **`reference/*.html`** | **read these** — all 60 screens, structure only, ~16 KB each |
| `reference/_chrome-all-roles.html` | header + sidebar + nav for all 7 roles in one file |
| `screenshots/**` | full-page PNG of every screen |
| `app-screens-manifest.json` | role → label → file map |
| `app-screens/`, `pages/` | the raw captures — **do not read these** |

Read the HTML, not just the screenshots — the class strings are the design.

**Always read `reference/`, never `app-screens/` or `pages/`.** The raw captures carry
79 KB of inlined CSS each (113 KB per file) so that they render standalone in a browser.
Two agents have already burned their entire context reading them without producing an
edit. The `reference/` copies are the same DOM with the stylesheet, the SVG icon guts,
and the demo preview bar stripped out — same class strings, one seventh the size.

The preview bar (`<aside aria-label="شريط تجربة وتبديل الأدوار">`) is the prototype's
role switcher. It is demo scaffolding, it is already removed from `reference/`, and it
must never be ported.

## Tokens

Both codebases are Tailwind v4, so these belong in `@theme` in `resources/css/app.css`.

| Token | Value | Use |
|---|---|---|
| ink | `#0A0A0A` | text, primary buttons, sidebar ground |
| lime | `#C8FF00` | the single accent — active state, primary CTA, focus ring |
| lime-hover | `#BCF200` | hover on lime surfaces |
| page | `#F6F8F5` | app background |
| surface | `#FFFFFF` | cards, tables, header |
| hairline | `#0A0A0A` at 10% | every border |
| success | `#2E7D32` on `#E8F5E9` | |
| warning | `#C87D00` on `#FEF08A` | |
| danger | `#D9381E` / `#EF4444` on `#FDEDEC` | |

Fonts: **Almarai** for Arabic (`--font-arabic`), **Inter** for Latin and numerals.
Stack: `"Almarai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
The app currently ships Instrument Sans — that goes.

Direction is RTL throughout. Use logical properties (`ps-`/`pe-`, `start`/`end`), never
`left`/`right`, so the layout does not break if an English locale ever lands.

## Shape language

This is what makes the design recognisable — get these right and the rest follows.

- **Hairline borders everywhere**: `border-[0.5px] border-[#0A0A0A]/10`. Used 955 times
  across the prototype. Not `border` (1px), not `border-gray-200`.
- **Borders carry depth, not shadows.** Cards do not have `shadow-md`. Hover raises the
  border to `/30`, it does not add a shadow.
- **Pills for anything status-like**: `rounded-full`. 1017 uses.
- **Cards**: `rounded-2xl`. Controls and inputs: `rounded-xl`. Small chips: `rounded-lg`.
- Dense type. Table and meta text is `text-xs` or `text-[11px]`; headings are
  `font-black`, not `font-semibold`.

### Confirmed recipes

```
card       bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 space-y-4
           + hover:border-[#0A0A0A]/30 transition-colors   (when the card is clickable)
card-flush bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/10 overflow-hidden
           (use when a table or list runs edge to edge inside it)
table      w-full text-right text-xs  +  divide-y-[0.5px] divide-[#0A0A0A]/10
header     bg-white border-b-[0.5px] border-[#0A0A0A]/10 sticky top-0 z-40 px-4 sm:px-8 py-3
badge      inline-flex items-center rounded-full border-[0.5px] whitespace-nowrap
           text-[11px] px-2 py-0.5 gap-1 font-medium
badge-solid   bg-[#0A0A0A] text-white border-[#0A0A0A]
badge-success bg-emerald-50 text-emerald-800 border-emerald-200
btn-primary   bg-[#0A0A0A] text-white rounded-full font-bold + focus-visible:ring-2 ring-[#C8FF00]
btn-accent    bg-[#C8FF00] text-[#0A0A0A] border-[0.5px] border-[#C8FF00] rounded-full font-bold
```

## Hard rules — behaviour is not part of the redesign

The prototype is a **mock**. It has hardcoded data, no forms that validate, no empty or
error states, no pagination, no sortable headers, no permission gates. The real app has
all of these and they were deliberate work. Restyling must not delete them.

1. **Never change data flow.** Props, `useForm`, `router.*` calls, route helpers,
   `usePage` reads, permission checks and conditional rendering stay exactly as they are.
   You are changing `className`, wrappers, icons and copy placement — nothing else.
2. **Keep every state.** `ListStates`, empty/loading/error branches, `Pagination`,
   `SortableHeader`, `ConfirmModal`, `InputError`, toasts. Restyle them; do not drop them.
   A page that paginates at 20 with sortable headers must still do both afterwards.
3. **Keep the Arabic copy verbatim.** Do not retranslate, shorten, or "improve" strings,
   and never copy prototype text over real text — the prototype says things the platform
   does not do. Never introduce spec citations like "H §19" into user-visible text.
4. **Financial confirmations keep their amount and effect.** Any dialog that commits
   money shows both, before and after.
5. **`tsc` stays clean and the 883 tests stay green.** Do not touch `tests/`, routes,
   controllers, or anything under `app/`.
6. Icons are `lucide-react`, already a dependency. Do not add packages, and do not add a
   second icon set.
7. Do not touch `design-legacy/` — it is the pre-redesign snapshot, deliberately outside
   the build.

## Screen mapping — prototype to real pages

The prototype covers 45 in-app screens; the app has 110 pages. Where a prototype screen
matches, follow it closely. Where none exists, apply the language above consistently —
that is the common case, and it is expected.

| Prototype role | Mirror files | Real pages |
|---|---|---|
| الموظف (5) | `employee_n0_*` | `resources/js/pages/employee/` (18) |
| قائد المجتمع (5) | `leader_n0_*` | employee pages behind leader permissions |
| مسؤول الحساب (10) | `account-manager_n0_*` | `resources/js/pages/company/` (25) |
| مزوّد الخدمة (7) | `provider_n0_*` | `resources/js/pages/partner/` (16) |
| أدمن المنصة (7) | `platform-admin_n0_*` | `resources/js/pages/admin/` (38) |
| الأدمن المالي (6) | `finance-admin_n0_*` | admin finance pages |
| وكيل الدعم (5) | `support-agent_n0_*` | admin support pages |
| auth | `pages/auth_*.html` | `resources/js/pages/auth/` (9) |
| marketing | `pages/{home,activities,how-it-works,model,for-companies,for-providers,contact}.html` | the public landing |

Note the axes differ: the prototype splits by **role**, the app by **portal**. A single
company portal page can correspond to an account-manager screen, and admin pages span
three prototype roles. Match by screen purpose, not by folder name.
