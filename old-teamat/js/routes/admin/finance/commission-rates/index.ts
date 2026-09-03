import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/finance/commission-rates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const commissionRates = {
    store: Object.assign(store, store),
}

export default commissionRates