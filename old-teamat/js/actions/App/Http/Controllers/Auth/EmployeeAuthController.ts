import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::showLoginForm
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
export const showLoginForm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

showLoginForm.definition = {
    methods: ["get","head"],
    url: '/employee/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::showLoginForm
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
showLoginForm.url = (options?: RouteQueryOptions) => {
    return showLoginForm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::showLoginForm
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
showLoginForm.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::showLoginForm
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
showLoginForm.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showLoginForm.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::showLoginForm
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
const showLoginFormForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::showLoginForm
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
showLoginFormForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::showLoginForm
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
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
* @see \App\Http\Controllers\Auth\EmployeeAuthController::requestOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
export const requestOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(options),
    method: 'post',
})

requestOtp.definition = {
    methods: ["post"],
    url: '/employee/otp/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::requestOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
requestOtp.url = (options?: RouteQueryOptions) => {
    return requestOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::requestOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
requestOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::requestOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
const requestOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::requestOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
requestOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestOtp.url(options),
    method: 'post',
})

requestOtp.form = requestOtpForm

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verifyOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
export const verifyOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.definition = {
    methods: ["post"],
    url: '/employee/otp/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verifyOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
verifyOtp.url = (options?: RouteQueryOptions) => {
    return verifyOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verifyOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
verifyOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verifyOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
const verifyOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verifyOtp
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
verifyOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.form = verifyOtpForm

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::chooseContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:116
* @route '/employee/login/context'
*/
export const chooseContext = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chooseContext.url(options),
    method: 'post',
})

chooseContext.definition = {
    methods: ["post"],
    url: '/employee/login/context',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::chooseContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:116
* @route '/employee/login/context'
*/
chooseContext.url = (options?: RouteQueryOptions) => {
    return chooseContext.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::chooseContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:116
* @route '/employee/login/context'
*/
chooseContext.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chooseContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::chooseContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:116
* @route '/employee/login/context'
*/
const chooseContextForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chooseContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::chooseContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:116
* @route '/employee/login/context'
*/
chooseContextForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chooseContext.url(options),
    method: 'post',
})

chooseContext.form = chooseContextForm

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::register
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:51
* @route '/employee/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/employee/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::register
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:51
* @route '/employee/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::register
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:51
* @route '/employee/register'
*/
register.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::register
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:51
* @route '/employee/register'
*/
const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::register
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:51
* @route '/employee/register'
*/
registerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(options),
    method: 'post',
})

register.form = registerForm

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::logout
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:100
* @route '/employee/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/employee/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::logout
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:100
* @route '/employee/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::logout
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:100
* @route '/employee/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::logout
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:100
* @route '/employee/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::logout
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:100
* @route '/employee/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
export const switchContext = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchContext.url(options),
    method: 'post',
})

switchContext.definition = {
    methods: ["post"],
    url: '/employee/context/switch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
switchContext.url = (options?: RouteQueryOptions) => {
    return switchContext.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
switchContext.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
const switchContextForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchContext
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
switchContextForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchContext.url(options),
    method: 'post',
})

switchContext.form = switchContextForm

const EmployeeAuthController = { showLoginForm, requestOtp, verifyOtp, chooseContext, register, logout, switchContext }

export default EmployeeAuthController