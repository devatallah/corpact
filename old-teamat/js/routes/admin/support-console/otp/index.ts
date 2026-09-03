import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
export const resend = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(options),
    method: 'post',
})

resend.definition = {
    methods: ["post"],
    url: '/admin/support-console/otp/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
resend.url = (options?: RouteQueryOptions) => {
    return resend.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
resend.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
const resendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::resend
* @see app/Http/Controllers/Admin/SupportConsoleController.php:222
* @route '/admin/support-console/otp/resend'
*/
resendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(options),
    method: 'post',
})

resend.form = resendForm

const otp = {
    resend: Object.assign(resend, resend),
}

export default otp