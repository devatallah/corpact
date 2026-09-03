# Legacy design — snapshot before the teamat.ai.studio redesign

Copied 2026-09-01 from `resources/js/{pages,layouts,components}` and `resources/css/`,
at commit afff9c2, immediately before the design port.

This is a plain copy for reference. It takes no part in the build:
it sits outside `resources/`, so Vite's `@source '../**/*.tsx'` glob in app.css does not
reach it, TypeScript does not type-check it, and ESLint does not lint it.

Nothing imports from here, and nothing should. Git already holds this exact tree at
afff9c2 — this folder exists so the old look is browsable side by side with the new one.
