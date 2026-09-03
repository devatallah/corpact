import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import bank from './bank'
import reliability from './reliability'
import priceChanges from './price-changes'
/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::oversight
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
export const oversight = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: oversight.url(options),
    method: 'get',
})

oversight.definition = {
    methods: ["get","head"],
    url: '/admin/providers/oversight',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::oversight
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
oversight.url = (options?: RouteQueryOptions) => {
    return oversight.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::oversight
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
oversight.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: oversight.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::oversight
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
oversight.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: oversight.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::oversight
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
const oversightForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: oversight.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::oversight
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
oversightForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: oversight.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::oversight
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
oversightForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: oversight.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

oversight.form = oversightForm

const providers = {
    oversight: Object.assign(oversight, oversight),
    bank: Object.assign(bank, bank),
    reliability: Object.assign(reliability, reliability),
    priceChanges: Object.assign(priceChanges, priceChanges),
}

export default providers