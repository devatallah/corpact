import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\NotificationLogController::index
* @see app/Http/Controllers/Admin/NotificationLogController.php:48
* @route '/admin/notification-logs'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/notification-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\NotificationLogController::index
* @see app/Http/Controllers/Admin/NotificationLogController.php:48
* @route '/admin/notification-logs'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\NotificationLogController::index
* @see app/Http/Controllers/Admin/NotificationLogController.php:48
* @route '/admin/notification-logs'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationLogController::index
* @see app/Http/Controllers/Admin/NotificationLogController.php:48
* @route '/admin/notification-logs'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\NotificationLogController::index
* @see app/Http/Controllers/Admin/NotificationLogController.php:48
* @route '/admin/notification-logs'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationLogController::index
* @see app/Http/Controllers/Admin/NotificationLogController.php:48
* @route '/admin/notification-logs'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationLogController::index
* @see app/Http/Controllers/Admin/NotificationLogController.php:48
* @route '/admin/notification-logs'
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

const NotificationLogController = { index }

export default NotificationLogController