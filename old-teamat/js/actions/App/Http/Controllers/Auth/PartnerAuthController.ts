import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showLoginForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
export const showLoginForm = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

showLoginForm.definition = {
    methods: ["get","head"],
    url: '/partner/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showLoginForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
showLoginForm.url = (options?: RouteQueryOptions) => {
    return showLoginForm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showLoginForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
showLoginForm.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showLoginForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
showLoginForm.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showLoginForm.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showLoginForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
const showLoginFormForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showLoginForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
showLoginFormForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showLoginForm.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showLoginForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
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
* @see \App\Http\Controllers\Auth\PartnerAuthController::requestOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:56
* @route '/partner/otp/request'
*/
export const requestOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(options),
    method: 'post',
})

requestOtp.definition = {
    methods: ["post"],
    url: '/partner/otp/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::requestOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:56
* @route '/partner/otp/request'
*/
requestOtp.url = (options?: RouteQueryOptions) => {
    return requestOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::requestOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:56
* @route '/partner/otp/request'
*/
requestOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: requestOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::requestOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:56
* @route '/partner/otp/request'
*/
const requestOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::requestOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:56
* @route '/partner/otp/request'
*/
requestOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: requestOtp.url(options),
    method: 'post',
})

requestOtp.form = requestOtpForm

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::verifyOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:77
* @route '/partner/otp/verify'
*/
export const verifyOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.definition = {
    methods: ["post"],
    url: '/partner/otp/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::verifyOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:77
* @route '/partner/otp/verify'
*/
verifyOtp.url = (options?: RouteQueryOptions) => {
    return verifyOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::verifyOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:77
* @route '/partner/otp/verify'
*/
verifyOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::verifyOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:77
* @route '/partner/otp/verify'
*/
const verifyOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::verifyOtp
* @see app/Http/Controllers/Auth/PartnerAuthController.php:77
* @route '/partner/otp/verify'
*/
verifyOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.form = verifyOtpForm

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::chooseContext
* @see app/Http/Controllers/Auth/PartnerAuthController.php:116
* @route '/partner/login/context'
*/
export const chooseContext = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chooseContext.url(options),
    method: 'post',
})

chooseContext.definition = {
    methods: ["post"],
    url: '/partner/login/context',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::chooseContext
* @see app/Http/Controllers/Auth/PartnerAuthController.php:116
* @route '/partner/login/context'
*/
chooseContext.url = (options?: RouteQueryOptions) => {
    return chooseContext.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::chooseContext
* @see app/Http/Controllers/Auth/PartnerAuthController.php:116
* @route '/partner/login/context'
*/
chooseContext.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chooseContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::chooseContext
* @see app/Http/Controllers/Auth/PartnerAuthController.php:116
* @route '/partner/login/context'
*/
const chooseContextForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chooseContext.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::chooseContext
* @see app/Http/Controllers/Auth/PartnerAuthController.php:116
* @route '/partner/login/context'
*/
chooseContextForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: chooseContext.url(options),
    method: 'post',
})

chooseContext.form = chooseContextForm

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::register
* @see app/Http/Controllers/Auth/PartnerAuthController.php:48
* @route '/partner/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/partner/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::register
* @see app/Http/Controllers/Auth/PartnerAuthController.php:48
* @route '/partner/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::register
* @see app/Http/Controllers/Auth/PartnerAuthController.php:48
* @route '/partner/register'
*/
register.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::register
* @see app/Http/Controllers/Auth/PartnerAuthController.php:48
* @route '/partner/register'
*/
const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::register
* @see app/Http/Controllers/Auth/PartnerAuthController.php:48
* @route '/partner/register'
*/
registerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: register.url(options),
    method: 'post',
})

register.form = registerForm

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showActivateForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
export const showActivateForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActivateForm.url(args, options),
    method: 'get',
})

showActivateForm.definition = {
    methods: ["get","head"],
    url: '/partner/activate/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showActivateForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
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
* @see \App\Http\Controllers\Auth\PartnerAuthController::showActivateForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
showActivateForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showActivateForm.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showActivateForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
showActivateForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showActivateForm.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showActivateForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
const showActivateFormForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showActivateForm.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showActivateForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
showActivateFormForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showActivateForm.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::showActivateForm
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
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
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:101
* @route '/partner/activate/{token}'
*/
export const activate = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

activate.definition = {
    methods: ["post"],
    url: '/partner/activate/{token}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:101
* @route '/partner/activate/{token}'
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
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:101
* @route '/partner/activate/{token}'
*/
activate.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:101
* @route '/partner/activate/{token}'
*/
const activateForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:101
* @route '/partner/activate/{token}'
*/
activateForm.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activate.url(args, options),
    method: 'post',
})

activate.form = activateForm

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::logout
* @see app/Http/Controllers/Auth/PartnerAuthController.php:139
* @route '/partner/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/partner/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::logout
* @see app/Http/Controllers/Auth/PartnerAuthController.php:139
* @route '/partner/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::logout
* @see app/Http/Controllers/Auth/PartnerAuthController.php:139
* @route '/partner/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::logout
* @see app/Http/Controllers/Auth/PartnerAuthController.php:139
* @route '/partner/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::logout
* @see app/Http/Controllers/Auth/PartnerAuthController.php:139
* @route '/partner/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

const PartnerAuthController = { showLoginForm, requestOtp, verifyOtp, chooseContext, register, showActivateForm, activate, logout }

export default PartnerAuthController