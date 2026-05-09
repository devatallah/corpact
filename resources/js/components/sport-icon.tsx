interface SportIconProps {
    icon?: string | null;
    size?: number;
    className?: string;
}

export default function SportIcon({ icon, size = 20, className }: SportIconProps) {
    const src = icon && (icon.startsWith('/storage') || icon.startsWith('http'))
        ? icon
        : '/storage/sports/default.svg';

    return <img src={src} alt="" className={className} style={{ width: size, height: size, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }} />;
}
