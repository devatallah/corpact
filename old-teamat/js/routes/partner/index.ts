import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import loginDf2c2a from './login'
import otp from './otp'
import verification from './verification'
import providerRequests from './provider-requests'
import requests from './requests'
import branches from './branches'
import units from './units'
import availability from './availability'
import reliability from './reliability'
import bank from './bank'
import schedule from './schedule'
import venues from './venues'
import settlements from './settlements'
import reports from './reports'
import profile from './profile'
import staff from './staff'
/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::login
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/partner/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::login
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::login
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::login
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::login
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::login
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::login
* @see app/Http/Controllers/Auth/PartnerAuthController.php:33
* @route '/partner/login'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
export const activate = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activate.url(args, options),
    method: 'get',
})

activate.definition = {
    methods: ["get","head"],
    url: '/partner/activate/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
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
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
activate.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
activate.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activate.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
const activateForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
activateForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PartnerAuthController::activate
* @see app/Http/Controllers/Auth/PartnerAuthController.php:85
* @route '/partner/activate/{token}'
*/
activateForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activate.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
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

/**
* @see \App\Http\Controllers\Partner\DashboardController::dash
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
export const dash = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dash.url(options),
    method: 'get',
})

dash.definition = {
    methods: ["get","head"],
    url: '/partner/dash',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\DashboardController::dash
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
dash.url = (options?: RouteQueryOptions) => {
    return dash.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\DashboardController::dash
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
dash.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::dash
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
dash.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dash.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::dash
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
const dashForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::dash
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
dashForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::dash
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
dashForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dash.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dash.form = dashForm

const partner = {
    login: Object.assign(login, loginDf2c2a),
    otp: Object.assign(otp, otp),
    activate: Object.assign(activate, activate),
    logout: Object.assign(logout, logout),
    verification: Object.assign(verification, verification),
    dash: Object.assign(dash, dash),
    providerRequests: Object.assign(providerRequests, providerRequests),
    requests: Object.assign(requests, requests),
    branches: Object.assign(branches, branches),
    units: Object.assign(units, units),
    availability: Object.assign(availability, availability),
    reliability: Object.assign(reliability, reliability),
    bank: Object.assign(bank, bank),
    schedule: Object.assign(schedule, schedule),
    venues: Object.assign(venues, venues),
    settlements: Object.assign(settlements, settlements),
    reports: Object.assign(reports, reports),
    profile: Object.assign(profile, profile),
    staff: Object.assign(staff, staff),
}

export default partner