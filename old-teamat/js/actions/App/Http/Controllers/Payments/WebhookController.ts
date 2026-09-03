import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Payments\WebhookController::handle
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
export const handle = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(args, options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/webhooks/payments/{gateway}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Payments\WebhookController::handle
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
handle.url = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return handle.definition.url
            .replace('{gateway}', parsedArgs.gateway.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Payments\WebhookController::handle
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
handle.post = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Payments\WebhookController::handle
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
const handleForm = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Payments\WebhookController::handle
* @see app/Http/Controllers/Payments/WebhookController.php:20
* @route '/webhooks/payments/{gateway}'
*/
handleForm.post = (args: { gateway: string | number } | [gateway: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(args, options),
    method: 'post',
})

handle.form = handleForm

const WebhookController = { handle }

export default WebhookController