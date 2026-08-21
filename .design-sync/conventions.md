# Teamat Design System — conventions

Teamat (تيمات) is an Arabic-first corporate-activities platform. TWO design
languages coexist — pick by surface:

1. **shadcn/Tailwind layer** (auth screens, generic UI): Radix-based primitives
   (Button, Card, Dialog, Select, Sheet, Sidebar…) styled with Tailwind v4
   utilities over CSS-variable tokens.
2. **Portal layer** (the admin/company/business/employee product portals):
   hand-written CSS classes scoped under a `.portal-*` theme class, always
   `dir="rtl"` with Arabic content.

## Setup rules

- Components live on `window.TeamatUI` (148 exports, including subcomponents
  like `CardHeader`, `DialogTrigger`, `SidebarMenuButton`, and the `toast`
  function).
- `Tooltip` — and `SidebarMenuButton`'s `tooltip` prop — REQUIRE a
  `TooltipProvider` ancestor; without it the whole tree crashes to a blank
  render. The Sidebar family requires `SidebarProvider`.
- Toasts: `const { Toaster, toast } = window.TeamatUI` — never import `sonner`
  yourself (a second copy's `toast()` never reaches the mounted `Toaster`).
- Portal-styled components (`StatCard`, `StatusBadge`, `PortalSidebar`,
  `FilterTabs`, `Pagination`, `ConfirmModal`) MUST sit inside a portal theme
  wrapper: `<div className="portal-admin" dir="rtl">` (dark admin, red accents),
  `portal-company` (light, blue #3B5BDB), `portal-business` (warm light), or
  `portal-employee` (light, Readex Pro font). Below 768px viewport width the
  portal sidebar goes off-canvas behind a hamburger.
- `StatusBadge`: pass only statuses that have a `.b-*` class — pending, active,
  approved, rejected, review, open, confirmed, completed, cancelled, inactive,
  maintenance, paid, unpaid, joined, waiting_business. Others render an
  uncolored pill.

## Styling idiom

- shadcn layer: Tailwind utilities over tokens — `bg-background text-foreground`,
  `bg-primary text-primary-foreground`, `bg-card`, `text-muted-foreground`,
  `bg-sidebar`, `rounded-md`. Tokens are `--color-*` variables in `:root`
  (`--color-background`, `--color-primary`, `--color-muted-foreground`,
  `--color-destructive`, `--color-sidebar`, `--radius-lg`, …). Font:
  Instrument Sans via `--font-sans` (loaded remotely, as the app does).
- Portal layer vocabulary (all defined in the shipped stylesheet): page
  `.main .page-title .page-sub .card .card-title`; stats
  `.stat-row .stat .ico .val .lbl .chg`; tables `table.portal-table`; badges
  `.badge .b-<status>`; filter pills `.fbtn` (+ `.on` active); row actions
  `.act-btn .btn-approve .btn-reject .btn-view`; forms `.frow .fg`; detail
  overlay `.detail-overlay .detail-panel .detail-row`; sidebar
  `.sidebar .logo .ni .nl .nb`. Shared accent palette: teal `#009E82`, amber
  `#D4820A`, red `#E03050`, blue `#5B7EFF` — each `.portal-*` scope themes the
  same classes differently. Portal font is Tahoma (employee portal: Readex Pro).

## Where the truth lives

- `styles.css` imports `_ds_bundle.css` — the app's real compiled stylesheet
  (all tokens + every portal class). Read it before inventing any class name.
- Per component: `components/<group>/<Name>/<Name>.prompt.md` (usage, real
  examples) and `<Name>.d.ts` (the props contract).

## Idiomatic build snippet (admin portal fragment)

```jsx
const { StatCard, StatusBadge } = window.TeamatUI;

<div className="portal-admin" dir="rtl" style={{ minHeight: '100vh', display: 'block', padding: 24 }}>
    <div className="page-title">لوحة التحكم</div>
    <div className="page-sub">نظرة عامة على المنصة</div>
    <div className="stat-row">
        <StatCard emoji="🏢" label="الشركات المسجلة" value={48} change="+6 هذا الشهر" color="#009E82" />
        <StatCard emoji="👥" label="الموظفون النشطون" value="1,284" color="#5B7EFF" />
    </div>
    <div className="card">
        <div className="card-title">أحدث الحجوزات</div>
        <table className="portal-table">
            <tbody>
                <tr>
                    <td>شركة النخبة</td>
                    <td><StatusBadge status="pending" /></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```
