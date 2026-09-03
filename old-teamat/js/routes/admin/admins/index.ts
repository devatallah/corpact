import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:49
* @route '/admin/admins'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/admins',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:49
* @route '/admin/admins'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:49
* @route '/admin/admins'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:49
* @route '/admin/admins'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:49
* @route '/admin/admins'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:49
* @route '/admin/admins'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::index
* @see app/Http/Controllers/Admin/AdminController.php:49
* @route '/admin/admins'
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
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:92
* @route '/admin/admins'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/admins',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:92
* @route '/admin/admins'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:92
* @route '/admin/admins'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:92
* @route '/admin/admins'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::store
* @see app/Http/Controllers/Admin/AdminController.php:92
* @route '/admin/admins'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:122
* @route '/admin/admins/{admin}'
*/
export const update = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/admins/{admin}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:122
* @route '/admin/admins/{admin}'
*/
update.url = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { admin: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { admin: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            admin: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        admin: typeof args.admin === 'object'
        ? args.admin.id
        : args.admin,
    }

    return update.definition.url
            .replace('{admin}', parsedArgs.admin.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:122
* @route '/admin/admins/{admin}'
*/
update.put = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:122
* @route '/admin/admins/{admin}'
*/
const updateForm = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::update
* @see app/Http/Controllers/Admin/AdminController.php:122
* @route '/admin/admins/{admin}'
*/
updateForm.put = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\AdminController::resetPassword
* @see app/Http/Controllers/Admin/AdminController.php:173
* @route '/admin/admins/{admin}/reset-password'
*/
export const resetPassword = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
})

resetPassword.definition = {
    methods: ["post"],
    url: '/admin/admins/{admin}/reset-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::resetPassword
* @see app/Http/Controllers/Admin/AdminController.php:173
* @route '/admin/admins/{admin}/reset-password'
*/
resetPassword.url = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { admin: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { admin: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            admin: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        admin: typeof args.admin === 'object'
        ? args.admin.id
        : args.admin,
    }

    return resetPassword.definition.url
            .replace('{admin}', parsedArgs.admin.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::resetPassword
* @see app/Http/Controllers/Admin/AdminController.php:173
* @route '/admin/admins/{admin}/reset-password'
*/
resetPassword.post = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::resetPassword
* @see app/Http/Controllers/Admin/AdminController.php:173
* @route '/admin/admins/{admin}/reset-password'
*/
const resetPasswordForm = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resetPassword.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::resetPassword
* @see app/Http/Controllers/Admin/AdminController.php:173
* @route '/admin/admins/{admin}/reset-password'
*/
resetPasswordForm.post = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resetPassword.url(args, options),
    method: 'post',
})

resetPassword.form = resetPasswordForm

/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
* @see app/Http/Controllers/Admin/AdminController.php:189
* @route '/admin/admins/{admin}'
*/
export const destroy = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/admins/{admin}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
* @see app/Http/Controllers/Admin/AdminController.php:189
* @route '/admin/admins/{admin}'
*/
destroy.url = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { admin: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { admin: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            admin: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        admin: typeof args.admin === 'object'
        ? args.admin.id
        : args.admin,
    }

    return destroy.definition.url
            .replace('{admin}', parsedArgs.admin.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
* @see app/Http/Controllers/Admin/AdminController.php:189
* @route '/admin/admins/{admin}'
*/
destroy.delete = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
* @see app/Http/Controllers/Admin/AdminController.php:189
* @route '/admin/admins/{admin}'
*/
const destroyForm = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
* @see app/Http/Controllers/Admin/AdminController.php:189
* @route '/admin/admins/{admin}'
*/
destroyForm.delete = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const admins = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    resetPassword: Object.assign(resetPassword, resetPassword),
    destroy: Object.assign(destroy, destroy),
}

export default admins