import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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
* @see \App\Http\Controllers\Company\WalletController::topup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
export const topup = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(options),
    method: 'post',
})

topup.definition = {
    methods: ["post"],
    url: '/company/wallet/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\WalletController::topup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
topup.url = (options?: RouteQueryOptions) => {
    return topup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\WalletController::topup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
topup.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\WalletController::topup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
const topupForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: topup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\WalletController::topup
* @see app/Http/Controllers/Company/WalletController.php:85
* @route '/company/wallet/topup'
*/
topupForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: topup.url(options),
    method: 'post',
})

topup.form = topupForm

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

const wallet = {
    index: Object.assign(index, index),
    topup: Object.assign(topup, topup),
    distribute: Object.assign(distribute, distribute),
}

export default wallet