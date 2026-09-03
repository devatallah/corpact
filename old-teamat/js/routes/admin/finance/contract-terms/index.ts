import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/finance/contract-terms',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::store
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const contractTerms = {
    store: Object.assign(store, store),
}

export default contractTerms