import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\DepartmentController::index
* @see app/Http/Controllers/Company/DepartmentController.php:29
* @route '/company/departments'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/departments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\DepartmentController::index
* @see app/Http/Controllers/Company/DepartmentController.php:29
* @route '/company/departments'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\DepartmentController::index
* @see app/Http/Controllers/Company/DepartmentController.php:29
* @route '/company/departments'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::index
* @see app/Http/Controllers/Company/DepartmentController.php:29
* @route '/company/departments'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::index
* @see app/Http/Controllers/Company/DepartmentController.php:29
* @route '/company/departments'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::index
* @see app/Http/Controllers/Company/DepartmentController.php:29
* @route '/company/departments'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::index
* @see app/Http/Controllers/Company/DepartmentController.php:29
* @route '/company/departments'
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
* @see \App\Http\Controllers\Company\DepartmentController::store
* @see app/Http/Controllers/Company/DepartmentController.php:56
* @route '/company/departments'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/company/departments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\DepartmentController::store
* @see app/Http/Controllers/Company/DepartmentController.php:56
* @route '/company/departments'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\DepartmentController::store
* @see app/Http/Controllers/Company/DepartmentController.php:56
* @route '/company/departments'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::store
* @see app/Http/Controllers/Company/DepartmentController.php:56
* @route '/company/departments'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::store
* @see app/Http/Controllers/Company/DepartmentController.php:56
* @route '/company/departments'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Company\DepartmentController::update
* @see app/Http/Controllers/Company/DepartmentController.php:73
* @route '/company/departments/{department}'
*/
export const update = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/company/departments/{department}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Company\DepartmentController::update
* @see app/Http/Controllers/Company/DepartmentController.php:73
* @route '/company/departments/{department}'
*/
update.url = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { department: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { department: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            department: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        department: typeof args.department === 'object'
        ? args.department.id
        : args.department,
    }

    return update.definition.url
            .replace('{department}', parsedArgs.department.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\DepartmentController::update
* @see app/Http/Controllers/Company/DepartmentController.php:73
* @route '/company/departments/{department}'
*/
update.put = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::update
* @see app/Http/Controllers/Company/DepartmentController.php:73
* @route '/company/departments/{department}'
*/
update.patch = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::update
* @see app/Http/Controllers/Company/DepartmentController.php:73
* @route '/company/departments/{department}'
*/
const updateForm = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::update
* @see app/Http/Controllers/Company/DepartmentController.php:73
* @route '/company/departments/{department}'
*/
updateForm.put = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::update
* @see app/Http/Controllers/Company/DepartmentController.php:73
* @route '/company/departments/{department}'
*/
updateForm.patch = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Company\DepartmentController::destroy
* @see app/Http/Controllers/Company/DepartmentController.php:92
* @route '/company/departments/{department}'
*/
export const destroy = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/company/departments/{department}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Company\DepartmentController::destroy
* @see app/Http/Controllers/Company/DepartmentController.php:92
* @route '/company/departments/{department}'
*/
destroy.url = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { department: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { department: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            department: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        department: typeof args.department === 'object'
        ? args.department.id
        : args.department,
    }

    return destroy.definition.url
            .replace('{department}', parsedArgs.department.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\DepartmentController::destroy
* @see app/Http/Controllers/Company/DepartmentController.php:92
* @route '/company/departments/{department}'
*/
destroy.delete = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::destroy
* @see app/Http/Controllers/Company/DepartmentController.php:92
* @route '/company/departments/{department}'
*/
const destroyForm = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\DepartmentController::destroy
* @see app/Http/Controllers/Company/DepartmentController.php:92
* @route '/company/departments/{department}'
*/
destroyForm.delete = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const departments = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default departments