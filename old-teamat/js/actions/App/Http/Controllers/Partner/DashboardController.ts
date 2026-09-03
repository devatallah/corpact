import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\DashboardController::index
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/partner/dash',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\DashboardController::index
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\DashboardController::index
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::index
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::index
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::index
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\DashboardController::index
* @see app/Http/Controllers/Partner/DashboardController.php:19
* @route '/partner/dash'
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