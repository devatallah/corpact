import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\LeagueController::index
* @see app/Http/Controllers/Company/LeagueController.php:40
* @route '/company/leagues'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/leagues',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\LeagueController::index
* @see app/Http/Controllers/Company/LeagueController.php:40
* @route '/company/leagues'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\LeagueController::index
* @see app/Http/Controllers/Company/LeagueController.php:40
* @route '/company/leagues'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::index
* @see app/Http/Controllers/Company/LeagueController.php:40
* @route '/company/leagues'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::index
* @see app/Http/Controllers/Company/LeagueController.php:40
* @route '/company/leagues'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::index
* @see app/Http/Controllers/Company/LeagueController.php:40
* @route '/company/leagues'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::index
* @see app/Http/Controllers/Company/LeagueController.php:40
* @route '/company/leagues'
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
* @see \App\Http\Controllers\Company\LeagueController::show
* @see app/Http/Controllers/Company/LeagueController.php:82
* @route '/company/leagues/{league}'
*/
export const show = (args: { league: number | { id: number } } | [league: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/company/leagues/{league}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\LeagueController::show
* @see app/Http/Controllers/Company/LeagueController.php:82
* @route '/company/leagues/{league}'
*/
show.url = (args: { league: number | { id: number } } | [league: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { league: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { league: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            league: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        league: typeof args.league === 'object'
        ? args.league.id
        : args.league,
    }

    return show.definition.url
            .replace('{league}', parsedArgs.league.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\LeagueController::show
* @see app/Http/Controllers/Company/LeagueController.php:82
* @route '/company/leagues/{league}'
*/
show.get = (args: { league: number | { id: number } } | [league: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::show
* @see app/Http/Controllers/Company/LeagueController.php:82
* @route '/company/leagues/{league}'
*/
show.head = (args: { league: number | { id: number } } | [league: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::show
* @see app/Http/Controllers/Company/LeagueController.php:82
* @route '/company/leagues/{league}'
*/
const showForm = (args: { league: number | { id: number } } | [league: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::show
* @see app/Http/Controllers/Company/LeagueController.php:82
* @route '/company/leagues/{league}'
*/
showForm.get = (args: { league: number | { id: number } } | [league: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\LeagueController::show
* @see app/Http/Controllers/Company/LeagueController.php:82
* @route '/company/leagues/{league}'
*/
showForm.head = (args: { league: number | { id: number } } | [league: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const LeagueController = { index, show }

export default LeagueController