import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Payments\WebhookController::payments
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
export const payments = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: payments.url(args, options),
    method: 'post',
})

payments.definition = {
    methods: ["post"],
    url: '/webhooks/payments/{gateway}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Payments\WebhookController::payments
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
payments.url = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { gateway: args }
    }

    if (Array.isArray(args)) {
        args = {
            gateway: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        gateway: args.gateway,
    }

    return payments.definition.url
            .replace('{gateway}', parsedArgs.gateway.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Payments\WebhookController::payments
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
payments.post = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: payments.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Payments\WebhookController::payments
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
const paymentsForm = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: payments.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Payments\WebhookController::payments
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
paymentsForm.post = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: payments.url(args, options),
    method: 'post',
})

payments.form = paymentsForm

const webhooks = {
    payments: Object.assign(payments, payments),
}

export default webhooks