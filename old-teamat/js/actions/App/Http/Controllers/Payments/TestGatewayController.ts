import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Payments\TestGatewayController::checkout
* @see app/Http/Controllers/Payments/TestGatewayController.php:28
* @route '/test-gateway/checkout/{reference}'
*/
export const checkout = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkout.url(args, options),
    method: 'get',
})

checkout.definition = {
    methods: ["get","head"],
    url: '/test-gateway/checkout/{reference}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::checkout
* @see app/Http/Controllers/Payments/TestGatewayController.php:28
* @route '/test-gateway/checkout/{reference}'
*/
checkout.url = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reference: args }
    }

    if (Array.isArray(args)) {
        args = {
            reference: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reference: args.reference,
    }

    return checkout.definition.url
            .replace('{reference}', parsedArgs.reference.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::checkout
* @see app/Http/Controllers/Payments/TestGatewayController.php:28
* @route '/test-gateway/checkout/{reference}'
*/
checkout.get = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkout.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::checkout
* @see app/Http/Controllers/Payments/TestGatewayController.php:28
* @route '/test-gateway/checkout/{reference}'
*/
checkout.head = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkout.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::checkout
* @see app/Http/Controllers/Payments/TestGatewayController.php:28
* @route '/test-gateway/checkout/{reference}'
*/
const checkoutForm = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkout.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::checkout
* @see app/Http/Controllers/Payments/TestGatewayController.php:28
* @route '/test-gateway/checkout/{reference}'
*/
checkoutForm.get = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkout.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::checkout
* @see app/Http/Controllers/Payments/TestGatewayController.php:28
* @route '/test-gateway/checkout/{reference}'
*/
checkoutForm.head = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkout.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

checkout.form = checkoutForm

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::complete
* @see app/Http/Controllers/Payments/TestGatewayController.php:42
* @route '/test-gateway/checkout/{reference}'
*/
export const complete = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

complete.definition = {
    methods: ["post"],
    url: '/test-gateway/checkout/{reference}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::complete
* @see app/Http/Controllers/Payments/TestGatewayController.php:42
* @route '/test-gateway/checkout/{reference}'
*/
complete.url = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reference: args }
    }

    if (Array.isArray(args)) {
        args = {
            reference: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reference: args.reference,
    }

    return complete.definition.url
            .replace('{reference}', parsedArgs.reference.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::complete
* @see app/Http/Controllers/Payments/TestGatewayController.php:42
* @route '/test-gateway/checkout/{reference}'
*/
complete.post = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::complete
* @see app/Http/Controllers/Payments/TestGatewayController.php:42
* @route '/test-gateway/checkout/{reference}'
*/
const completeForm = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Payments\TestGatewayController::complete
* @see app/Http/Controllers/Payments/TestGatewayController.php:42
* @route '/test-gateway/checkout/{reference}'
*/
completeForm.post = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, options),
    method: 'post',
})

complete.form = completeForm

const TestGatewayController = { checkout, complete }

export default TestGatewayController