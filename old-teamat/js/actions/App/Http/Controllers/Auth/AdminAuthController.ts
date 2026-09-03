import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showLoginForm
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
export const showLoginForm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

showLoginForm.definition = {
    methods: ["get","head"],
    url: '/admin/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showLoginForm
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
showLoginForm.url = (options?: RouteQueryOptions) => {
    return showLoginForm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showLoginForm
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
showLoginForm.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showLoginForm
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
showLoginForm.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showLoginForm.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showLoginForm
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
const showLoginFormForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showLoginForm
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
showLoginFormForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showLoginForm
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
showLoginFormForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showLoginForm.form = showLoginFormForm

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:45
* @route '/admin/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/admin/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:45
* @route '/admin/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:45
* @route '/admin/login'
*/
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:45
* @route '/admin/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: login.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:45
* @route '/admin/login'
*/
loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: login.url(options),
    method: 'post',
})

login.form = loginForm

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showOtpChallenge
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
export const showOtpChallenge = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showOtpChallenge.url(options),
    method: 'get',
})

showOtpChallenge.definition = {
    methods: ["get","head"],
    url: '/admin/otp',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showOtpChallenge
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
showOtpChallenge.url = (options?: RouteQueryOptions) => {
    return showOtpChallenge.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showOtpChallenge
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
showOtpChallenge.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showOtpChallenge.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showOtpChallenge
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
showOtpChallenge.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showOtpChallenge.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showOtpChallenge
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
const showOtpChallengeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showOtpChallenge.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showOtpChallenge
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
showOtpChallengeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showOtpChallenge.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::showOtpChallenge
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
showOtpChallengeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showOtpChallenge.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showOtpChallenge.form = showOtpChallengeForm

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verifyOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
export const verifyOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.definition = {
    methods: ["post"],
    url: '/admin/otp/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verifyOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
verifyOtp.url = (options?: RouteQueryOptions) => {
    return verifyOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verifyOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
verifyOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verifyOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
const verifyOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::verifyOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:107
* @route '/admin/otp/verify'
*/
verifyOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.form = verifyOtpForm

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resendOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
export const resendOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendOtp.url(options),
    method: 'post',
})

resendOtp.definition = {
    methods: ["post"],
    url: '/admin/otp/resend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resendOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
resendOtp.url = (options?: RouteQueryOptions) => {
    return resendOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resendOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
resendOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resendOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
const resendOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::resendOtp
* @see app/Http/Controllers/Auth/AdminAuthController.php:131
* @route '/admin/otp/resend'
*/
resendOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resendOtp.url(options),
    method: 'post',
})

resendOtp.form = resendOtpForm

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::logout
* @see app/Http/Controllers/Auth/AdminAuthController.php:144
* @route '/admin/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/admin/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::logout
* @see app/Http/Controllers/Auth/AdminAuthController.php:144
* @route '/admin/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::logout
* @see app/Http/Controllers/Auth/AdminAuthController.php:144
* @route '/admin/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::logout
* @see app/Http/Controllers/Auth/AdminAuthController.php:144
* @route '/admin/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::logout
* @see app/Http/Controllers/Auth/AdminAuthController.php:144
* @route '/admin/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

const AdminAuthController = { showLoginForm, login, showOtpChallenge, verifyOtp, resendOtp, logout }

export default AdminAuthController