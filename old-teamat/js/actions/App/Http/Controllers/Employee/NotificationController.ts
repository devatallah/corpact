import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\NotificationController::index
* @see app/Http/Controllers/Employee/NotificationController.php:23
* @route '/employee/notifications'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\NotificationController::index
* @see app/Http/Controllers/Employee/NotificationController.php:23
* @route '/employee/notifications'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\NotificationController::index
* @see app/Http/Controllers/Employee/NotificationController.php:23
* @route '/employee/notifications'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::index
* @see app/Http/Controllers/Employee/NotificationController.php:23
* @route '/employee/notifications'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::index
* @see app/Http/Controllers/Employee/NotificationController.php:23
* @route '/employee/notifications'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::index
* @see app/Http/Controllers/Employee/NotificationController.php:23
* @route '/employee/notifications'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::index
* @see app/Http/Controllers/Employee/NotificationController.php:23
* @route '/employee/notifications'
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
* @see \App\Http\Controllers\Employee\NotificationController::markAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
export const markAsRead = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.definition = {
    methods: ["post"],
    url: '/employee/notifications/{notification}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
markAsRead.url = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notification: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { notification: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            notification: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        notification: typeof args.notification === 'object'
        ? args.notification.id
        : args.notification,
    }

    return markAsRead.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
markAsRead.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
const markAsReadForm = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAsRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
markAsReadForm.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.form = markAsReadForm

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAllAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
export const markAllAsRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllAsRead.url(options),
    method: 'post',
})

markAllAsRead.definition = {
    methods: ["post"],
    url: '/employee/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAllAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
markAllAsRead.url = (options?: RouteQueryOptions) => {
    return markAllAsRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAllAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
markAllAsRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllAsRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAllAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
const markAllAsReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllAsRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::markAllAsRead
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
markAllAsReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllAsRead.url(options),
    method: 'post',
})

markAllAsRead.form = markAllAsReadForm

const NotificationController = { index, markAsRead, markAllAsRead }

export default NotificationController