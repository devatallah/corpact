/** The teamat mark — lime tile, ink glyph. One definition, every surface. */
export function BrandMark({ size = 36 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 52 52" role="img" aria-label="شعار تيمات" className="shrink-0">
            <rect width="52" height="52" rx="13" fill="#C8FF00" />
            <rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A" />
            <rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A" />
        </svg>
    );
}

export function BrandLockup({ size = 36, tone = 'ink' }: { size?: number; tone?: 'ink' | 'white' }) {
    return (
        <span className="inline-flex items-center gap-3 select-none">
            <BrandMark size={size} />
            <span className={`font-arabic font-extrabold tracking-tight text-2xl ${tone === 'white' ? 'text-white' : 'text-ink'}`}>
                تيمات
            </span>
        </span>
    );
}
