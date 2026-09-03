import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decide
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
export const decide = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(args, options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/admin/providers/price-changes/{priceChange}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decide
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
decide.url = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { priceChange: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { priceChange: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            priceChange: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        priceChange: typeof args.priceChange === 'object'
        ? args.priceChange.id
        : args.priceChange,
    }

    return decide.definition.url
            .replace('{priceChange}', parsedArgs.priceChange.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decide
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
decide.post = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decide
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
const decideForm = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decide.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decide
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
decideForm.post = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decide.url(args, options),
    method: 'post',
})

decide.form = decideForm

const priceChanges = {
    decide: Object.assign(decide, decide),
}

export default priceChanges