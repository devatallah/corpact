import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::ghostEvents
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
export const ghostEvents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ghostEvents.url(options),
    method: 'get',
})

ghostEvents.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/ghost-events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::ghostEvents
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
ghostEvents.url = (options?: RouteQueryOptions) => {
    return ghostEvents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::ghostEvents
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
ghostEvents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ghostEvents.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::ghostEvents
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
ghostEvents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ghostEvents.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::ghostEvents
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
const ghostEventsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ghostEvents.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::ghostEvents
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
ghostEventsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ghostEvents.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GhostEventMonitorController::ghostEvents
* @see app/Http/Controllers/Admin/GhostEventMonitorController.php:54
* @route '/admin/monitoring/ghost-events'
*/
ghostEventsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ghostEvents.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ghostEvents.form = ghostEventsForm

const monitoring = {
    ghostEvents: Object.assign(ghostEvents, ghostEvents),
}

export default monitoring