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

            // Drop anything that isn't a real string value.
            //
            // Callers pass `filters?.sort` straight through, and PHP encodes an
            // empty filter array as JSON `[]` — an Array on this side, whose
            // `.sort` is `Array.prototype.sort`. Testing only for undefined/''
            // let that native function through and Inertia serialised it into
            // the query string as `?sort=function sort() { [native code] }`.
            Object.keys(params).forEach((key) => {
                if (typeof params[key] !== 'string' || params[key] === '') {
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
