import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

/**
 * Debounced search hook that sends an Inertia GET request as the user types.
 * Preserves other query parameters (filters, etc.).
 */
export function useDebouncedSearch(
    initialValue: string,
    extraParams: Record<string, string | undefined> = {},
    delay = 300,
) {
    const [value, setValue] = useState(initialValue);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const params: Record<string, string | undefined> = {
                ...extraParams,
                search: value || undefined,
            };

            // Clean undefined values
            Object.keys(params).forEach((key) => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            router.get(window.location.pathname, params, {
                preserveState: true,
                replace: true,
            });
        }, delay);

        return () => clearTimeout(timer);
    }, [value]);

    return [value, setValue] as const;
}
