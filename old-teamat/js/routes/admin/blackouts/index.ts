import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::index
* @see app/Http/Controllers/Admin/BlackoutDateController.php:34
* @route '/admin/blackouts'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/blackouts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::index
* @see app/Http/Controllers/Admin/BlackoutDateController.php:34
* @route '/admin/blackouts'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::index
* @see app/Http/Controllers/Admin/BlackoutDateController.php:34
* @route '/admin/blackouts'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::index
* @see app/Http/Controllers/Admin/BlackoutDateController.php:34
* @route '/admin/blackouts'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::index
* @see app/Http/Controllers/Admin/BlackoutDateController.php:34
* @route '/admin/blackouts'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::index
* @see app/Http/Controllers/Admin/BlackoutDateController.php:34
* @route '/admin/blackouts'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::index
* @see app/Http/Controllers/Admin/BlackoutDateController.php:34
* @route '/admin/blackouts'
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
* @see \App\Http\Controllers\Admin\BlackoutDateController::store
* @see app/Http/Controllers/Admin/BlackoutDateController.php:57
* @route '/admin/blackouts'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/blackouts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::store
* @see app/Http/Controllers/Admin/BlackoutDateController.php:57
* @route '/admin/blackouts'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::store
* @see app/Http/Controllers/Admin/BlackoutDateController.php:57
* @route '/admin/blackouts'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::store
* @see app/Http/Controllers/Admin/BlackoutDateController.php:57
* @route '/admin/blackouts'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::store
* @see app/Http/Controllers/Admin/BlackoutDateController.php:57
* @route '/admin/blackouts'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::update
* @see app/Http/Controllers/Admin/BlackoutDateController.php:80
* @route '/admin/blackouts/{blackout}'
*/
export const update = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/blackouts/{blackout}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::update
* @see app/Http/Controllers/Admin/BlackoutDateController.php:80
* @route '/admin/blackouts/{blackout}'
*/
update.url = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blackout: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { blackout: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            blackout: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        blackout: typeof args.blackout === 'object'
        ? args.blackout.id
        : args.blackout,
    }

    return update.definition.url
            .replace('{blackout}', parsedArgs.blackout.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::update
* @see app/Http/Controllers/Admin/BlackoutDateController.php:80
* @route '/admin/blackouts/{blackout}'
*/
update.put = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::update
* @see app/Http/Controllers/Admin/BlackoutDateController.php:80
* @route '/admin/blackouts/{blackout}'
*/
const updateForm = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::update
* @see app/Http/Controllers/Admin/BlackoutDateController.php:80
* @route '/admin/blackouts/{blackout}'
*/
updateForm.put = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\BlackoutDateController::destroy
* @see app/Http/Controllers/Admin/BlackoutDateController.php:93
* @route '/admin/blackouts/{blackout}'
*/
export const destroy = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/blackouts/{blackout}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::destroy
* @see app/Http/Controllers/Admin/BlackoutDateController.php:93
* @route '/admin/blackouts/{blackout}'
*/
destroy.url = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { blackout: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { blackout: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            blackout: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        blackout: typeof args.blackout === 'object'
        ? args.blackout.id
        : args.blackout,
    }

    return destroy.definition.url
            .replace('{blackout}', parsedArgs.blackout.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::destroy
* @see app/Http/Controllers/Admin/BlackoutDateController.php:93
* @route '/admin/blackouts/{blackout}'
*/
destroy.delete = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::destroy
* @see app/Http/Controllers/Admin/BlackoutDateController.php:93
* @route '/admin/blackouts/{blackout}'
*/
const destroyForm = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\BlackoutDateController::destroy
* @see app/Http/Controllers/Admin/BlackoutDateController.php:93
* @route '/admin/blackouts/{blackout}'
*/
destroyForm.delete = (args: { blackout: number | { id: number } } | [blackout: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const blackouts = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default blackouts