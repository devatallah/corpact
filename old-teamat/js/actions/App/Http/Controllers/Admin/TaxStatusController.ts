import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\TaxStatusController::index
* @see app/Http/Controllers/Admin/TaxStatusController.php:39
* @route '/admin/finance/tax-status'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/finance/tax-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TaxStatusController::index
* @see app/Http/Controllers/Admin/TaxStatusController.php:39
* @route '/admin/finance/tax-status'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TaxStatusController::index
* @see app/Http/Controllers/Admin/TaxStatusController.php:39
* @route '/admin/finance/tax-status'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TaxStatusController::index
* @see app/Http/Controllers/Admin/TaxStatusController.php:39
* @route '/admin/finance/tax-status'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TaxStatusController::index
* @see app/Http/Controllers/Admin/TaxStatusController.php:39
* @route '/admin/finance/tax-status'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TaxStatusController::index
* @see app/Http/Controllers/Admin/TaxStatusController.php:39
* @route '/admin/finance/tax-status'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TaxStatusController::index
* @see app/Http/Controllers/Admin/TaxStatusController.php:39
* @route '/admin/finance/tax-status'
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

const TaxStatusController = { index }

export default TaxStatusController