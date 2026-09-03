import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::index
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/ghost-events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::index
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::index
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::index
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::index
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::index
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::index
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
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

const GhostEventMonitorController = { index }

export default GhostEventMonitorController