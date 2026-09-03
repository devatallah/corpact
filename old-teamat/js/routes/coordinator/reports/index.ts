import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import recommendations from './recommendations'
/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::index
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:58
* @route '/coordinator/reports'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/coordinator/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::index
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:58
* @route '/coordinator/reports'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::index
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:58
* @route '/coordinator/reports'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::index
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:58
* @route '/coordinator/reports'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::index
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:58
* @route '/coordinator/reports'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::index
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:58
* @route '/coordinator/reports'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::index
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:58
* @route '/coordinator/reports'
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
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::show
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:108
* @route '/coordinator/reports/{report}'
*/
export const show = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/coordinator/reports/{report}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::show
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:108
* @route '/coordinator/reports/{report}'
*/
show.url = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{report}', parsedArgs.report.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::show
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:108
* @route '/coordinator/reports/{report}'
*/
show.get = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::show
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:108
* @route '/coordinator/reports/{report}'
*/
show.head = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::show
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:108
* @route '/coordinator/reports/{report}'
*/
const showForm = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::show
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:108
* @route '/coordinator/reports/{report}'
*/
showForm.get = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::show
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:108
* @route '/coordinator/reports/{report}'
*/
showForm.head = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::exportMethod
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:175
* @route '/coordinator/reports/{report}/export/{exportKey}'
*/
export const exportMethod = (args: { report: number | { id: number }, exportKey: string | number } | [report: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/coordinator/reports/{report}/export/{exportKey}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::exportMethod
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:175
* @route '/coordinator/reports/{report}/export/{exportKey}'
*/
exportMethod.url = (args: { report: number | { id: number }, exportKey: string | number } | [report: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            report: args[0],
            exportKey: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        report: typeof args.report === 'object'
        ? args.report.id
        : args.report,
        exportKey: args.exportKey,
    }

    return exportMethod.definition.url
            .replace('{report}', parsedArgs.report.toString())
            .replace('{exportKey}', parsedArgs.exportKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::exportMethod
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:175
* @route '/coordinator/reports/{report}/export/{exportKey}'
*/
exportMethod.get = (args: { report: number | { id: number }, exportKey: string | number } | [report: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::exportMethod
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:175
* @route '/coordinator/reports/{report}/export/{exportKey}'
*/
exportMethod.head = (args: { report: number | { id: number }, exportKey: string | number } | [report: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::exportMethod
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:175
* @route '/coordinator/reports/{report}/export/{exportKey}'
*/
const exportMethodForm = (args: { report: number | { id: number }, exportKey: string | number } | [report: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::exportMethod
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:175
* @route '/coordinator/reports/{report}/export/{exportKey}'
*/
exportMethodForm.get = (args: { report: number | { id: number }, exportKey: string | number } | [report: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Coordinator\MonthlyReportController::exportMethod
* @see app/Http/Controllers/Coordinator/MonthlyReportController.php:175
* @route '/coordinator/reports/{report}/export/{exportKey}'
*/
exportMethodForm.head = (args: { report: number | { id: number }, exportKey: string | number } | [report: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

const reports = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    recommendations: Object.assign(recommendations, recommendations),
    export: Object.assign(exportMethod, exportMethod),
}

export default reports