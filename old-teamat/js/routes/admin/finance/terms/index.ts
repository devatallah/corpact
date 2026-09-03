import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::index
* @see app/Http/Controllers/Admin/FinanceTermsController.php:29
* @route '/admin/finance/terms'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/finance/terms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::index
* @see app/Http/Controllers/Admin/FinanceTermsController.php:29
* @route '/admin/finance/terms'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::index
* @see app/Http/Controllers/Admin/FinanceTermsController.php:29
* @route '/admin/finance/terms'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::index
* @see app/Http/Controllers/Admin/FinanceTermsController.php:29
* @route '/admin/finance/terms'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::index
* @see app/Http/Controllers/Admin/FinanceTermsController.php:29
* @route '/admin/finance/terms'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::index
* @see app/Http/Controllers/Admin/FinanceTermsController.php:29
* @route '/admin/finance/terms'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::index
* @see app/Http/Controllers/Admin/FinanceTermsController.php:29
* @route '/admin/finance/terms'
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

const terms = {
    index: Object.assign(index, index),
}

export default terms