import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\StaffController::index
* @see app/Http/Controllers/Partner/StaffController.php:36
* @route '/partner/staff'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/partner/staff',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\StaffController::index
* @see app/Http/Controllers/Partner/StaffController.php:36
* @route '/partner/staff'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\StaffController::index
* @see app/Http/Controllers/Partner/StaffController.php:36
* @route '/partner/staff'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::index
* @see app/Http/Controllers/Partner/StaffController.php:36
* @route '/partner/staff'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::index
* @see app/Http/Controllers/Partner/StaffController.php:36
* @route '/partner/staff'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::index
* @see app/Http/Controllers/Partner/StaffController.php:36
* @route '/partner/staff'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::index
* @see app/Http/Controllers/Partner/StaffController.php:36
* @route '/partner/staff'
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
* @see \App\Http\Controllers\Partner\StaffController::store
* @see app/Http/Controllers/Partner/StaffController.php:76
* @route '/partner/staff'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/partner/staff',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\StaffController::store
* @see app/Http/Controllers/Partner/StaffController.php:76
* @route '/partner/staff'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\StaffController::store
* @see app/Http/Controllers/Partner/StaffController.php:76
* @route '/partner/staff'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::store
* @see app/Http/Controllers/Partner/StaffController.php:76
* @route '/partner/staff'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::store
* @see app/Http/Controllers/Partner/StaffController.php:76
* @route '/partner/staff'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Partner\StaffController::update
* @see app/Http/Controllers/Partner/StaffController.php:113
* @route '/partner/staff/{staff}'
*/
export const update = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/partner/staff/{staff}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Partner\StaffController::update
* @see app/Http/Controllers/Partner/StaffController.php:113
* @route '/partner/staff/{staff}'
*/
update.url = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { staff: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { staff: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            staff: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        staff: typeof args.staff === 'object'
        ? args.staff.id
        : args.staff,
    }

    return update.definition.url
            .replace('{staff}', parsedArgs.staff.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\StaffController::update
* @see app/Http/Controllers/Partner/StaffController.php:113
* @route '/partner/staff/{staff}'
*/
update.put = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::update
* @see app/Http/Controllers/Partner/StaffController.php:113
* @route '/partner/staff/{staff}'
*/
const updateForm = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::update
* @see app/Http/Controllers/Partner/StaffController.php:113
* @route '/partner/staff/{staff}'
*/
updateForm.put = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Partner\StaffController::destroy
* @see app/Http/Controllers/Partner/StaffController.php:155
* @route '/partner/staff/{staff}'
*/
export const destroy = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/partner/staff/{staff}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\StaffController::destroy
* @see app/Http/Controllers/Partner/StaffController.php:155
* @route '/partner/staff/{staff}'
*/
destroy.url = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { staff: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { staff: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            staff: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        staff: typeof args.staff === 'object'
        ? args.staff.id
        : args.staff,
    }

    return destroy.definition.url
            .replace('{staff}', parsedArgs.staff.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\StaffController::destroy
* @see app/Http/Controllers/Partner/StaffController.php:155
* @route '/partner/staff/{staff}'
*/
destroy.delete = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::destroy
* @see app/Http/Controllers/Partner/StaffController.php:155
* @route '/partner/staff/{staff}'
*/
const destroyForm = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\StaffController::destroy
* @see app/Http/Controllers/Partner/StaffController.php:155
* @route '/partner/staff/{staff}'
*/
destroyForm.delete = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const StaffController = { index, store, update, destroy }

export default StaffController