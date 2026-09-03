import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminAlertController::index
* @see app/Http/Controllers/Admin/AdminAlertController.php:40
* @route '/admin/alerts'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::index
* @see app/Http/Controllers/Admin/AdminAlertController.php:40
* @route '/admin/alerts'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::index
* @see app/Http/Controllers/Admin/AdminAlertController.php:40
* @route '/admin/alerts'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::index
* @see app/Http/Controllers/Admin/AdminAlertController.php:40
* @route '/admin/alerts'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::index
* @see app/Http/Controllers/Admin/AdminAlertController.php:40
* @route '/admin/alerts'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::index
* @see app/Http/Controllers/Admin/AdminAlertController.php:40
* @route '/admin/alerts'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::index
* @see app/Http/Controllers/Admin/AdminAlertController.php:40
* @route '/admin/alerts'
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
* @see \App\Http\Controllers\Admin\AdminAlertController::acknowledge
* @see app/Http/Controllers/Admin/AdminAlertController.php:82
* @route '/admin/alerts/{adminAlert}/acknowledge'
*/
export const acknowledge = (args: { adminAlert: number | { id: number } } | [adminAlert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledge.url(args, options),
    method: 'post',
})

acknowledge.definition = {
    methods: ["post"],
    url: '/admin/alerts/{adminAlert}/acknowledge',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::acknowledge
* @see app/Http/Controllers/Admin/AdminAlertController.php:82
* @route '/admin/alerts/{adminAlert}/acknowledge'
*/
acknowledge.url = (args: { adminAlert: number | { id: number } } | [adminAlert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { adminAlert: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { adminAlert: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            adminAlert: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        adminAlert: typeof args.adminAlert === 'object'
        ? args.adminAlert.id
        : args.adminAlert,
    }

    return acknowledge.definition.url
            .replace('{adminAlert}', parsedArgs.adminAlert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::acknowledge
* @see app/Http/Controllers/Admin/AdminAlertController.php:82
* @route '/admin/alerts/{adminAlert}/acknowledge'
*/
acknowledge.post = (args: { adminAlert: number | { id: number } } | [adminAlert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledge.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::acknowledge
* @see app/Http/Controllers/Admin/AdminAlertController.php:82
* @route '/admin/alerts/{adminAlert}/acknowledge'
*/
const acknowledgeForm = (args: { adminAlert: number | { id: number } } | [adminAlert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: acknowledge.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminAlertController::acknowledge
* @see app/Http/Controllers/Admin/AdminAlertController.php:82
* @route '/admin/alerts/{adminAlert}/acknowledge'
*/
acknowledgeForm.post = (args: { adminAlert: number | { id: number } } | [adminAlert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: acknowledge.url(args, options),
    method: 'post',
})

acknowledge.form = acknowledgeForm

const alerts = {
    index: Object.assign(index, index),
    acknowledge: Object.assign(acknowledge, acknowledge),
}

export default alerts