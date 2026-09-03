import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\DashboardController::index
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/dash',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\DashboardController::index
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\DashboardController::index
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::index
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::index
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::index
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DashboardController::index
* @see app/Http/Controllers/Company/DashboardController.php:24
* @route '/company/dash'
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

const DashboardController = { index }

export default DashboardController