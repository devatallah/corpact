import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
export const resend = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(args, options),
    method: 'post',
})

resend.definition = {
    methods: ["post"],
    url: '/admin/support-console/invitations/{invitation}/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
resend.url = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invitation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { invitation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            invitation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        invitation: typeof args.invitation === 'object'
        ? args.invitation.id
        : args.invitation,
    }

    return resend.definition.url
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
resend.post = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
const resendForm = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
resendForm.post = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(args, options),
    method: 'post',
})

resend.form = resendForm

const invitations = {
    resend: Object.assign(resend, resend),
}

export default invitations