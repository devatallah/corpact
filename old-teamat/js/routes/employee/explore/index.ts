import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\ExploreController::index
* @see app/Http/Controllers/Employee/ExploreController.php:21
* @route '/employee/explore'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/explore',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\ExploreController::index
* @see app/Http/Controllers/Employee/ExploreController.php:21
* @route '/employee/explore'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\ExploreController::index
* @see app/Http/Controllers/Employee/ExploreController.php:21
* @route '/employee/explore'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::index
* @see app/Http/Controllers/Employee/ExploreController.php:21
* @route '/employee/explore'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::index
* @see app/Http/Controllers/Employee/ExploreController.php:21
* @route '/employee/explore'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::index
* @see app/Http/Controllers/Employee/ExploreController.php:21
* @route '/employee/explore'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::index
* @see app/Http/Controllers/Employee/ExploreController.php:21
* @route '/employee/explore'
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
* @see \App\Http\Controllers\Employee\ExploreController::show
* @see app/Http/Controllers/Employee/ExploreController.php:43
* @route '/employee/explore/{partner}'
*/
export const show = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/employee/explore/{partner}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\ExploreController::show
* @see app/Http/Controllers/Employee/ExploreController.php:43
* @route '/employee/explore/{partner}'
*/
show.url = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { partner: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { partner: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            partner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        partner: typeof args.partner === 'object'
        ? args.partner.id
        : args.partner,
    }

    return show.definition.url
            .replace('{partner}', parsedArgs.partner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\ExploreController::show
* @see app/Http/Controllers/Employee/ExploreController.php:43
* @route '/employee/explore/{partner}'
*/
show.get = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::show
* @see app/Http/Controllers/Employee/ExploreController.php:43
* @route '/employee/explore/{partner}'
*/
show.head = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::show
* @see app/Http/Controllers/Employee/ExploreController.php:43
* @route '/employee/explore/{partner}'
*/
const showForm = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::show
* @see app/Http/Controllers/Employee/ExploreController.php:43
* @route '/employee/explore/{partner}'
*/
showForm.get = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ExploreController::show
* @see app/Http/Controllers/Employee/ExploreController.php:43
* @route '/employee/explore/{partner}'
*/
showForm.head = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const explore = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
}

export default explore