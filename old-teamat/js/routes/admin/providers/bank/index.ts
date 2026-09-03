import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approve
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
export const approve = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/providers/{partner}/bank/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approve
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
approve.url = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{partner}', parsedArgs.partner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approve
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
approve.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approve
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
const approveForm = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approve
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
approveForm.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

const bank = {
    approve: Object.assign(approve, approve),
}

export default bank