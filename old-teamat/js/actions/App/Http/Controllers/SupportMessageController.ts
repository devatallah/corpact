import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SupportMessageController::store
* @see app/Http/Controllers/SupportMessageController.php:11
* @route '/support'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/support',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportMessageController::store
* @see app/Http/Controllers/SupportMessageController.php:11
* @route '/support'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportMessageController::store
* @see app/Http/Controllers/SupportMessageController.php:11
* @route '/support'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SupportMessageController::store
* @see app/Http/Controllers/SupportMessageController.php:11
* @route '/support'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SupportMessageController::store
* @see app/Http/Controllers/SupportMessageController.php:11
* @route '/support'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const SupportMessageController = { store }

export default SupportMessageController