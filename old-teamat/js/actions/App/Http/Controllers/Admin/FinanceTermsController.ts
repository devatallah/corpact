import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeCommissionRate
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
export const storeCommissionRate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCommissionRate.url(options),
    method: 'post',
})

storeCommissionRate.definition = {
    methods: ["post"],
    url: '/admin/finance/commission-rates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeCommissionRate
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
storeCommissionRate.url = (options?: RouteQueryOptions) => {
    return storeCommissionRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeCommissionRate
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
storeCommissionRate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCommissionRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeCommissionRate
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
const storeCommissionRateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCommissionRate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeCommissionRate
* @see app/Http/Controllers/Admin/FinanceTermsController.php:96
* @route '/admin/finance/commission-rates'
*/
storeCommissionRateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCommissionRate.url(options),
    method: 'post',
})

storeCommissionRate.form = storeCommissionRateForm

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

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeContractTerms
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
export const storeContractTerms = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeContractTerms.url(options),
    method: 'post',
})

storeContractTerms.definition = {
    methods: ["post"],
    url: '/admin/finance/contract-terms',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeContractTerms
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
storeContractTerms.url = (options?: RouteQueryOptions) => {
    return storeContractTerms.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeContractTerms
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
storeContractTerms.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeContractTerms.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeContractTerms
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
const storeContractTermsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeContractTerms.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceTermsController::storeContractTerms
* @see app/Http/Controllers/Admin/FinanceTermsController.php:134
* @route '/admin/finance/contract-terms'
*/
storeContractTermsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeContractTerms.url(options),
    method: 'post',
})

storeContractTerms.form = storeContractTermsForm

const FinanceTermsController = { storeCommissionRate, index, storeContractTerms }

export default FinanceTermsController