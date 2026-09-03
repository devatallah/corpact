import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::index
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/provider-suggestions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::index
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::index
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::index
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::index
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::index
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\ProviderSuggestionController::index
* @see app/Http/Controllers/Employee/ProviderSuggestionController.php:21
* @route '/employee/provider-suggestions'
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

const ProviderSuggestionController = { index }

export default ProviderSuggestionController