import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\AvailabilityController::index
* @see app/Http/Controllers/Partner/AvailabilityController.php:26
* @route '/partner/availability'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/partner/availability',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::index
* @see app/Http/Controllers/Partner/AvailabilityController.php:26
* @route '/partner/availability'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::index
* @see app/Http/Controllers/Partner/AvailabilityController.php:26
* @route '/partner/availability'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::index
* @see app/Http/Controllers/Partner/AvailabilityController.php:26
* @route '/partner/availability'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::index
* @see app/Http/Controllers/Partner/AvailabilityController.php:26
* @route '/partner/availability'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::index
* @see app/Http/Controllers/Partner/AvailabilityController.php:26
* @route '/partner/availability'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::index
* @see app/Http/Controllers/Partner/AvailabilityController.php:26
* @route '/partner/availability'
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
* @see \App\Http\Controllers\Partner\AvailabilityController::storeExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
export const storeExternal = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeExternal.url(options),
    method: 'post',
})

storeExternal.definition = {
    methods: ["post"],
    url: '/partner/availability/external',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::storeExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
storeExternal.url = (options?: RouteQueryOptions) => {
    return storeExternal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::storeExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
storeExternal.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeExternal.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::storeExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
const storeExternalForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeExternal.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::storeExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
storeExternalForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeExternal.url(options),
    method: 'post',
})

storeExternal.form = storeExternalForm

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroyExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
export const destroyExternal = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyExternal.url(args, options),
    method: 'delete',
})

destroyExternal.definition = {
    methods: ["delete"],
    url: '/partner/availability/external/{slot}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroyExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
destroyExternal.url = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slot: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { slot: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            slot: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        slot: typeof args.slot === 'object'
        ? args.slot.id
        : args.slot,
    }

    return destroyExternal.definition.url
            .replace('{slot}', parsedArgs.slot.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroyExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
destroyExternal.delete = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyExternal.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroyExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
const destroyExternalForm = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyExternal.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroyExternal
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
destroyExternalForm.delete = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyExternal.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyExternal.form = destroyExternalForm

const AvailabilityController = { index, storeExternal, destroyExternal }

export default AvailabilityController