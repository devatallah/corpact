import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\LeaderboardController::store
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
export const store = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/seasons',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::store
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
store.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::store
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
store.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::store
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
const storeForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::store
* @see app/Http/Controllers/Employee/LeaderboardController.php:92
* @route '/employee/community/{community}/seasons'
*/
storeForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::close
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
export const close = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

close.definition = {
    methods: ["post"],
    url: '/employee/seasons/{season}/close',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::close
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
close.url = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return close.definition.url
            .replace('{season}', parsedArgs.season.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::close
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
close.post = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::close
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
const closeForm = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: close.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeaderboardController::close
* @see app/Http/Controllers/Employee/LeaderboardController.php:128
* @route '/employee/seasons/{season}/close'
*/
closeForm.post = (args: { season: number | { id: number } } | [season: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: close.url(args, options),
    method: 'post',
})

close.form = closeForm

const seasons = {
    store: Object.assign(store, store),
    close: Object.assign(close, close),
}

export default seasons