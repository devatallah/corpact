import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjust
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
export const adjust = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

adjust.definition = {
    methods: ["post"],
    url: '/admin/providers/{partner}/reliability',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjust
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
adjust.url = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { partner: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { partner: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            partner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        partner: typeof args.partner === 'object'
        ? args.partner.id
        : args.partner,
    }

    return adjust.definition.url
            .replace('{partner}', parsedArgs.partner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjust
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
adjust.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjust.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjust
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
const adjustForm = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjust.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjust
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
adjustForm.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjust.url(args, options),
    method: 'post',
})

adjust.form = adjustForm

const reliability = {
    adjust: Object.assign(adjust, adjust),
}

export default reliability