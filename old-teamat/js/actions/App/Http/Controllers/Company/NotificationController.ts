import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\NotificationController::index
* @see app/Http/Controllers/Company/NotificationController.php:24
* @route '/company/notifications'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\NotificationController::index
* @see app/Http/Controllers/Company/NotificationController.php:24
* @route '/company/notifications'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\NotificationController::index
* @see app/Http/Controllers/Company/NotificationController.php:24
* @route '/company/notifications'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::index
* @see app/Http/Controllers/Company/NotificationController.php:24
* @route '/company/notifications'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::index
* @see app/Http/Controllers/Company/NotificationController.php:24
* @route '/company/notifications'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::index
* @see app/Http/Controllers/Company/NotificationController.php:24
* @route '/company/notifications'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::index
* @see app/Http/Controllers/Company/NotificationController.php:24
* @route '/company/notifications'
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
* @see \App\Http\Controllers\Company\NotificationController::store
* @see app/Http/Controllers/Company/NotificationController.php:51
* @route '/company/notifications'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/company/notifications',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\NotificationController::store
* @see app/Http/Controllers/Company/NotificationController.php:51
* @route '/company/notifications'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\NotificationController::store
* @see app/Http/Controllers/Company/NotificationController.php:51
* @route '/company/notifications'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::store
* @see app/Http/Controllers/Company/NotificationController.php:51
* @route '/company/notifications'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::store
* @see app/Http/Controllers/Company/NotificationController.php:51
* @route '/company/notifications'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Company\NotificationController::markAsRead
* @see app/Http/Controllers/Company/NotificationController.php:67
* @route '/company/notifications/{notification}/read'
*/
export const markAsRead = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.definition = {
    methods: ["post"],
    url: '/company/notifications/{notification}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\NotificationController::markAsRead
* @see app/Http/Controllers/Company/NotificationController.php:67
* @route '/company/notifications/{notification}/read'
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
* @see \App\Http\Controllers\Company\NotificationController::markAsRead
* @see app/Http/Controllers/Company/NotificationController.php:67
* @route '/company/notifications/{notification}/read'
*/
markAsRead.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::markAsRead
* @see app/Http/Controllers/Company/NotificationController.php:67
* @route '/company/notifications/{notification}/read'
*/
const markAsReadForm = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAsRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::markAsRead
* @see app/Http/Controllers/Company/NotificationController.php:67
* @route '/company/notifications/{notification}/read'
*/
markAsReadForm.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.form = markAsReadForm

/**
* @see \App\Http\Controllers\Company\NotificationController::markAllAsRead
* @see app/Http/Controllers/Company/NotificationController.php:77
* @route '/company/notifications/mark-all-read'
*/
export const markAllAsRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllAsRead.url(options),
    method: 'post',
})

markAllAsRead.definition = {
    methods: ["post"],
    url: '/company/notifications/mark-all-read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\NotificationController::markAllAsRead
* @see app/Http/Controllers/Company/NotificationController.php:77
* @route '/company/notifications/mark-all-read'
*/
markAllAsRead.url = (options?: RouteQueryOptions) => {
    return markAllAsRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\NotificationController::markAllAsRead
* @see app/Http/Controllers/Company/NotificationController.php:77
* @route '/company/notifications/mark-all-read'
*/
markAllAsRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllAsRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::markAllAsRead
* @see app/Http/Controllers/Company/NotificationController.php:77
* @route '/company/notifications/mark-all-read'
*/
const markAllAsReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllAsRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::markAllAsRead
* @see app/Http/Controllers/Company/NotificationController.php:77
* @route '/company/notifications/mark-all-read'
*/
markAllAsReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllAsRead.url(options),
    method: 'post',
})

markAllAsRead.form = markAllAsReadForm

/**
* @see \App\Http\Controllers\Company\NotificationController::destroy
* @see app/Http/Controllers/Company/NotificationController.php:87
* @route '/company/notifications/{notification}'
*/
export const destroy = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/company/notifications/{notification}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Company\NotificationController::destroy
* @see app/Http/Controllers/Company/NotificationController.php:87
* @route '/company/notifications/{notification}'
*/
destroy.url = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\NotificationController::destroy
* @see app/Http/Controllers/Company/NotificationController.php:87
* @route '/company/notifications/{notification}'
*/
destroy.delete = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::destroy
* @see app/Http/Controllers/Company/NotificationController.php:87
* @route '/company/notifications/{notification}'
*/
const destroyForm = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\NotificationController::destroy
* @see app/Http/Controllers/Company/NotificationController.php:87
* @route '/company/notifications/{notification}'
*/
destroyForm.delete = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const NotificationController = { index, store, markAsRead, markAllAsRead, destroy }

export default NotificationController