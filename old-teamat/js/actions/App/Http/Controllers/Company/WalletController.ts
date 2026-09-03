import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\WalletController::index
* @see app/Http/Controllers/Company/WalletController.php:32
* @route '/company/wallet'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/wallet',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\WalletController::index
* @see app/Http/Controllers/Company/WalletController.php:32
* @route '/company/wallet'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\WalletController::index
* @see app/Http/Controllers/Company/WalletController.php:32
* @route '/company/wallet'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\WalletController::index
* @see app/Http/Controllers/Company/WalletController.php:32
* @route '/company/wallet'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\WalletController::index
* @see app/Http/Controllers/Company/WalletController.php:32
* @route '/company/wallet'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\WalletController::index
* @see app/Http/Controllers/Company/WalletController.php:32
* @route '/company/wallet'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\WalletController::index
* @see app/Http/Controllers/Company/WalletController.php:32
* @route '/company/wallet'
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
* @see \App\Http\Controllers\Company\WalletController::submitTopup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
export const submitTopup = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitTopup.url(options),
    method: 'post',
})

submitTopup.definition = {
    methods: ["post"],
    url: '/company/wallet/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\WalletController::submitTopup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
submitTopup.url = (options?: RouteQueryOptions) => {
    return submitTopup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\WalletController::submitTopup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
submitTopup.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitTopup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\WalletController::submitTopup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
const submitTopupForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: submitTopup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\WalletController::submitTopup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
submitTopupForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: submitTopup.url(options),
    method: 'post',
})

submitTopup.form = submitTopupForm

/**
* @see \App\Http\Controllers\Company\WalletController::distribute
* @see app/Http/Controllers/Company/WalletController.php:101
* @route '/company/wallet/distribute'
*/
export const distribute = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: distribute.url(options),
    method: 'post',
})

distribute.definition = {
    methods: ["post"],
    url: '/company/wallet/distribute',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\WalletController::distribute
* @see app/Http/Controllers/Company/WalletController.php:101
* @route '/company/wallet/distribute'
*/
distribute.url = (options?: RouteQueryOptions) => {
    return distribute.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\WalletController::distribute
* @see app/Http/Controllers/Company/WalletController.php:101
* @route '/company/wallet/distribute'
*/
distribute.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: distribute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\WalletController::distribute
* @see app/Http/Controllers/Company/WalletController.php:101
* @route '/company/wallet/distribute'
*/
const distributeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: distribute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\WalletController::distribute
* @see app/Http/Controllers/Company/WalletController.php:101
* @route '/company/wallet/distribute'
*/
distributeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: distribute.url(options),
    method: 'post',
})

distribute.form = distributeForm

const WalletController = { index, submitTopup, distribute }

export default WalletController