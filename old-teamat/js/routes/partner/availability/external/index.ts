import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\AvailabilityController::store
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/partner/availability/external',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::store
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::store
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::store
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::store
* @see app/Http/Controllers/Partner/AvailabilityController.php:58
* @route '/partner/availability/external'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroy
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
export const destroy = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/partner/availability/external/{slot}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroy
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
destroy.url = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{slot}', parsedArgs.slot.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroy
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
destroy.delete = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroy
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
const destroyForm = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\AvailabilityController::destroy
* @see app/Http/Controllers/Partner/AvailabilityController.php:84
* @route '/partner/availability/external/{slot}'
*/
destroyForm.delete = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const external = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default external