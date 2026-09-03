import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\LeagueController::create
* @see app/Http/Controllers/Employee/LeagueController.php:46
* @route '/employee/community/{community}/leagues/create'
*/
export const create = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/employee/community/{community}/leagues/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\LeagueController::create
* @see app/Http/Controllers/Employee/LeagueController.php:46
* @route '/employee/community/{community}/leagues/create'
*/
create.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeagueController::create
* @see app/Http/Controllers/Employee/LeagueController.php:46
* @route '/employee/community/{community}/leagues/create'
*/
create.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::create
* @see app/Http/Controllers/Employee/LeagueController.php:46
* @route '/employee/community/{community}/leagues/create'
*/
create.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::create
* @see app/Http/Controllers/Employee/LeagueController.php:46
* @route '/employee/community/{community}/leagues/create'
*/
const createForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::create
* @see app/Http/Controllers/Employee/LeagueController.php:46
* @route '/employee/community/{community}/leagues/create'
*/
createForm.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::create
* @see app/Http/Controllers/Employee/LeagueController.php:46
* @route '/employee/community/{community}/leagues/create'
*/
createForm.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Employee\LeagueController::store
* @see app/Http/Controllers/Employee/LeagueController.php:61
* @route '/employee/community/{community}/leagues'
*/
export const store = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/leagues',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\LeagueController::store
* @see app/Http/Controllers/Employee/LeagueController.php:61
* @route '/employee/community/{community}/leagues'
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
* @see \App\Http\Controllers\Employee\LeagueController::store
* @see app/Http/Controllers/Employee/LeagueController.php:61
* @route '/employee/community/{community}/leagues'
*/
store.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::store
* @see app/Http/Controllers/Employee/LeagueController.php:61
* @route '/employee/community/{community}/leagues'
*/
const storeForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::store
* @see app/Http/Controllers/Employee/LeagueController.php:61
* @route '/employee/community/{community}/leagues'
*/
storeForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\LeagueController::show
* @see app/Http/Controllers/Employee/LeagueController.php:25
* @route '/employee/community/{community}/leagues/{league}'
*/
export const show = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/employee/community/{community}/leagues/{league}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\LeagueController::show
* @see app/Http/Controllers/Employee/LeagueController.php:25
* @route '/employee/community/{community}/leagues/{league}'
*/
show.url = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            league: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        league: typeof args.league === 'object'
        ? args.league.id
        : args.league,
    }

    return show.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{league}', parsedArgs.league.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeagueController::show
* @see app/Http/Controllers/Employee/LeagueController.php:25
* @route '/employee/community/{community}/leagues/{league}'
*/
show.get = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::show
* @see app/Http/Controllers/Employee/LeagueController.php:25
* @route '/employee/community/{community}/leagues/{league}'
*/
show.head = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::show
* @see app/Http/Controllers/Employee/LeagueController.php:25
* @route '/employee/community/{community}/leagues/{league}'
*/
const showForm = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::show
* @see app/Http/Controllers/Employee/LeagueController.php:25
* @route '/employee/community/{community}/leagues/{league}'
*/
showForm.get = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::show
* @see app/Http/Controllers/Employee/LeagueController.php:25
* @route '/employee/community/{community}/leagues/{league}'
*/
showForm.head = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Employee\LeagueController::recordResult
* @see app/Http/Controllers/Employee/LeagueController.php:103
* @route '/employee/community/{community}/leagues/{league}/matches/{match}/result'
*/
export const recordResult = (args: { community: number | { id: number }, league: number | { id: number }, match: number | { id: number } } | [community: number | { id: number }, league: number | { id: number }, match: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recordResult.url(args, options),
    method: 'post',
})

recordResult.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/leagues/{league}/matches/{match}/result',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\LeagueController::recordResult
* @see app/Http/Controllers/Employee/LeagueController.php:103
* @route '/employee/community/{community}/leagues/{league}/matches/{match}/result'
*/
recordResult.url = (args: { community: number | { id: number }, league: number | { id: number }, match: number | { id: number } } | [community: number | { id: number }, league: number | { id: number }, match: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            league: args[1],
            match: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        league: typeof args.league === 'object'
        ? args.league.id
        : args.league,
        match: typeof args.match === 'object'
        ? args.match.id
        : args.match,
    }

    return recordResult.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{league}', parsedArgs.league.toString())
            .replace('{match}', parsedArgs.match.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeagueController::recordResult
* @see app/Http/Controllers/Employee/LeagueController.php:103
* @route '/employee/community/{community}/leagues/{league}/matches/{match}/result'
*/
recordResult.post = (args: { community: number | { id: number }, league: number | { id: number }, match: number | { id: number } } | [community: number | { id: number }, league: number | { id: number }, match: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recordResult.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::recordResult
* @see app/Http/Controllers/Employee/LeagueController.php:103
* @route '/employee/community/{community}/leagues/{league}/matches/{match}/result'
*/
const recordResultForm = (args: { community: number | { id: number }, league: number | { id: number }, match: number | { id: number } } | [community: number | { id: number }, league: number | { id: number }, match: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: recordResult.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::recordResult
* @see app/Http/Controllers/Employee/LeagueController.php:103
* @route '/employee/community/{community}/leagues/{league}/matches/{match}/result'
*/
recordResultForm.post = (args: { community: number | { id: number }, league: number | { id: number }, match: number | { id: number } } | [community: number | { id: number }, league: number | { id: number }, match: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: recordResult.url(args, options),
    method: 'post',
})

recordResult.form = recordResultForm

/**
* @see \App\Http\Controllers\Employee\LeagueController::destroy
* @see app/Http/Controllers/Employee/LeagueController.php:150
* @route '/employee/community/{community}/leagues/{league}'
*/
export const destroy = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/employee/community/{community}/leagues/{league}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Employee\LeagueController::destroy
* @see app/Http/Controllers/Employee/LeagueController.php:150
* @route '/employee/community/{community}/leagues/{league}'
*/
destroy.url = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            league: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        league: typeof args.league === 'object'
        ? args.league.id
        : args.league,
    }

    return destroy.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{league}', parsedArgs.league.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\LeagueController::destroy
* @see app/Http/Controllers/Employee/LeagueController.php:150
* @route '/employee/community/{community}/leagues/{league}'
*/
destroy.delete = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::destroy
* @see app/Http/Controllers/Employee/LeagueController.php:150
* @route '/employee/community/{community}/leagues/{league}'
*/
const destroyForm = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\LeagueController::destroy
* @see app/Http/Controllers/Employee/LeagueController.php:150
* @route '/employee/community/{community}/leagues/{league}'
*/
destroyForm.delete = (args: { community: number | { id: number }, league: number | { id: number } } | [community: number | { id: number }, league: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const leagues = {
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    recordResult: Object.assign(recordResult, recordResult),
    destroy: Object.assign(destroy, destroy),
}

export default leagues