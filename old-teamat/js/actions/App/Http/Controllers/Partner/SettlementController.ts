import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\SettlementController::index
* @see app/Http/Controllers/Partner/SettlementController.php:25
* @route '/partner/settlements'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/partner/settlements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\SettlementController::index
* @see app/Http/Controllers/Partner/SettlementController.php:25
* @route '/partner/settlements'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\SettlementController::index
* @see app/Http/Controllers/Partner/SettlementController.php:25
* @route '/partner/settlements'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::index
* @see app/Http/Controllers/Partner/SettlementController.php:25
* @route '/partner/settlements'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::index
* @see app/Http/Controllers/Partner/SettlementController.php:25
* @route '/partner/settlements'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::index
* @see app/Http/Controllers/Partner/SettlementController.php:25
* @route '/partner/settlements'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::index
* @see app/Http/Controllers/Partner/SettlementController.php:25
* @route '/partner/settlements'
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
* @see \App\Http\Controllers\Partner\SettlementController::show
* @see app/Http/Controllers/Partner/SettlementController.php:39
* @route '/partner/settlements/{settlement}'
*/
export const show = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/partner/settlements/{settlement}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\SettlementController::show
* @see app/Http/Controllers/Partner/SettlementController.php:39
* @route '/partner/settlements/{settlement}'
*/
show.url = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { settlement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { settlement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            settlement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        settlement: typeof args.settlement === 'object'
        ? args.settlement.id
        : args.settlement,
    }

    return show.definition.url
            .replace('{settlement}', parsedArgs.settlement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\SettlementController::show
* @see app/Http/Controllers/Partner/SettlementController.php:39
* @route '/partner/settlements/{settlement}'
*/
show.get = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::show
* @see app/Http/Controllers/Partner/SettlementController.php:39
* @route '/partner/settlements/{settlement}'
*/
show.head = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::show
* @see app/Http/Controllers/Partner/SettlementController.php:39
* @route '/partner/settlements/{settlement}'
*/
const showForm = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::show
* @see app/Http/Controllers/Partner/SettlementController.php:39
* @route '/partner/settlements/{settlement}'
*/
showForm.get = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\SettlementController::show
* @see app/Http/Controllers/Partner/SettlementController.php:39
* @route '/partner/settlements/{settlement}'
*/
showForm.head = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const SettlementController = { index, show }

export default SettlementController