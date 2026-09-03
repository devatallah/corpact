import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\PaymentController::index
* @see app/Http/Controllers/Employee/PaymentController.php:42
* @route '/employee/payments'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/payments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\PaymentController::index
* @see app/Http/Controllers/Employee/PaymentController.php:42
* @route '/employee/payments'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\PaymentController::index
* @see app/Http/Controllers/Employee/PaymentController.php:42
* @route '/employee/payments'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::index
* @see app/Http/Controllers/Employee/PaymentController.php:42
* @route '/employee/payments'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::index
* @see app/Http/Controllers/Employee/PaymentController.php:42
* @route '/employee/payments'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::index
* @see app/Http/Controllers/Employee/PaymentController.php:42
* @route '/employee/payments'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::index
* @see app/Http/Controllers/Employee/PaymentController.php:42
* @route '/employee/payments'
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
* @see \App\Http\Controllers\Employee\PaymentController::show
* @see app/Http/Controllers/Employee/PaymentController.php:68
* @route '/employee/payments/{intent}'
*/
export const show = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/employee/payments/{intent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\PaymentController::show
* @see app/Http/Controllers/Employee/PaymentController.php:68
* @route '/employee/payments/{intent}'
*/
show.url = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{intent}', parsedArgs.intent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\PaymentController::show
* @see app/Http/Controllers/Employee/PaymentController.php:68
* @route '/employee/payments/{intent}'
*/
show.get = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::show
* @see app/Http/Controllers/Employee/PaymentController.php:68
* @route '/employee/payments/{intent}'
*/
show.head = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::show
* @see app/Http/Controllers/Employee/PaymentController.php:68
* @route '/employee/payments/{intent}'
*/
const showForm = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::show
* @see app/Http/Controllers/Employee/PaymentController.php:68
* @route '/employee/payments/{intent}'
*/
showForm.get = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::show
* @see app/Http/Controllers/Employee/PaymentController.php:68
* @route '/employee/payments/{intent}'
*/
showForm.head = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Employee\PaymentController::pay
* @see app/Http/Controllers/Employee/PaymentController.php:87
* @route '/employee/payments/{intent}/pay'
*/
export const pay = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pay.url(args, options),
    method: 'post',
})

pay.definition = {
    methods: ["post"],
    url: '/employee/payments/{intent}/pay',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\PaymentController::pay
* @see app/Http/Controllers/Employee/PaymentController.php:87
* @route '/employee/payments/{intent}/pay'
*/
pay.url = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return pay.definition.url
            .replace('{intent}', parsedArgs.intent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\PaymentController::pay
* @see app/Http/Controllers/Employee/PaymentController.php:87
* @route '/employee/payments/{intent}/pay'
*/
pay.post = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pay.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::pay
* @see app/Http/Controllers/Employee/PaymentController.php:87
* @route '/employee/payments/{intent}/pay'
*/
const payForm = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pay.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\PaymentController::pay
* @see app/Http/Controllers/Employee/PaymentController.php:87
* @route '/employee/payments/{intent}/pay'
*/
payForm.post = (args: { intent: number | { id: number } } | [intent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pay.url(args, options),
    method: 'post',
})

pay.form = payForm

const payments = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    pay: Object.assign(pay, pay),
}

export default payments