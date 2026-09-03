import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SupportMessageController::index
* @see app/Http/Controllers/Admin/SupportMessageController.php:30
* @route '/admin/support'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/support',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::index
* @see app/Http/Controllers/Admin/SupportMessageController.php:30
* @route '/admin/support'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::index
* @see app/Http/Controllers/Admin/SupportMessageController.php:30
* @route '/admin/support'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::index
* @see app/Http/Controllers/Admin/SupportMessageController.php:30
* @route '/admin/support'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::index
* @see app/Http/Controllers/Admin/SupportMessageController.php:30
* @route '/admin/support'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::index
* @see app/Http/Controllers/Admin/SupportMessageController.php:30
* @route '/admin/support'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::index
* @see app/Http/Controllers/Admin/SupportMessageController.php:30
* @route '/admin/support'
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
* @see \App\Http\Controllers\Admin\SupportMessageController::update
* @see app/Http/Controllers/Admin/SupportMessageController.php:70
* @route '/admin/support/{supportMessage}'
*/
export const update = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/support/{supportMessage}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::update
* @see app/Http/Controllers/Admin/SupportMessageController.php:70
* @route '/admin/support/{supportMessage}'
*/
update.url = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { supportMessage: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { supportMessage: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            supportMessage: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        supportMessage: typeof args.supportMessage === 'object'
        ? args.supportMessage.id
        : args.supportMessage,
    }

    return update.definition.url
            .replace('{supportMessage}', parsedArgs.supportMessage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::update
* @see app/Http/Controllers/Admin/SupportMessageController.php:70
* @route '/admin/support/{supportMessage}'
*/
update.patch = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::update
* @see app/Http/Controllers/Admin/SupportMessageController.php:70
* @route '/admin/support/{supportMessage}'
*/
const updateForm = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::update
* @see app/Http/Controllers/Admin/SupportMessageController.php:70
* @route '/admin/support/{supportMessage}'
*/
updateForm.patch = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::destroy
* @see app/Http/Controllers/Admin/SupportMessageController.php:81
* @route '/admin/support/{supportMessage}'
*/
export const destroy = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/support/{supportMessage}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::destroy
* @see app/Http/Controllers/Admin/SupportMessageController.php:81
* @route '/admin/support/{supportMessage}'
*/
destroy.url = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { supportMessage: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { supportMessage: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            supportMessage: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        supportMessage: typeof args.supportMessage === 'object'
        ? args.supportMessage.id
        : args.supportMessage,
    }

    return destroy.definition.url
            .replace('{supportMessage}', parsedArgs.supportMessage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::destroy
* @see app/Http/Controllers/Admin/SupportMessageController.php:81
* @route '/admin/support/{supportMessage}'
*/
destroy.delete = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::destroy
* @see app/Http/Controllers/Admin/SupportMessageController.php:81
* @route '/admin/support/{supportMessage}'
*/
const destroyForm = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SupportMessageController::destroy
* @see app/Http/Controllers/Admin/SupportMessageController.php:81
* @route '/admin/support/{supportMessage}'
*/
destroyForm.delete = (args: { supportMessage: number | { id: number } } | [supportMessage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const support = {
    index: Object.assign(index, index),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default support