import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showLoginForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
export const showLoginForm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

showLoginForm.definition = {
    methods: ["get","head"],
    url: '/company/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showLoginForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
showLoginForm.url = (options?: RouteQueryOptions) => {
    return showLoginForm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showLoginForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
showLoginForm.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showLoginForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
showLoginForm.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showLoginForm.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showLoginForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
const showLoginFormForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showLoginForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
showLoginFormForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showLoginForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
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
* @see \App\Http\Controllers\Auth\CompanyAuthController::requestOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:56
* @route '/company/otp/request'
*/
export const requestOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(options),
    method: 'post',
})

requestOtp.definition = {
    methods: ["post"],
    url: '/company/otp/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::requestOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:56
* @route '/company/otp/request'
*/
requestOtp.url = (options?: RouteQueryOptions) => {
    return requestOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::requestOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:56
* @route '/company/otp/request'
*/
requestOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::requestOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:56
* @route '/company/otp/request'
*/
const requestOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::requestOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:56
* @route '/company/otp/request'
*/
requestOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestOtp.url(options),
    method: 'post',
})

requestOtp.form = requestOtpForm

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::verifyOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:77
* @route '/company/otp/verify'
*/
export const verifyOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.definition = {
    methods: ["post"],
    url: '/company/otp/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::verifyOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:77
* @route '/company/otp/verify'
*/
verifyOtp.url = (options?: RouteQueryOptions) => {
    return verifyOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::verifyOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:77
* @route '/company/otp/verify'
*/
verifyOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::verifyOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:77
* @route '/company/otp/verify'
*/
const verifyOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::verifyOtp
* @see app/Http/Controllers/Auth/CompanyAuthController.php:77
* @route '/company/otp/verify'
*/
verifyOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.form = verifyOtpForm

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::chooseContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
export const chooseContext = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chooseContext.url(options),
    method: 'post',
})

chooseContext.definition = {
    methods: ["post"],
    url: '/company/login/context',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::chooseContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
chooseContext.url = (options?: RouteQueryOptions) => {
    return chooseContext.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::chooseContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
chooseContext.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chooseContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::chooseContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
const chooseContextForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chooseContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::chooseContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
chooseContextForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chooseContext.url(options),
    method: 'post',
})

chooseContext.form = chooseContextForm

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::register
* @see app/Http/Controllers/Auth/CompanyAuthController.php:68
* @route '/company/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/company/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::register
* @see app/Http/Controllers/Auth/CompanyAuthController.php:68
* @route '/company/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::register
* @see app/Http/Controllers/Auth/CompanyAuthController.php:68
* @route '/company/register'
*/
register.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::register
* @see app/Http/Controllers/Auth/CompanyAuthController.php:68
* @route '/company/register'
*/
const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::register
* @see app/Http/Controllers/Auth/CompanyAuthController.php:68
* @route '/company/register'
*/
registerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(options),
    method: 'post',
})

register.form = registerForm

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showActivateForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
export const showActivateForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActivateForm.url(args, options),
    method: 'get',
})

showActivateForm.definition = {
    methods: ["get","head"],
    url: '/company/activate/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showActivateForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
showActivateForm.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return showActivateForm.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showActivateForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
showActivateForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActivateForm.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showActivateForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
showActivateForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showActivateForm.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showActivateForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
const showActivateFormForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showActivateForm.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showActivateForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
showActivateFormForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showActivateForm.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::showActivateForm
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
showActivateFormForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showActivateForm.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showActivateForm.form = showActivateFormForm

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:111
* @route '/company/activate/{token}'
*/
export const activate = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

activate.definition = {
    methods: ["post"],
    url: '/company/activate/{token}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:111
* @route '/company/activate/{token}'
*/
activate.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return activate.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:111
* @route '/company/activate/{token}'
*/
activate.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:111
* @route '/company/activate/{token}'
*/
const activateForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:111
* @route '/company/activate/{token}'
*/
activateForm.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

activate.form = activateForm

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::logout
* @see app/Http/Controllers/Auth/CompanyAuthController.php:149
* @route '/company/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/company/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::logout
* @see app/Http/Controllers/Auth/CompanyAuthController.php:149
* @route '/company/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::logout
* @see app/Http/Controllers/Auth/CompanyAuthController.php:149
* @route '/company/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::logout
* @see app/Http/Controllers/Auth/CompanyAuthController.php:149
* @route '/company/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::logout
* @see app/Http/Controllers/Auth/CompanyAuthController.php:149
* @route '/company/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
export const switchContext = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchContext.url(options),
    method: 'post',
})

switchContext.definition = {
    methods: ["post"],
    url: '/company/context/switch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
switchContext.url = (options?: RouteQueryOptions) => {
    return switchContext.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
switchContext.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
const switchContextForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchContext
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
switchContextForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchContext.url(options),
    method: 'post',
})

switchContext.form = switchContextForm

const CompanyAuthController = { showLoginForm, requestOtp, verifyOtp, chooseContext, register, showActivateForm, activate, logout, switchContext }

export default CompanyAuthController