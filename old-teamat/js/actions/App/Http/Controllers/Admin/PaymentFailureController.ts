import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retryRefund
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
export const retryRefund = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retryRefund.url(args, options),
    method: 'post',
})

retryRefund.definition = {
    methods: ["post"],
    url: '/admin/payments/refunds/{intent}/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retryRefund
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
retryRefund.url = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { intent: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { intent: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            intent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        intent: typeof args.intent === 'object'
        ? args.intent.id
        : args.intent,
    }

    return retryRefund.definition.url
            .replace('{intent}', parsedArgs.intent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retryRefund
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
retryRefund.post = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retryRefund.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retryRefund
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
const retryRefundForm = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: retryRefund.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retryRefund
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
retryRefundForm.post = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: retryRefund.url(args, options),
    method: 'post',
})

retryRefund.form = retryRefundForm

const PaymentFailureController = { index, retryRefund }

export default PaymentFailureController