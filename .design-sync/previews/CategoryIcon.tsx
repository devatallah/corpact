import { CategoryIcon } from 'teamat-ui';

// CategoryIcon renders an <img> whose src is a server path
// ('/storage/sports/<slug>.svg', falling back to default.svg). The capture
// sandbox serves only the bundle dir, so those paths would 404. The scoped
// <style> below substitutes each real /storage path with the actual repo SVG
// (public/storage/sports/*.svg) inlined as a data URI via CSS `content:` —
// the component itself is untouched and receives the exact prop values the
// app passes (see database/seeders/DatabaseSeeder.php).
const svg = (body: string) =>
    'url("data:image/svg+xml,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">${body}</svg>`,
    ) +
    '")';

const art: Record<string, string> = {
    padel: svg(
        '<rect width="64" height="64" rx="12" fill="#E8F5E9"/><ellipse cx="32" cy="22" rx="12" ry="14" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/><line x1="32" y1="8" x2="32" y2="36" stroke="#2E7D32" stroke-width="1.5"/><line x1="20" y1="22" x2="44" y2="22" stroke="#2E7D32" stroke-width="1.5"/><circle cx="26" cy="16" r="1.5" fill="#2E7D32"/><circle cx="38" cy="16" r="1.5" fill="#2E7D32"/><circle cx="26" cy="28" r="1.5" fill="#2E7D32"/><circle cx="38" cy="28" r="1.5" fill="#2E7D32"/><rect x="30" y="36" width="4" height="16" rx="2" fill="#795548"/><circle cx="32" cy="54" r="3" fill="#795548"/>',
    ),
    tennis: svg(
        '<rect width="64" height="64" rx="12" fill="#FFF8E1"/><circle cx="32" cy="32" r="16" fill="#CDDC39" stroke="#9E9D24" stroke-width="2"/><path d="M18,22 Q32,32 18,42" stroke="#fff" stroke-width="2.5" fill="none"/><path d="M46,22 Q32,32 46,42" stroke="#fff" stroke-width="2.5" fill="none"/>',
    ),
    football: svg(
        '<rect width="64" height="64" rx="12" fill="#E3F2FD"/><circle cx="32" cy="32" r="18" fill="#FAFAFA" stroke="#333" stroke-width="2"/><polygon points="32,16 37,22 35,29 29,29 27,22" fill="#333"/><polygon points="46,28 42,34 36,32 37,26 43,24" fill="#333"/><polygon points="42,42 36,44 32,38 36,33 42,35" fill="#333"/><polygon points="22,42 28,44 32,38 28,33 22,35" fill="#333"/><polygon points="18,28 22,34 28,32 27,26 21,24" fill="#333"/>',
    ),
    basketball: svg(
        '<rect width="64" height="64" rx="12" fill="#FFF3E0"/><circle cx="32" cy="32" r="16" fill="#FF9800" stroke="#E65100" stroke-width="2"/><line x1="16" y1="32" x2="48" y2="32" stroke="#E65100" stroke-width="1.5"/><line x1="32" y1="16" x2="32" y2="48" stroke="#E65100" stroke-width="1.5"/><path d="M22,17 Q32,28 22,47" stroke="#E65100" stroke-width="1.5" fill="none"/><path d="M42,17 Q32,28 42,47" stroke="#E65100" stroke-width="1.5" fill="none"/>',
    ),
    default: svg(
        '<rect width="64" height="64" rx="12" fill="#F0F0F0"/><circle cx="32" cy="28" r="10" fill="#BDBDBD"/><rect x="22" y="40" width="20" height="4" rx="2" fill="#BDBDBD"/><rect x="26" y="46" width="12" height="3" rx="1.5" fill="#BDBDBD"/>',
    ),
};

const AssetShim = () => (
    <style>{Object.entries(art)
        .map(
            ([slug, url]) =>
                `img[src="/storage/sports/${slug}.svg"] { content: ${url}; }`,
        )
        .join('\n')}</style>
);

// Real seeded categories: name (Arabic UI) + icon path, as passed by
// register-business.tsx / business/dash.tsx.
const categories = [
    { name: 'بادل', icon: '/storage/sports/padel.svg' },
    { name: 'تنس', icon: '/storage/sports/tennis.svg' },
    { name: 'كرة قدم', icon: '/storage/sports/football.svg' },
    { name: 'كرة سلة', icon: '/storage/sports/basketball.svg' },
];

export const CategoryRow = () => (
    <div dir="rtl" style={{ display: 'flex', gap: 20, fontSize: 14 }}>
        <AssetShim />
        {categories.map((cat) => (
            <span
                key={cat.name}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
                <CategoryIcon icon={cat.icon} size={16} /> {cat.name}
            </span>
        ))}
    </div>
);

export const SizesAndFallback = () => (
    <div dir="rtl" style={{ display: 'grid', gap: 12, fontSize: 13 }}>
        <AssetShim />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CategoryIcon icon="/storage/sports/padel.svg" size={14} />
            بادل · حجز الساعة ٨ مساءً (size 14)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CategoryIcon icon="/storage/sports/tennis.svg" size={20} />
            تنس · الملعب رقم ٢ (size 20, default)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CategoryIcon icon={null} size={20} />
            بدون تصنيف (fallback: default.svg)
        </span>
    </div>
);
