import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::index
* @see app/Http/Controllers/Admin/PaymentFailureController.php:38
* @route '/admin/payments/failures'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/payments/failures',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::index
* @see app/Http/Controllers/Admin/PaymentFailureController.php:38
* @route '/admin/payments/failures'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::index
* @see app/Http/Controllers/Admin/PaymentFailureController.php:38
* @route '/admin/payments/failures'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::index
* @see app/Http/Controllers/Admin/PaymentFailureController.php:38
* @route '/admin/payments/failures'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::index
* @see app/Http/Controllers/Admin/PaymentFailureController.php:38
* @route '/admin/payments/failures'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::index
* @see app/Http/Controllers/Admin/PaymentFailureController.php:38
* @route '/admin/payments/failures'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::index
* @see app/Http/Controllers/Admin/PaymentFailureController.php:38
* @route '/admin/payments/failures'
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

const failures = {
    index: Object.assign(index, index),
}

export default failures