import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/support-console',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
export const event = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: event.url(args, options),
    method: 'get',
})

event.definition = {
    methods: ["get","head"],
    url: '/admin/support-console/events/{event}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
event.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { event: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { event: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            event: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return event.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
event.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: event.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
event.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: event.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
const eventForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: event.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
eventForm.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: event.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
eventForm.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: event.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

event.form = eventForm

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendInvitation
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
export const resendInvitation = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendInvitation.url(args, options),
    method: 'post',
})

resendInvitation.definition = {
    methods: ["post"],
    url: '/admin/support-console/invitations/{invitation}/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendInvitation
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
resendInvitation.url = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return resendInvitation.definition.url
            .replace('{invitation}', parsedArgs.invitation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendInvitation
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
resendInvitation.post = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendInvitation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendInvitation
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
const resendInvitationForm = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resendInvitation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendInvitation
* @see app/Http/Controllers/Admin/SupportConsoleController.php:203
* @route '/admin/support-console/invitations/{invitation}/resend'
*/
resendInvitationForm.post = (args: { invitation: number | { id: number } } | [invitation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resendInvitation.url(args, options),
    method: 'post',
})

resendInvitation.form = resendInvitationForm

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendOtp
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
export const resendOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendOtp.url(options),
    method: 'post',
})

resendOtp.definition = {
    methods: ["post"],
    url: '/admin/support-console/otp/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendOtp
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
resendOtp.url = (options?: RouteQueryOptions) => {
    return resendOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendOtp
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
resendOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendOtp
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
const resendOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resendOtp
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
resendOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resendOtp.url(options),
    method: 'post',
})

resendOtp.form = resendOtpForm

const SupportConsoleController = { index, event, resendInvitation, resendOtp }

export default SupportConsoleController