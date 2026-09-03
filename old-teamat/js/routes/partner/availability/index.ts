import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import external from './external'
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

const availability = {
    index: Object.assign(index, index),
    external: Object.assign(external, external),
}

export default availability