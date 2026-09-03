import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import contract from './contract'
/**
* @see \App\Http\Controllers\Admin\CompanyController::index
* @see app/Http/Controllers/Admin/CompanyController.php:31
* @route '/admin/companies'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::index
* @see app/Http/Controllers/Admin/CompanyController.php:31
* @route '/admin/companies'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::index
* @see app/Http/Controllers/Admin/CompanyController.php:31
* @route '/admin/companies'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::index
* @see app/Http/Controllers/Admin/CompanyController.php:31
* @route '/admin/companies'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::index
* @see app/Http/Controllers/Admin/CompanyController.php:31
* @route '/admin/companies'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::index
* @see app/Http/Controllers/Admin/CompanyController.php:31
* @route '/admin/companies'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::index
* @see app/Http/Controllers/Admin/CompanyController.php:31
* @route '/admin/companies'
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
* @see \App\Http\Controllers\Admin\CompanyController::create
* @see app/Http/Controllers/Admin/CompanyController.php:49
* @route '/admin/companies/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/companies/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::create
* @see app/Http/Controllers/Admin/CompanyController.php:49
* @route '/admin/companies/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::create
* @see app/Http/Controllers/Admin/CompanyController.php:49
* @route '/admin/companies/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::create
* @see app/Http/Controllers/Admin/CompanyController.php:49
* @route '/admin/companies/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::create
* @see app/Http/Controllers/Admin/CompanyController.php:49
* @route '/admin/companies/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::create
* @see app/Http/Controllers/Admin/CompanyController.php:49
* @route '/admin/companies/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::create
* @see app/Http/Controllers/Admin/CompanyController.php:49
* @route '/admin/companies/create'
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
* @see \App\Http\Controllers\Admin\CompanyController::store
* @see app/Http/Controllers/Admin/CompanyController.php:57
* @route '/admin/companies'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/companies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::store
* @see app/Http/Controllers/Admin/CompanyController.php:57
* @route '/admin/companies'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::store
* @see app/Http/Controllers/Admin/CompanyController.php:57
* @route '/admin/companies'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::store
* @see app/Http/Controllers/Admin/CompanyController.php:57
* @route '/admin/companies'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::store
* @see app/Http/Controllers/Admin/CompanyController.php:57
* @route '/admin/companies'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\CompanyController::edit
* @see app/Http/Controllers/Admin/CompanyController.php:89
* @route '/admin/companies/{company}/edit'
*/
export const edit = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/companies/{company}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::edit
* @see app/Http/Controllers/Admin/CompanyController.php:89
* @route '/admin/companies/{company}/edit'
*/
edit.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { company: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: typeof args.company === 'object'
        ? args.company.id
        : args.company,
    }

    return edit.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::edit
* @see app/Http/Controllers/Admin/CompanyController.php:89
* @route '/admin/companies/{company}/edit'
*/
edit.get = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::edit
* @see app/Http/Controllers/Admin/CompanyController.php:89
* @route '/admin/companies/{company}/edit'
*/
edit.head = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::edit
* @see app/Http/Controllers/Admin/CompanyController.php:89
* @route '/admin/companies/{company}/edit'
*/
const editForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::edit
* @see app/Http/Controllers/Admin/CompanyController.php:89
* @route '/admin/companies/{company}/edit'
*/
editForm.get = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::edit
* @see app/Http/Controllers/Admin/CompanyController.php:89
* @route '/admin/companies/{company}/edit'
*/
editForm.head = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\CompanyController::update
* @see app/Http/Controllers/Admin/CompanyController.php:127
* @route '/admin/companies/{company}'
*/
export const update = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/companies/{company}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::update
* @see app/Http/Controllers/Admin/CompanyController.php:127
* @route '/admin/companies/{company}'
*/
update.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { company: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: typeof args.company === 'object'
        ? args.company.id
        : args.company,
    }

    return update.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::update
* @see app/Http/Controllers/Admin/CompanyController.php:127
* @route '/admin/companies/{company}'
*/
update.put = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::update
* @see app/Http/Controllers/Admin/CompanyController.php:127
* @route '/admin/companies/{company}'
*/
update.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::update
* @see app/Http/Controllers/Admin/CompanyController.php:127
* @route '/admin/companies/{company}'
*/
const updateForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::update
* @see app/Http/Controllers/Admin/CompanyController.php:127
* @route '/admin/companies/{company}'
*/
updateForm.put = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::update
* @see app/Http/Controllers/Admin/CompanyController.php:127
* @route '/admin/companies/{company}'
*/
updateForm.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\CompanyController::destroy
* @see app/Http/Controllers/Admin/CompanyController.php:188
* @route '/admin/companies/{company}'
*/
export const destroy = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/companies/{company}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::destroy
* @see app/Http/Controllers/Admin/CompanyController.php:188
* @route '/admin/companies/{company}'
*/
destroy.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { company: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: typeof args.company === 'object'
        ? args.company.id
        : args.company,
    }

    return destroy.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::destroy
* @see app/Http/Controllers/Admin/CompanyController.php:188
* @route '/admin/companies/{company}'
*/
destroy.delete = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::destroy
* @see app/Http/Controllers/Admin/CompanyController.php:188
* @route '/admin/companies/{company}'
*/
const destroyForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::destroy
* @see app/Http/Controllers/Admin/CompanyController.php:188
* @route '/admin/companies/{company}'
*/
destroyForm.delete = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\CompanyController::approve
* @see app/Http/Controllers/Admin/CompanyController.php:154
* @route '/admin/companies/{company}/approve'
*/
export const approve = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/companies/{company}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::approve
* @see app/Http/Controllers/Admin/CompanyController.php:154
* @route '/admin/companies/{company}/approve'
*/
approve.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { company: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: typeof args.company === 'object'
        ? args.company.id
        : args.company,
    }

    return approve.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::approve
* @see app/Http/Controllers/Admin/CompanyController.php:154
* @route '/admin/companies/{company}/approve'
*/
approve.post = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::approve
* @see app/Http/Controllers/Admin/CompanyController.php:154
* @route '/admin/companies/{company}/approve'
*/
const approveForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::approve
* @see app/Http/Controllers/Admin/CompanyController.php:154
* @route '/admin/companies/{company}/approve'
*/
approveForm.post = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Admin\CompanyController::reject
* @see app/Http/Controllers/Admin/CompanyController.php:164
* @route '/admin/companies/{company}/reject'
*/
export const reject = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/companies/{company}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::reject
* @see app/Http/Controllers/Admin/CompanyController.php:164
* @route '/admin/companies/{company}/reject'
*/
reject.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { company: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: typeof args.company === 'object'
        ? args.company.id
        : args.company,
    }

    return reject.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::reject
* @see app/Http/Controllers/Admin/CompanyController.php:164
* @route '/admin/companies/{company}/reject'
*/
reject.post = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::reject
* @see app/Http/Controllers/Admin/CompanyController.php:164
* @route '/admin/companies/{company}/reject'
*/
const rejectForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::reject
* @see app/Http/Controllers/Admin/CompanyController.php:164
* @route '/admin/companies/{company}/reject'
*/
rejectForm.post = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Admin\CompanyController::resetPassword
* @see app/Http/Controllers/Admin/CompanyController.php:174
* @route '/admin/companies/{company}/reset-password'
*/
export const resetPassword = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
})

resetPassword.definition = {
    methods: ["post"],
    url: '/admin/companies/{company}/reset-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\CompanyController::resetPassword
* @see app/Http/Controllers/Admin/CompanyController.php:174
* @route '/admin/companies/{company}/reset-password'
*/
resetPassword.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { company: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: typeof args.company === 'object'
        ? args.company.id
        : args.company,
    }

    return resetPassword.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyController::resetPassword
* @see app/Http/Controllers/Admin/CompanyController.php:174
* @route '/admin/companies/{company}/reset-password'
*/
resetPassword.post = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::resetPassword
* @see app/Http/Controllers/Admin/CompanyController.php:174
* @route '/admin/companies/{company}/reset-password'
*/
const resetPasswordForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resetPassword.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyController::resetPassword
* @see app/Http/Controllers/Admin/CompanyController.php:174
* @route '/admin/companies/{company}/reset-password'
*/
resetPasswordForm.post = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resetPassword.url(args, options),
    method: 'post',
})

resetPassword.form = resetPasswordForm

const companies = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
    resetPassword: Object.assign(resetPassword, resetPassword),
    contract: Object.assign(contract, contract),
}

export default companies