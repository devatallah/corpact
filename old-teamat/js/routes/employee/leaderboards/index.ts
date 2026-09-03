import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\LeaderboardController::index
* @see app/Http/Controllers/Employee/LeaderboardController.php:33
* @route '/employee/leaderboards'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/leaderboards',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::index
* @see app/Http/Controllers/Employee/LeaderboardController.php:33
* @route '/employee/leaderboards'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::index
* @see app/Http/Controllers/Employee/LeaderboardController.php:33
* @route '/employee/leaderboards'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::index
* @see app/Http/Controllers/Employee/LeaderboardController.php:33
* @route '/employee/leaderboards'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::index
* @see app/Http/Controllers/Employee/LeaderboardController.php:33
* @route '/employee/leaderboards'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::index
* @see app/Http/Controllers/Employee/LeaderboardController.php:33
* @route '/employee/leaderboards'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::index
* @see app/Http/Controllers/Employee/LeaderboardController.php:33
* @route '/employee/leaderboards'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

const leaderboards = {
    index: Object.assign(index, index),
}

export default leaderboards