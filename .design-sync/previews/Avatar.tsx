import { Avatar, AvatarFallback, AvatarImage } from 'teamat-ui';

// Inline SVG portrait as a data URI — the capture sandbox serves only the
// bundle dir, so remote/app-storage photos would 404. This keeps AvatarImage
// truthfully exercised with an image that always loads.
const portrait =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
            '<rect width="64" height="64" fill="#0e7490"/>' +
            '<circle cx="32" cy="25" r="11" fill="#fbbf24"/>' +
            '<path d="M12 60c2-14 10-20 20-20s18 6 20 20z" fill="#fbbf24"/>' +
            '</svg>',
    );

export const ImageWithFallback = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar>
            <AvatarImage src={portrait} alt="Sara Ahmed" />
            <AvatarFallback>SA</AvatarFallback>
        </Avatar>
        <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 500, lineHeight: 1.2 }}>Sara Ahmed</div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                sara@teamat.app
            </div>
        </div>
    </div>
);

export const FallbackInitials = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar>
            <AvatarFallback>SA</AvatarFallback>
        </Avatar>
        <Avatar>
            <AvatarFallback>MK</AvatarFallback>
        </Avatar>
        <Avatar style={{ width: 40, height: 40 }}>
            <AvatarFallback style={{ fontSize: 14 }}>AT</AvatarFallback>
        </Avatar>
        <Avatar style={{ width: 48, height: 48 }}>
            <AvatarFallback style={{ fontSize: 16 }}>NH</AvatarFallback>
        </Avatar>
    </div>
);

export const GroupStack = () => (
    <div style={{ display: 'flex' }}>
        {['SA', 'MK', 'AT', '+3'].map((label, i) => (
            <Avatar
                key={label}
                style={{
                    marginLeft: i === 0 ? 0 : -8,
                    width: 36,
                    height: 36,
                    border: '2px solid var(--background)',
                }}
            >
                <AvatarFallback style={{ fontSize: 12 }}>{label}</AvatarFallback>
            </Avatar>
        ))}
    </div>
);
