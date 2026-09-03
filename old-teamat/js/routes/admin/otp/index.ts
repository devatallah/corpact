import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verify
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/admin/otp/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verify
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verify
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verify
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verify
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

verify.form = verifyForm

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resend
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
export const resend = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(options),
    method: 'post',
})

resend.definition = {
    methods: ["post"],
    url: '/admin/otp/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resend
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
resend.url = (options?: RouteQueryOptions) => {
    return resend.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resend
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
resend.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resend
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
const resendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resend
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
resendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resend.url(options),
    method: 'post',
})

resend.form = resendForm

const otp = {
    verify: Object.assign(verify, verify),
    resend: Object.assign(resend, resend),
}

export default otp