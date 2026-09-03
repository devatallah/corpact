import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import loginDf2c2a from './login'
import otp from './otp'
import context from './context'
import verification from './verification'
import departments from './departments'
import employees from './employees'
import invitations from './invitations'
import settings from './settings'
import events from './events'
import communities from './communities'
import communityRequests from './community-requests'
import wallet from './wallet'
import invoices from './invoices'
import audit from './audit'
import reports from './reports'
import notifications from './notifications'
import leagues from './leagues'
import profile from './profile'
/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::login
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/company/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::login
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::login
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::login
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::login
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::login
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::login
* @see app/Http/Controllers/Auth/CompanyAuthController.php:33
* @route '/company/login'
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
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
export const activate = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activate.url(args, options),
    method: 'get',
})

activate.definition = {
    methods: ["get","head"],
    url: '/company/activate/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
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
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
activate.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
activate.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activate.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
const activateForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
*/
activateForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::activate
* @see app/Http/Controllers/Auth/CompanyAuthController.php:95
* @route '/company/activate/{token}'
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
* @see \App\Http\Controllers\Company\DashboardController::dash
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
export const dash = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dash.url(options),
    method: 'get',
})

dash.definition = {
    methods: ["get","head"],
    url: '/company/dash',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\DashboardController::dash
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
dash.url = (options?: RouteQueryOptions) => {
    return dash.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\DashboardController::dash
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
dash.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::dash
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
dash.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dash.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::dash
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
const dashForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::dash
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
dashForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::dash
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
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

const company = {
    login: Object.assign(login, loginDf2c2a),
    otp: Object.assign(otp, otp),
    activate: Object.assign(activate, activate),
    logout: Object.assign(logout, logout),
    context: Object.assign(context, context),
    verification: Object.assign(verification, verification),
    dash: Object.assign(dash, dash),
    departments: Object.assign(departments, departments),
    employees: Object.assign(employees, employees),
    invitations: Object.assign(invitations, invitations),
    settings: Object.assign(settings, settings),
    events: Object.assign(events, events),
    communities: Object.assign(communities, communities),
    communityRequests: Object.assign(communityRequests, communityRequests),
    wallet: Object.assign(wallet, wallet),
    invoices: Object.assign(invoices, invoices),
    audit: Object.assign(audit, audit),
    reports: Object.assign(reports, reports),
    notifications: Object.assign(notifications, notifications),
    leagues: Object.assign(leagues, leagues),
    profile: Object.assign(profile, profile),
}

export default company