# design-sync notes — Teamat (corpact)

Repo-specific gotchas for future syncs. Keep appending; commit with config.json.

## Setup facts

- This is a Laravel + Inertia React APP, not a packaged library. No dist: the
  bundle entry and the types barrel are both generated into
  `.design-sync/.cache/` by `buildCmd` (tailwind CLI → tsc declarations →
  `gen-types-barrel.mjs`). `cfg.entry` points at the generated
  `.cache/ds-entry.mjs`; `package.json` got `"name": "teamat-ui"` and
  `"types": ".design-sync/.cache/types/index.d.ts"` so the converter's
  package-root/types walk stops at the repo root.
- `export default` components: `export * from` barrels DROP default exports —
  `gen-types-barrel.mjs` re-exports them by declared name in BOTH barrels.
  Without this, 16-17 app components silently vanish from the bundle/types.
- tsc exits non-zero on PRE-EXISTING app type errors (`resources/js/types/models.ts`
  duplicate `role` property). buildCmd tolerates it (`|| true`); the barrel
  generator fails loudly if <40 component modules were emitted.
- Tailwind v4: `.design-sync/tailwind-entry.css` wraps `resources/css/app.css`,
  adds the two remote font imports (bunny.net Instrument Sans, Google Readex Pro
  — same as `app.blade.php` <link> tags) and `@source './previews'` so utility
  classes used only in authored previews still get emitted.
- Playwright: chromium build 1228 cached in `~/Library/Caches/ms-playwright`
  → playwright **1.61.0** pinned in `.ds-sync` (other versions fail to launch).
- Ancestor risk: `/Users/atallah/dev/package.json` exists (nameless). The
  package-root walk-ups only stop at corpact because its package.json now has
  a name — don't remove the `"name"` field.

## Component/runtime gotchas

- `usePage()` throws outside Inertia. PortalSidebar, AppShell, Toast now carry
  a try/catch guard (app-source change, 2026-07-06) so they render with
  defaults outside the app. Inertia `<Link>` needs no context — renders `<a>`.
- Toast (flash-message toaster) renders null without flash props → deliberate
  floor card, no authored preview possible.
- Portal components (StatCard, PortalSidebar, StatusBadge in tables, …) are
  themed by an enclosing `.portal-admin` / `.portal-company` / `.portal-business`
  / `.portal-employee` class — previews must wrap in one, with `dir="rtl"` and
  `style={{minHeight: 0}}` (the portal classes set `min-height:100vh`).
- Language: portal/app components use Arabic RTL content (as the product does);
  generic shadcn primitives use neutral English.
- Overlay/fixed-position components have `cfg.overrides` cardMode single +
  viewport (Dialog, Sheet, DropdownMenu, Select, Tooltip, ConfirmModal, Toaster,
  Sidebar, PortalSidebar, AppShell, NavigationMenu).

## Preview-authoring facts (wave 1, 2026-07-06)

- `toast` is re-exported from the generated ds-entry (`export { toast } from 'sonner'`)
  because sonner's ToastState is a module-scope singleton: a preview (or design)
  importing 'sonner' directly gets a second copy that never reaches the bundled
  `<Toaster/>`. Always `import { Toaster, toast } from 'teamat-ui'`.
- Card harness puts `transform: translateZ(0)` on `.ds-cell`/`.ds-single`, which
  makes it the containing block for `position: fixed` — NON-portaled overlays
  (ConfirmModal, Toast) clip to a 0-height box. Preview fix: explicit-size stage
  wrapper (`<div style={{height:'100vh'}}>`). Radix portals are immune.
- Radix open-state autofocus selects Input text (dark highlight on screenshots):
  `onOpenAutoFocus={(e) => e.preventDefault()}` on Dialog/SheetContent.
- `SidebarMenuButton tooltip=…` crashes without a `TooltipProvider` — this repo's
  `ui/tooltip.tsx` doesn't self-wrap and `SidebarProvider` doesn't include one
  (diverges from upstream shadcn). Blank cell = silent React crash, not CSS.
- Sidebar-primitive composites (NavFooter, AppSidebarHeader…) need `SidebarProvider`
  (with `style={{minHeight:0}}` to defeat `min-h-svh`).
- Portal wrapper pattern needs `display:'block'` too: `.portal-*` classes are
  `display:flex` and distort single-child layouts.
- PortalSidebar's 420px viewport is under the app's 768px mobile breakpoint —
  its preview pins the desktop sidebar via a preview-only `<style>` and inline
  `flexDirection:'row'`. Cells render ~80px narrower than the config viewport.
- Radix NavigationMenu renders statically open only with root `defaultValue` +
  explicit matching `value` on the item. Select open popover needs ~300px bottom
  padding in the wrapper. InputOTP is controlled-only (value + noop onChange).
- Tailwind utilities used ONLY in previews compile solely in the FULL build
  (tailwind @source scan) — preview-rebuild.mjs doesn't rescan CSS; agents used
  inline styles / scoped `<style>` tags for glue. CSS vars resolve inline.
- Capture server roots at ds-bundle (no `/storage`, no `.svg` MIME): CategoryIcon's
  preview shims its `/storage/sports/*.svg` imgs via `img[src=…]{content:url(data-URI)}`
  with the real repo SVGs.

## Upstream app gaps noticed (not fixed by sync)

- `.b-suspended` status class missing from all stylesheets — StatusBadge renders
  an uncolored pill for `suspended` (and `full`, `alternative_proposed`, `closed`).
- TimePicker is hardcoded inline-styled (no design tokens).
- `@custom-variant dark` exists but no `.dark` token overrides — dark: classes
  work, token switching doesn't.
- Pre-existing tsc errors: `types/models.ts` duplicate `role` property.

## Re-sync risks (watch these)

- CategoryIcon preview inlines data-URI copies of `public/storage/sports/*.svg` —
  rots silently if the real SVGs change.
- Toaster preview depends on the ds-entry `toast` re-export staying in
  `gen-types-barrel.mjs`.
- The usePage() guards in portal-sidebar/app-shell/toast are app-source changes —
  if reverted upstream, those components crash outside Inertia again (floor cards).
- First tsc run once emitted stray `.d.ts` NEXT TO SOURCES (before include list was
  widened); if `resources/js/**/*.d.ts` strays reappear, delete them — they shadow
  `.ts` sources for the app's own tooling.
- `/Users/atallah/dev/package.json` (nameless) sits above the repo — package-root
  walk-ups depend on corpact/package.json keeping its `"name"`.

## Known render warns (triaged legitimate)

- `[TOKENS_MISSING] 21 CSS custom properties` — `--radix-*` are set at runtime
  by Radix; the rest (`--border-main`, `--text-primary`, `--Button-primary-brand`,
  `--fill-tsp-white-main`, …) are referenced only by utilities compiled from the
  scraped landing page blade (`resources/views/welcome.blade.php`), not by any
  React component. Verified: component previews render fully styled.
- `[FONT_REMOTE] "Instrument Sans", "Readex Pro", "Cambria"` — intentional;
  fonts load from bunny.net/Google at runtime exactly like the app itself.
  "Cambria" is just Tailwind's default `--font-serif` stack, unused.
- `[DTS_STYLE_SYSTEM] filtering @types/react props` — expected; React DOM prop
  bags are filtered from the emitted Props interfaces.
