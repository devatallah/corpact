import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\ReportController::index
* @see app/Http/Controllers/Company/ReportController.php:41
* @route '/company/reports'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\ReportController::index
* @see app/Http/Controllers/Company/ReportController.php:41
* @route '/company/reports'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\ReportController::index
* @see app/Http/Controllers/Company/ReportController.php:41
* @route '/company/reports'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::index
* @see app/Http/Controllers/Company/ReportController.php:41
* @route '/company/reports'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\ReportController::index
* @see app/Http/Controllers/Company/ReportController.php:41
* @route '/company/reports'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::index
* @see app/Http/Controllers/Company/ReportController.php:41
* @route '/company/reports'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::index
* @see app/Http/Controllers/Company/ReportController.php:41
* @route '/company/reports'
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
* @see \App\Http\Controllers\Company\ReportController::monthly
* @see app/Http/Controllers/Company/ReportController.php:123
* @route '/company/reports/monthly/{report}'
*/
export const monthly = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monthly.url(args, options),
    method: 'get',
})

monthly.definition = {
    methods: ["get","head"],
    url: '/company/reports/monthly/{report}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\ReportController::monthly
* @see app/Http/Controllers/Company/ReportController.php:123
* @route '/company/reports/monthly/{report}'
*/
monthly.url = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return monthly.definition.url
            .replace('{report}', parsedArgs.report.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\ReportController::monthly
* @see app/Http/Controllers/Company/ReportController.php:123
* @route '/company/reports/monthly/{report}'
*/
monthly.get = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monthly.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::monthly
* @see app/Http/Controllers/Company/ReportController.php:123
* @route '/company/reports/monthly/{report}'
*/
monthly.head = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: monthly.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\ReportController::monthly
* @see app/Http/Controllers/Company/ReportController.php:123
* @route '/company/reports/monthly/{report}'
*/
const monthlyForm = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: monthly.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::monthly
* @see app/Http/Controllers/Company/ReportController.php:123
* @route '/company/reports/monthly/{report}'
*/
monthlyForm.get = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: monthly.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::monthly
* @see app/Http/Controllers/Company/ReportController.php:123
* @route '/company/reports/monthly/{report}'
*/
monthlyForm.head = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: monthly.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

monthly.form = monthlyForm

/**
* @see \App\Http\Controllers\Company\ReportController::exportMethod
* @see app/Http/Controllers/Company/ReportController.php:101
* @route '/company/reports/export/{exportKey}'
*/
export const exportMethod = (args: { exportKey: string | number } | [exportKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/company/reports/export/{exportKey}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\ReportController::exportMethod
* @see app/Http/Controllers/Company/ReportController.php:101
* @route '/company/reports/export/{exportKey}'
*/
exportMethod.url = (args: { exportKey: string | number } | [exportKey: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { exportKey: args }
    }

    if (Array.isArray(args)) {
        args = {
            exportKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        exportKey: args.exportKey,
    }

    return exportMethod.definition.url
            .replace('{exportKey}', parsedArgs.exportKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\ReportController::exportMethod
* @see app/Http/Controllers/Company/ReportController.php:101
* @route '/company/reports/export/{exportKey}'
*/
exportMethod.get = (args: { exportKey: string | number } | [exportKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::exportMethod
* @see app/Http/Controllers/Company/ReportController.php:101
* @route '/company/reports/export/{exportKey}'
*/
exportMethod.head = (args: { exportKey: string | number } | [exportKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\ReportController::exportMethod
* @see app/Http/Controllers/Company/ReportController.php:101
* @route '/company/reports/export/{exportKey}'
*/
const exportMethodForm = (args: { exportKey: string | number } | [exportKey: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::exportMethod
* @see app/Http/Controllers/Company/ReportController.php:101
* @route '/company/reports/export/{exportKey}'
*/
exportMethodForm.get = (args: { exportKey: string | number } | [exportKey: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ReportController::exportMethod
* @see app/Http/Controllers/Company/ReportController.php:101
* @route '/company/reports/export/{exportKey}'
*/
exportMethodForm.head = (args: { exportKey: string | number } | [exportKey: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

const ReportController = { index, monthly, exportMethod, export: exportMethod }

export default ReportController