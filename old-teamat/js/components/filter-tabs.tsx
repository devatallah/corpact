import { router } from '@inertiajs/react';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterTabsProps {
    options: FilterOption[];
    current: string;
    paramName?: string;
}

export default function FilterTabs({ options, current, paramName = 'status' }: FilterTabsProps) {
    function handleFilter(value: string) {
        // Preserve existing query params (like search) when changing filter
        const url = new URL(window.location.href);
        const existing: Record<string, string> = {};
        url.searchParams.forEach((v, k) => {
            if (k !== paramName && k !== 'page') {
                existing[k] = v;
            }
        });

        router.get(
            window.location.pathname,
            { ...existing, [paramName]: value || undefined },
            { preserveState: true, replace: true },
        );
    }

    return (
        <div style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    className={`fbtn${current === opt.value ? ' on' : ''}`}
                    onClick={() => handleFilter(opt.value)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
