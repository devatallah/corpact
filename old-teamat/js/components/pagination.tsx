import { Link } from '@inertiajs/react';
import type { PaginationLink } from '@/types/models';

interface PaginationProps {
    links: PaginationLink[];
}

const base =
    'inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full text-xs font-bold font-arabic border-[0.5px] transition-colors';

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
            {links.map((link, i) => {
                const label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»')
                    .replace('Previous', 'السابق')
                    .replace('Next', 'التالي');

                if (!link.url) {
                    return (
                        <span
                            key={i}
                            className={`${base} border-[#0A0A0A]/10 bg-white text-[#0A0A0A]/40 cursor-default`}
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url}
                        className={`${base} ${
                            link.active
                                ? 'bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A]'
                                : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 hover:bg-[#0A0A0A]/5'
                        }`}
                        preserveState
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
