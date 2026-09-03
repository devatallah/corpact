import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\RevenueController::index
* @see app/Http/Controllers/Admin/RevenueController.php:23
* @route '/admin/revenue'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/revenue',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\RevenueController::index
* @see app/Http/Controllers/Admin/RevenueController.php:23
* @route '/admin/revenue'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RevenueController::index
* @see app/Http/Controllers/Admin/RevenueController.php:23
* @route '/admin/revenue'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\RevenueController::index
* @see app/Http/Controllers/Admin/RevenueController.php:23
* @route '/admin/revenue'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\RevenueController::index
* @see app/Http/Controllers/Admin/RevenueController.php:23
* @route '/admin/revenue'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\RevenueController::index
* @see app/Http/Controllers/Admin/RevenueController.php:23
* @route '/admin/revenue'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\RevenueController::index
* @see app/Http/Controllers/Admin/RevenueController.php:23
* @route '/admin/revenue'
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

const revenue = {
    index: Object.assign(index, index),
}

export default revenue