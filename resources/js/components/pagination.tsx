import { Link } from '@inertiajs/react';
import type { PaginationLink } from '@/types/models';

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>
            {links.map((link, i) => {
                const label = link.label
                    .replace('&laquo;', '\u00AB')
                    .replace('&raquo;', '\u00BB')
                    .replace('Previous', 'السابق')
                    .replace('Next', 'التالي');

                if (!link.url) {
                    return (
                        <span
                            key={i}
                            className="fbtn"
                            style={{ opacity: 0.4, cursor: 'default' }}
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url}
                        className={`fbtn${link.active ? ' on' : ''}`}
                        preserveState
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
