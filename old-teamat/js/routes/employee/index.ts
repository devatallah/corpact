import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import loginDf2c2a from './login'
import otp from './otp'
import context from './context'
import verification from './verification'
import explore from './explore'
import events from './events'
import communities from './communities'
import payments from './payments'
import results from './results'
import communityRequests from './community-requests'
import community from './community'
import quickMatch from './quick-match'
import notifications from './notifications'
import reports from './reports'
import leaderboards from './leaderboards'
import seasons from './seasons'
import profile from './profile'
/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::login
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/employee/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::login
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::login
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::login
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::login
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::login
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::login
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:33
* @route '/employee/login'
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
* @see \App\Http\Controllers\Employee\HomeController::home
* @see app/Http/Controllers/Employee/HomeController.php:29
* @route '/employee/home'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/employee/home',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\HomeController::home
* @see app/Http/Controllers/Employee/HomeController.php:29
* @route '/employee/home'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\HomeController::home
* @see app/Http/Controllers/Employee/HomeController.php:29
* @route '/employee/home'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\HomeController::home
* @see app/Http/Controllers/Employee/HomeController.php:29
* @route '/employee/home'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\HomeController::home
* @see app/Http/Controllers/Employee/HomeController.php:29
* @route '/employee/home'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\HomeController::home
* @see app/Http/Controllers/Employee/HomeController.php:29
* @route '/employee/home'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\HomeController::home
* @see app/Http/Controllers/Employee/HomeController.php:29
* @route '/employee/home'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::providerSuggestions
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
export const providerSuggestions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: providerSuggestions.url(options),
    method: 'get',
})

providerSuggestions.definition = {
    methods: ["get","head"],
    url: '/employee/provider-suggestions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::providerSuggestions
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
providerSuggestions.url = (options?: RouteQueryOptions) => {
    return providerSuggestions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::providerSuggestions
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
providerSuggestions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: providerSuggestions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::providerSuggestions
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
providerSuggestions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: providerSuggestions.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::providerSuggestions
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
const providerSuggestionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: providerSuggestions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::providerSuggestions
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
providerSuggestionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: providerSuggestions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::providerSuggestions
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
providerSuggestionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: providerSuggestions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

providerSuggestions.form = providerSuggestionsForm

const employee = {
    login: Object.assign(login, loginDf2c2a),
    otp: Object.assign(otp, otp),
    logout: Object.assign(logout, logout),
    context: Object.assign(context, context),
    verification: Object.assign(verification, verification),
    home: Object.assign(home, home),
    explore: Object.assign(explore, explore),
    events: Object.assign(events, events),
    providerSuggestions: Object.assign(providerSuggestions, providerSuggestions),
    communities: Object.assign(communities, communities),
    payments: Object.assign(payments, payments),
    results: Object.assign(results, results),
    communityRequests: Object.assign(communityRequests, communityRequests),
    community: Object.assign(community, community),
    quickMatch: Object.assign(quickMatch, quickMatch),
    notifications: Object.assign(notifications, notifications),
    reports: Object.assign(reports, reports),
    leaderboards: Object.assign(leaderboards, leaderboards),
    seasons: Object.assign(seasons, seasons),
    profile: Object.assign(profile, profile),
}

export default employee