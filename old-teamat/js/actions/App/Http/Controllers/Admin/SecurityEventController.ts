import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SecurityEventController::index
* @see app/Http/Controllers/Admin/SecurityEventController.php:34
* @route '/admin/security/events'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/security/events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SecurityEventController::index
* @see app/Http/Controllers/Admin/SecurityEventController.php:34
* @route '/admin/security/events'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SecurityEventController::index
* @see app/Http/Controllers/Admin/SecurityEventController.php:34
* @route '/admin/security/events'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SecurityEventController::index
* @see app/Http/Controllers/Admin/SecurityEventController.php:34
* @route '/admin/security/events'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SecurityEventController::index
* @see app/Http/Controllers/Admin/SecurityEventController.php:34
* @route '/admin/security/events'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SecurityEventController::index
* @see app/Http/Controllers/Admin/SecurityEventController.php:34
* @route '/admin/security/events'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SecurityEventController::index
* @see app/Http/Controllers/Admin/SecurityEventController.php:34
* @route '/admin/security/events'
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

const SecurityEventController = { index }

export default SecurityEventController