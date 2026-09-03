import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import otp44dfe8 from './otp'
import password from './password'
import verification from './verification'
import companies from './companies'
import partners from './partners'
import providers from './providers'
import employees from './employees'
import communities from './communities'
import categories from './categories'
import events from './events'
import blackouts from './blackouts'
import notifs from './notifs'
import notificationTemplates from './notification-templates'
import monitoring from './monitoring'
import alerts from './alerts'
import settings from './settings'
import audit from './audit'
import security from './security'
import support from './support'
import supportConsole from './support-console'
import notificationLogs from './notification-logs'
import revenue from './revenue'
import payments from './payments'
import finance from './finance'
import admins from './admins'
import profile from './profile'
/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/admin/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::login
* @see app/Http/Controllers/Auth/AdminAuthController.php:32
* @route '/admin/login'
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
* @see \App\Http\Controllers\Auth\AdminAuthController::otp
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
export const otp = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: otp.url(options),
    method: 'get',
})

otp.definition = {
    methods: ["get","head"],
    url: '/admin/otp',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::otp
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
otp.url = (options?: RouteQueryOptions) => {
    return otp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::otp
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
otp.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: otp.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::otp
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
otp.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: otp.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::otp
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
const otpForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: otp.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::otp
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
otpForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: otp.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\AdminAuthController::otp
* @see app/Http/Controllers/Auth/AdminAuthController.php:91
* @route '/admin/otp'
*/
otpForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: otp.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

otp.form = otpForm

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

/**
* @see \App\Http\Controllers\Admin\DashboardController::dash
* @see app/Http/Controllers/Admin/DashboardController.php:35
* @route '/admin/dash'
*/
export const dash = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dash.url(options),
    method: 'get',
})

dash.definition = {
    methods: ["get","head"],
    url: '/admin/dash',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::dash
* @see app/Http/Controllers/Admin/DashboardController.php:35
* @route '/admin/dash'
*/
dash.url = (options?: RouteQueryOptions) => {
    return dash.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::dash
* @see app/Http/Controllers/Admin/DashboardController.php:35
* @route '/admin/dash'
*/
dash.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::dash
* @see app/Http/Controllers/Admin/DashboardController.php:35
* @route '/admin/dash'
*/
dash.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dash.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::dash
* @see app/Http/Controllers/Admin/DashboardController.php:35
* @route '/admin/dash'
*/
const dashForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::dash
* @see app/Http/Controllers/Admin/DashboardController.php:35
* @route '/admin/dash'
*/
dashForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dash.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::dash
* @see app/Http/Controllers/Admin/DashboardController.php:35
* @route '/admin/dash'
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

const admin = {
    login: Object.assign(login, login),
    otp: Object.assign(otp, otp44dfe8),
    password: Object.assign(password, password),
    logout: Object.assign(logout, logout),
    verification: Object.assign(verification, verification),
    dash: Object.assign(dash, dash),
    companies: Object.assign(companies, companies),
    partners: Object.assign(partners, partners),
    providers: Object.assign(providers, providers),
    employees: Object.assign(employees, employees),
    communities: Object.assign(communities, communities),
    categories: Object.assign(categories, categories),
    events: Object.assign(events, events),
    blackouts: Object.assign(blackouts, blackouts),
    notifs: Object.assign(notifs, notifs),
    notificationTemplates: Object.assign(notificationTemplates, notificationTemplates),
    monitoring: Object.assign(monitoring, monitoring),
    alerts: Object.assign(alerts, alerts),
    settings: Object.assign(settings, settings),
    audit: Object.assign(audit, audit),
    security: Object.assign(security, security),
    support: Object.assign(support, support),
    supportConsole: Object.assign(supportConsole, supportConsole),
    notificationLogs: Object.assign(notificationLogs, notificationLogs),
    revenue: Object.assign(revenue, revenue),
    payments: Object.assign(payments, payments),
    finance: Object.assign(finance, finance),
    admins: Object.assign(admins, admins),
    profile: Object.assign(profile, profile),
}

export default admin