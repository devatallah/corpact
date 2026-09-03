import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::storeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
export const storeSeason = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeSeason.url(args, options),
    method: 'post',
})

storeSeason.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/seasons',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::storeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
storeSeason.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return storeSeason.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::storeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
storeSeason.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeSeason.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::storeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
const storeSeasonForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeSeason.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::storeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
storeSeasonForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeSeason.url(args, options),
    method: 'post',
})

storeSeason.form = storeSeasonForm

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::closeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
export const closeSeason = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: closeSeason.url(args, options),
    method: 'post',
})

closeSeason.definition = {
    methods: ["post"],
    url: '/employee/seasons/{season}/close',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::closeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
closeSeason.url = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { season: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { season: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            season: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        season: typeof args.season === 'object'
        ? args.season.id
        : args.season,
    }

    return closeSeason.definition.url
            .replace('{season}', parsedArgs.season.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::closeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
closeSeason.post = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: closeSeason.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::closeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
const closeSeasonForm = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: closeSeason.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::closeSeason
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
closeSeasonForm.post = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: closeSeason.url(args, options),
    method: 'post',
})

closeSeason.form = closeSeasonForm

const LeaderboardController = { index, storeSeason, closeSeason }

export default LeaderboardController