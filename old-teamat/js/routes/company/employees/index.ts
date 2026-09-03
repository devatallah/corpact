import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import importMethod from './import'
/**
* @see \App\Http\Controllers\Company\EmployeeController::index
* @see app/Http/Controllers/Company/EmployeeController.php:30
* @route '/company/employees'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EmployeeController::index
* @see app/Http/Controllers/Company/EmployeeController.php:30
* @route '/company/employees'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeController::index
* @see app/Http/Controllers/Company/EmployeeController.php:30
* @route '/company/employees'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::index
* @see app/Http/Controllers/Company/EmployeeController.php:30
* @route '/company/employees'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::index
* @see app/Http/Controllers/Company/EmployeeController.php:30
* @route '/company/employees'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::index
* @see app/Http/Controllers/Company/EmployeeController.php:30
* @route '/company/employees'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::index
* @see app/Http/Controllers/Company/EmployeeController.php:30
* @route '/company/employees'
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
* @see \App\Http\Controllers\Company\EmployeeController::create
* @see app/Http/Controllers/Company/EmployeeController.php:61
* @route '/company/employees/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/company/employees/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EmployeeController::create
* @see app/Http/Controllers/Company/EmployeeController.php:61
* @route '/company/employees/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeController::create
* @see app/Http/Controllers/Company/EmployeeController.php:61
* @route '/company/employees/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::create
* @see app/Http/Controllers/Company/EmployeeController.php:61
* @route '/company/employees/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::create
* @see app/Http/Controllers/Company/EmployeeController.php:61
* @route '/company/employees/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::create
* @see app/Http/Controllers/Company/EmployeeController.php:61
* @route '/company/employees/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::create
* @see app/Http/Controllers/Company/EmployeeController.php:61
* @route '/company/employees/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Company\EmployeeController::store
* @see app/Http/Controllers/Company/EmployeeController.php:69
* @route '/company/employees'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/company/employees',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\EmployeeController::store
* @see app/Http/Controllers/Company/EmployeeController.php:69
* @route '/company/employees'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeController::store
* @see app/Http/Controllers/Company/EmployeeController.php:69
* @route '/company/employees'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::store
* @see app/Http/Controllers/Company/EmployeeController.php:69
* @route '/company/employees'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::store
* @see app/Http/Controllers/Company/EmployeeController.php:69
* @route '/company/employees'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Company\EmployeeController::edit
* @see app/Http/Controllers/Company/EmployeeController.php:90
* @route '/company/employees/{employee}/edit'
*/
export const edit = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/company/employees/{employee}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EmployeeController::edit
* @see app/Http/Controllers/Company/EmployeeController.php:90
* @route '/company/employees/{employee}/edit'
*/
edit.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employee: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employee: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return edit.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeController::edit
* @see app/Http/Controllers/Company/EmployeeController.php:90
* @route '/company/employees/{employee}/edit'
*/
edit.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::edit
* @see app/Http/Controllers/Company/EmployeeController.php:90
* @route '/company/employees/{employee}/edit'
*/
edit.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::edit
* @see app/Http/Controllers/Company/EmployeeController.php:90
* @route '/company/employees/{employee}/edit'
*/
const editForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::edit
* @see app/Http/Controllers/Company/EmployeeController.php:90
* @route '/company/employees/{employee}/edit'
*/
editForm.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::edit
* @see app/Http/Controllers/Company/EmployeeController.php:90
* @route '/company/employees/{employee}/edit'
*/
editForm.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Company\EmployeeController::update
* @see app/Http/Controllers/Company/EmployeeController.php:104
* @route '/company/employees/{employee}'
*/
export const update = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/company/employees/{employee}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Company\EmployeeController::update
* @see app/Http/Controllers/Company/EmployeeController.php:104
* @route '/company/employees/{employee}'
*/
update.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employee: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employee: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return update.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeController::update
* @see app/Http/Controllers/Company/EmployeeController.php:104
* @route '/company/employees/{employee}'
*/
update.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::update
* @see app/Http/Controllers/Company/EmployeeController.php:104
* @route '/company/employees/{employee}'
*/
update.patch = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::update
* @see app/Http/Controllers/Company/EmployeeController.php:104
* @route '/company/employees/{employee}'
*/
const updateForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::update
* @see app/Http/Controllers/Company/EmployeeController.php:104
* @route '/company/employees/{employee}'
*/
updateForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::update
* @see app/Http/Controllers/Company/EmployeeController.php:104
* @route '/company/employees/{employee}'
*/
updateForm.patch = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Company\EmployeeController::destroy
* @see app/Http/Controllers/Company/EmployeeController.php:143
* @route '/company/employees/{employee}'
*/
export const destroy = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/company/employees/{employee}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Company\EmployeeController::destroy
* @see app/Http/Controllers/Company/EmployeeController.php:143
* @route '/company/employees/{employee}'
*/
destroy.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employee: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employee: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return destroy.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeController::destroy
* @see app/Http/Controllers/Company/EmployeeController.php:143
* @route '/company/employees/{employee}'
*/
destroy.delete = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::destroy
* @see app/Http/Controllers/Company/EmployeeController.php:143
* @route '/company/employees/{employee}'
*/
const destroyForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::destroy
* @see app/Http/Controllers/Company/EmployeeController.php:143
* @route '/company/employees/{employee}'
*/
destroyForm.delete = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Company\EmployeeController::search
* @see app/Http/Controllers/Company/EmployeeController.php:121
* @route '/company/employees/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/company/employees/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EmployeeController::search
* @see app/Http/Controllers/Company/EmployeeController.php:121
* @route '/company/employees/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeController::search
* @see app/Http/Controllers/Company/EmployeeController.php:121
* @route '/company/employees/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::search
* @see app/Http/Controllers/Company/EmployeeController.php:121
* @route '/company/employees/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::search
* @see app/Http/Controllers/Company/EmployeeController.php:121
* @route '/company/employees/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::search
* @see app/Http/Controllers/Company/EmployeeController.php:121
* @route '/company/employees/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeController::search
* @see app/Http/Controllers/Company/EmployeeController.php:121
* @route '/company/employees/search'
*/
searchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

search.form = searchForm

const employees = {
    import: Object.assign(importMethod, importMethod),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    search: Object.assign(search, search),
}

export default employees