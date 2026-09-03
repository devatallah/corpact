import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\ReportController::index
* @see app/Http/Controllers/Employee/ReportController.php:16
* @route '/employee/reports'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\ReportController::index
* @see app/Http/Controllers/Employee/ReportController.php:16
* @route '/employee/reports'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\ReportController::index
* @see app/Http/Controllers/Employee/ReportController.php:16
* @route '/employee/reports'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ReportController::index
* @see app/Http/Controllers/Employee/ReportController.php:16
* @route '/employee/reports'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\ReportController::index
* @see app/Http/Controllers/Employee/ReportController.php:16
* @route '/employee/reports'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ReportController::index
* @see app/Http/Controllers/Employee/ReportController.php:16
* @route '/employee/reports'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ReportController::index
* @see app/Http/Controllers/Employee/ReportController.php:16
* @route '/employee/reports'
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

const ReportController = { index }

export default ReportController