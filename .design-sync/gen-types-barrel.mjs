// Generates two matching barrels from the tsc-emitted declaration tree:
//   .design-sync/.cache/types/index.d.ts — real prop types for the converter
//     (package.json "types" points here)
//   .design-sync/.cache/ds-entry.mjs — bundle entry re-exporting the component
//     SOURCE files (cfg.entry points here; esbuild compiles the .tsx)
// Both re-export defaults under their declared names — `export * from` alone
// would silently drop every default-exported app component.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '.cache', 'types');
const files = [];
(function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.d.ts') && e.name !== 'index.d.ts'
            && relative(root, p).replace(/\\/g, '/').startsWith('components/')) files.push(p);
    }
})(root);
// tsc exits non-zero on pre-existing app type errors but still emits — this
// count is the real gate that declarations actually landed.
if (files.length < 40) {
    console.error(`index.d.ts: only ${files.length} component modules emitted (expected ~50) — tsc emit failed`);
    process.exit(1);
}
const dtsLines = [];
const entryLines = [];
for (const p of files.sort()) {
    const rel = relative(root, p).replace(/\\/g, '/').replace(/\.d\.ts$/, '');
    const srcMod = `../../resources/js/${rel}.tsx`;
    dtsLines.push(`export * from './${rel}';`);
    entryLines.push(`export * from '${srcMod}';`);
    // `export * from` skips default exports — re-export them under their
    // declared name (all app components are `export default function Name`).
    const m = /export default (?:function |class )?([A-Za-z_$][\w$]*)/.exec(readFileSync(p, 'utf8'));
    if (m && m[1] !== 'function' && m[1] !== 'class') {
        dtsLines.push(`export { default as ${m[1]} } from './${rel}';`);
        entryLines.push(`export { default as ${m[1]} } from '${srcMod}';`);
    }
}
// sonner's toast() must come from the SAME module instance as the bundled
// <Toaster/> (module-scope singleton) — re-export it so previews and designs
// can `import { toast } from 'teamat-ui'`.
entryLines.push(`export { toast } from 'sonner';`);
writeFileSync(join(root, 'index.d.ts'), dtsLines.join('\n') + '\n');
writeFileSync(join(here, '.cache', 'ds-entry.mjs'), entryLines.join('\n') + '\n');
console.error(`index.d.ts + ds-entry.mjs: ${files.length} modules`);
