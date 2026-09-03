import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\ResultController::store
* @see app/Http/Controllers/Employee/ResultController.php:24
* @route '/employee/detail/{event}/results/{employee}'
*/
export const store = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/results/{employee}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\ResultController::store
* @see app/Http/Controllers/Employee/ResultController.php:24
* @route '/employee/detail/{event}/results/{employee}'
*/
store.url = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            event: args[0],
            employee: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return store.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\ResultController::store
* @see app/Http/Controllers/Employee/ResultController.php:24
* @route '/employee/detail/{event}/results/{employee}'
*/
store.post = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\ResultController::store
* @see app/Http/Controllers/Employee/ResultController.php:24
* @route '/employee/detail/{event}/results/{employee}'
*/
const storeForm = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\ResultController::store
* @see app/Http/Controllers/Employee/ResultController.php:24
* @route '/employee/detail/{event}/results/{employee}'
*/
storeForm.post = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\ResultController::correct
* @see app/Http/Controllers/Employee/ResultController.php:55
* @route '/employee/results/{result}/correct'
*/
export const correct = (args: { result: number | { id: number } } | [result: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: correct.url(args, options),
    method: 'post',
})

correct.definition = {
    methods: ["post"],
    url: '/employee/results/{result}/correct',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\ResultController::correct
* @see app/Http/Controllers/Employee/ResultController.php:55
* @route '/employee/results/{result}/correct'
*/
correct.url = (args: { result: number | { id: number } } | [result: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { result: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            result: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        result: typeof args.result === 'object'
        ? args.result.id
        : args.result,
    }

    return correct.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\ResultController::correct
* @see app/Http/Controllers/Employee/ResultController.php:55
* @route '/employee/results/{result}/correct'
*/
correct.post = (args: { result: number | { id: number } } | [result: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: correct.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\ResultController::correct
* @see app/Http/Controllers/Employee/ResultController.php:55
* @route '/employee/results/{result}/correct'
*/
const correctForm = (args: { result: number | { id: number } } | [result: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: correct.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\ResultController::correct
* @see app/Http/Controllers/Employee/ResultController.php:55
* @route '/employee/results/{result}/correct'
*/
correctForm.post = (args: { result: number | { id: number } } | [result: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: correct.url(args, options),
    method: 'post',
})

correct.form = correctForm

const ResultController = { store, correct }

export default ResultController