import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import invitations from './invitations'
import otp from './otp'
/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/support-console',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::index
* @see app/Http/Controllers/Admin/SupportConsoleController.php:43
* @route '/admin/support-console'
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
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
export const event = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: event.url(args, options),
    method: 'get',
})

event.definition = {
    methods: ["get","head"],
    url: '/admin/support-console/events/{event}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
event.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { event: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { event: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            event: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return event.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
event.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: event.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
event.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: event.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
const eventForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: event.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
eventForm.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: event.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportConsoleController::event
* @see app/Http/Controllers/Admin/SupportConsoleController.php:141
* @route '/admin/support-console/events/{event}'
*/
eventForm.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: event.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

event.form = eventForm

const supportConsole = {
    index: Object.assign(index, index),
    event: Object.assign(event, event),
    invitations: Object.assign(invitations, invitations),
    otp: Object.assign(otp, otp),
}

export default supportConsole