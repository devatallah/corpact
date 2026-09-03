import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retry
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
export const retry = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

retry.definition = {
    methods: ["post"],
    url: '/admin/payments/refunds/{intent}/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retry
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
retry.url = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return retry.definition.url
            .replace('{intent}', parsedArgs.intent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retry
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
retry.post = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retry
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
const retryForm = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: retry.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PaymentFailureController::retry
* @see app/Http/Controllers/Admin/PaymentFailureController.php:117
* @route '/admin/payments/refunds/{intent}/retry'
*/
retryForm.post = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: retry.url(args, options),
    method: 'post',
})

retry.form = retryForm

const refunds = {
    retry: Object.assign(retry, retry),
}

export default refunds