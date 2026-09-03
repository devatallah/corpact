import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\CommunityController::index
* @see app/Http/Controllers/Company/CommunityController.php:34
* @route '/company/communities'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/communities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::index
* @see app/Http/Controllers/Company/CommunityController.php:34
* @route '/company/communities'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::index
* @see app/Http/Controllers/Company/CommunityController.php:34
* @route '/company/communities'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::index
* @see app/Http/Controllers/Company/CommunityController.php:34
* @route '/company/communities'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::index
* @see app/Http/Controllers/Company/CommunityController.php:34
* @route '/company/communities'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::index
* @see app/Http/Controllers/Company/CommunityController.php:34
* @route '/company/communities'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::index
* @see app/Http/Controllers/Company/CommunityController.php:34
* @route '/company/communities'
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
* @see \App\Http\Controllers\Company\CommunityController::create
* @see app/Http/Controllers/Company/CommunityController.php:62
* @route '/company/communities/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/company/communities/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::create
* @see app/Http/Controllers/Company/CommunityController.php:62
* @route '/company/communities/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::create
* @see app/Http/Controllers/Company/CommunityController.php:62
* @route '/company/communities/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::create
* @see app/Http/Controllers/Company/CommunityController.php:62
* @route '/company/communities/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::create
* @see app/Http/Controllers/Company/CommunityController.php:62
* @route '/company/communities/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::create
* @see app/Http/Controllers/Company/CommunityController.php:62
* @route '/company/communities/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::create
* @see app/Http/Controllers/Company/CommunityController.php:62
* @route '/company/communities/create'
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
* @see \App\Http\Controllers\Company\CommunityController::store
* @see app/Http/Controllers/Company/CommunityController.php:75
* @route '/company/communities'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/company/communities',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::store
* @see app/Http/Controllers/Company/CommunityController.php:75
* @route '/company/communities'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::store
* @see app/Http/Controllers/Company/CommunityController.php:75
* @route '/company/communities'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::store
* @see app/Http/Controllers/Company/CommunityController.php:75
* @route '/company/communities'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::store
* @see app/Http/Controllers/Company/CommunityController.php:75
* @route '/company/communities'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Company\CommunityController::edit
* @see app/Http/Controllers/Company/CommunityController.php:92
* @route '/company/communities/{community}/edit'
*/
export const edit = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/company/communities/{community}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::edit
* @see app/Http/Controllers/Company/CommunityController.php:92
* @route '/company/communities/{community}/edit'
*/
edit.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return edit.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::edit
* @see app/Http/Controllers/Company/CommunityController.php:92
* @route '/company/communities/{community}/edit'
*/
edit.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::edit
* @see app/Http/Controllers/Company/CommunityController.php:92
* @route '/company/communities/{community}/edit'
*/
edit.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::edit
* @see app/Http/Controllers/Company/CommunityController.php:92
* @route '/company/communities/{community}/edit'
*/
const editForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::edit
* @see app/Http/Controllers/Company/CommunityController.php:92
* @route '/company/communities/{community}/edit'
*/
editForm.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::edit
* @see app/Http/Controllers/Company/CommunityController.php:92
* @route '/company/communities/{community}/edit'
*/
editForm.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Company\CommunityController::update
* @see app/Http/Controllers/Company/CommunityController.php:109
* @route '/company/communities/{community}'
*/
export const update = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/company/communities/{community}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::update
* @see app/Http/Controllers/Company/CommunityController.php:109
* @route '/company/communities/{community}'
*/
update.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return update.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::update
* @see app/Http/Controllers/Company/CommunityController.php:109
* @route '/company/communities/{community}'
*/
update.put = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::update
* @see app/Http/Controllers/Company/CommunityController.php:109
* @route '/company/communities/{community}'
*/
update.patch = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::update
* @see app/Http/Controllers/Company/CommunityController.php:109
* @route '/company/communities/{community}'
*/
const updateForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::update
* @see app/Http/Controllers/Company/CommunityController.php:109
* @route '/company/communities/{community}'
*/
updateForm.put = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::update
* @see app/Http/Controllers/Company/CommunityController.php:109
* @route '/company/communities/{community}'
*/
updateForm.patch = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Company\CommunityController::destroy
* @see app/Http/Controllers/Company/CommunityController.php:133
* @route '/company/communities/{community}'
*/
export const destroy = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/company/communities/{community}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::destroy
* @see app/Http/Controllers/Company/CommunityController.php:133
* @route '/company/communities/{community}'
*/
destroy.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return destroy.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::destroy
* @see app/Http/Controllers/Company/CommunityController.php:133
* @route '/company/communities/{community}'
*/
destroy.delete = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::destroy
* @see app/Http/Controllers/Company/CommunityController.php:133
* @route '/company/communities/{community}'
*/
const destroyForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::destroy
* @see app/Http/Controllers/Company/CommunityController.php:133
* @route '/company/communities/{community}'
*/
destroyForm.delete = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Company\CommunityController::assignLeader
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
export const assignLeader = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignLeader.url(args, options),
    method: 'post',
})

assignLeader.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/leaders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::assignLeader
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
assignLeader.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return assignLeader.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::assignLeader
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
assignLeader.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assignLeader.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::assignLeader
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
const assignLeaderForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assignLeader.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::assignLeader
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
assignLeaderForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assignLeader.url(args, options),
    method: 'post',
})

assignLeader.form = assignLeaderForm

/**
* @see \App\Http\Controllers\Company\CommunityController::removeLeader
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
export const removeLeader = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeLeader.url(args, options),
    method: 'delete',
})

removeLeader.definition = {
    methods: ["delete"],
    url: '/company/communities/{community}/leaders/{employee}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::removeLeader
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
removeLeader.url = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            employee: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return removeLeader.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::removeLeader
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
removeLeader.delete = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeLeader.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::removeLeader
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
const removeLeaderForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeLeader.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::removeLeader
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
removeLeaderForm.delete = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeLeader.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

removeLeader.form = removeLeaderForm

/**
* @see \App\Http\Controllers\Company\CommunityController::setPrimaryLeader
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
export const setPrimaryLeader = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPrimaryLeader.url(args, options),
    method: 'post',
})

setPrimaryLeader.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/leaders/{employee}/primary',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::setPrimaryLeader
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
setPrimaryLeader.url = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            employee: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return setPrimaryLeader.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::setPrimaryLeader
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
setPrimaryLeader.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setPrimaryLeader.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::setPrimaryLeader
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
const setPrimaryLeaderForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: setPrimaryLeader.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::setPrimaryLeader
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
setPrimaryLeaderForm.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: setPrimaryLeader.url(args, options),
    method: 'post',
})

setPrimaryLeader.form = setPrimaryLeaderForm

/**
* @see \App\Http\Controllers\Company\CommunityController::removeMember
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
export const removeMember = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

removeMember.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/members/{employee}/remove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::removeMember
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
removeMember.url = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            employee: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return removeMember.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::removeMember
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
removeMember.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::removeMember
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
const removeMemberForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::removeMember
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
removeMemberForm.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

removeMember.form = removeMemberForm

/**
* @see \App\Http\Controllers\Company\CommunityController::banMember
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
export const banMember = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: banMember.url(args, options),
    method: 'post',
})

banMember.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/members/{employee}/ban',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::banMember
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
banMember.url = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            employee: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return banMember.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::banMember
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
banMember.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: banMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::banMember
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
const banMemberForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: banMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::banMember
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
banMemberForm.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: banMember.url(args, options),
    method: 'post',
})

banMember.form = banMemberForm

const CommunityController = { index, create, store, edit, update, destroy, assignLeader, removeLeader, setPrimaryLeader, removeMember, banMember }

export default CommunityController