import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::store
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:148
* @route '/coordinator/reports/{report}/recommendations'
*/
export const store = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/coordinator/reports/{report}/recommendations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::store
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:148
* @route '/coordinator/reports/{report}/recommendations'
*/
store.url = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { report: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { report: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            report: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        report: typeof args.report === 'object'
        ? args.report.id
        : args.report,
    }

    return store.definition.url
            .replace('{report}', parsedArgs.report.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::store
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:148
* @route '/coordinator/reports/{report}/recommendations'
*/
store.post = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::store
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:148
* @route '/coordinator/reports/{report}/recommendations'
*/
const storeForm = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::store
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:148
* @route '/coordinator/reports/{report}/recommendations'
*/
storeForm.post = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const recommendations = {
    store: Object.assign(store, store),
}

export default recommendations