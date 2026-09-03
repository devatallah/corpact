import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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

const results = {
    store: Object.assign(store, store),
}

export default results