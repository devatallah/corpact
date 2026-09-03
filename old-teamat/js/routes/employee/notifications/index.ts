import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
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
* @see \App\Http\Controllers\Employee\NotificationController::read
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
export const read = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(args, options),
    method: 'post',
})

read.definition = {
    methods: ["post"],
    url: '/employee/notifications/{notification}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\NotificationController::read
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
read.url = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return read.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\NotificationController::read
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
read.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::read
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
const readForm = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: read.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::read
* @see app/Http/Controllers/Employee/NotificationController.php:47
* @route '/employee/notifications/{notification}/read'
*/
readForm.post = (args: { notification: string | { id: string } } | [notification: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: read.url(args, options),
    method: 'post',
})

read.form = readForm

/**
* @see \App\Http\Controllers\Employee\NotificationController::readAll
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
export const readAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: readAll.url(options),
    method: 'post',
})

readAll.definition = {
    methods: ["post"],
    url: '/employee/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\NotificationController::readAll
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
readAll.url = (options?: RouteQueryOptions) => {
    return readAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\NotificationController::readAll
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
readAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: readAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::readAll
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
const readAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: readAll.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationController::readAll
* @see app/Http/Controllers/Employee/NotificationController.php:57
* @route '/employee/notifications/read-all'
*/
readAllForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: readAll.url(options),
    method: 'post',
})

readAll.form = readAllForm

const notifications = {
    index: Object.assign(index, index),
    read: Object.assign(read, read),
    readAll: Object.assign(readAll, readAll),
}

export default notifications