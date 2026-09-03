import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\NotificationController::index
* @see app/Http/Controllers/Admin/NotificationController.php:36
* @route '/admin/notifs'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/notifs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\NotificationController::index
* @see app/Http/Controllers/Admin/NotificationController.php:36
* @route '/admin/notifs'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\NotificationController::index
* @see app/Http/Controllers/Admin/NotificationController.php:36
* @route '/admin/notifs'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::index
* @see app/Http/Controllers/Admin/NotificationController.php:36
* @route '/admin/notifs'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::index
* @see app/Http/Controllers/Admin/NotificationController.php:36
* @route '/admin/notifs'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::index
* @see app/Http/Controllers/Admin/NotificationController.php:36
* @route '/admin/notifs'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::index
* @see app/Http/Controllers/Admin/NotificationController.php:36
* @route '/admin/notifs'
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
* @see \App\Http\Controllers\Admin\NotificationController::store
* @see app/Http/Controllers/Admin/NotificationController.php:86
* @route '/admin/notifs'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/notifs',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\NotificationController::store
* @see app/Http/Controllers/Admin/NotificationController.php:86
* @route '/admin/notifs'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\NotificationController::store
* @see app/Http/Controllers/Admin/NotificationController.php:86
* @route '/admin/notifs'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::store
* @see app/Http/Controllers/Admin/NotificationController.php:86
* @route '/admin/notifs'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::store
* @see app/Http/Controllers/Admin/NotificationController.php:86
* @route '/admin/notifs'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\NotificationController::markAsRead
* @see app/Http/Controllers/Admin/NotificationController.php:102
* @route '/admin/notifs/{notification}/read'
*/
export const markAsRead = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.definition = {
    methods: ["post"],
    url: '/admin/notifs/{notification}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\NotificationController::markAsRead
* @see app/Http/Controllers/Admin/NotificationController.php:102
* @route '/admin/notifs/{notification}/read'
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
* @see \App\Http\Controllers\Admin\NotificationController::markAsRead
* @see app/Http/Controllers/Admin/NotificationController.php:102
* @route '/admin/notifs/{notification}/read'
*/
markAsRead.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAsRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::markAsRead
* @see app/Http/Controllers/Admin/NotificationController.php:102
* @route '/admin/notifs/{notification}/read'
*/
const markAsReadForm = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAsRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::markAsRead
* @see app/Http/Controllers/Admin/NotificationController.php:102
* @route '/admin/notifs/{notification}/read'
*/
markAsReadForm.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAsRead.url(args, options),
    method: 'post',
})

markAsRead.form = markAsReadForm

/**
* @see \App\Http\Controllers\Admin\NotificationController::destroy
* @see app/Http/Controllers/Admin/NotificationController.php:112
* @route '/admin/notifs/{notification}'
*/
export const destroy = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/notifs/{notification}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\NotificationController::destroy
* @see app/Http/Controllers/Admin/NotificationController.php:112
* @route '/admin/notifs/{notification}'
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
* @see \App\Http\Controllers\Admin\NotificationController::destroy
* @see app/Http/Controllers/Admin/NotificationController.php:112
* @route '/admin/notifs/{notification}'
*/
destroy.delete = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\NotificationController::destroy
* @see app/Http/Controllers/Admin/NotificationController.php:112
* @route '/admin/notifs/{notification}'
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
* @see \App\Http\Controllers\Admin\NotificationController::destroy
* @see app/Http/Controllers/Admin/NotificationController.php:112
* @route '/admin/notifs/{notification}'
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

const NotificationController = { index, store, markAsRead, destroy }

export default NotificationController