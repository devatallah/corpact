import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\BranchController::index
* @see app/Http/Controllers/Partner/BranchController.php:38
* @route '/partner/branches'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/partner/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::index
* @see app/Http/Controllers/Partner/BranchController.php:38
* @route '/partner/branches'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::index
* @see app/Http/Controllers/Partner/BranchController.php:38
* @route '/partner/branches'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::index
* @see app/Http/Controllers/Partner/BranchController.php:38
* @route '/partner/branches'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::index
* @see app/Http/Controllers/Partner/BranchController.php:38
* @route '/partner/branches'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::index
* @see app/Http/Controllers/Partner/BranchController.php:38
* @route '/partner/branches'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::index
* @see app/Http/Controllers/Partner/BranchController.php:38
* @route '/partner/branches'
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
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:76
* @route '/partner/branches'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/partner/branches',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:76
* @route '/partner/branches'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:76
* @route '/partner/branches'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:76
* @route '/partner/branches'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:76
* @route '/partner/branches'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:85
* @route '/partner/branches/{branch}'
*/
export const update = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/partner/branches/{branch}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:85
* @route '/partner/branches/{branch}'
*/
update.url = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { branch: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            branch: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        branch: typeof args.branch === 'object'
        ? args.branch.id
        : args.branch,
    }

    return update.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:85
* @route '/partner/branches/{branch}'
*/
update.put = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:85
* @route '/partner/branches/{branch}'
*/
const updateForm = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:85
* @route '/partner/branches/{branch}'
*/
updateForm.put = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:94
* @route '/partner/branches/{branch}'
*/
export const destroy = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/partner/branches/{branch}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:94
* @route '/partner/branches/{branch}'
*/
destroy.url = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { branch: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            branch: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        branch: typeof args.branch === 'object'
        ? args.branch.id
        : args.branch,
    }

    return destroy.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:94
* @route '/partner/branches/{branch}'
*/
destroy.delete = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:94
* @route '/partner/branches/{branch}'
*/
const destroyForm = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:94
* @route '/partner/branches/{branch}'
*/
destroyForm.delete = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Partner\BranchController::storeUnit
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
export const storeUnit = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUnit.url(args, options),
    method: 'post',
})

storeUnit.definition = {
    methods: ["post"],
    url: '/partner/branches/{branch}/units',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::storeUnit
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
storeUnit.url = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { branch: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            branch: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        branch: typeof args.branch === 'object'
        ? args.branch.id
        : args.branch,
    }

    return storeUnit.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::storeUnit
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
storeUnit.post = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUnit.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::storeUnit
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
const storeUnitForm = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeUnit.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::storeUnit
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
storeUnitForm.post = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeUnit.url(args, options),
    method: 'post',
})

storeUnit.form = storeUnitForm

/**
* @see \App\Http\Controllers\Partner\BranchController::updateUnit
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
export const updateUnit = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUnit.url(args, options),
    method: 'put',
})

updateUnit.definition = {
    methods: ["put"],
    url: '/partner/units/{unit}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::updateUnit
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
updateUnit.url = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { unit: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { unit: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            unit: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        unit: typeof args.unit === 'object'
        ? args.unit.id
        : args.unit,
    }

    return updateUnit.definition.url
            .replace('{unit}', parsedArgs.unit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::updateUnit
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
updateUnit.put = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUnit.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::updateUnit
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
const updateUnitForm = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateUnit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::updateUnit
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
updateUnitForm.put = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateUnit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateUnit.form = updateUnitForm

/**
* @see \App\Http\Controllers\Partner\BranchController::destroyUnit
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
export const destroyUnit = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyUnit.url(args, options),
    method: 'delete',
})

destroyUnit.definition = {
    methods: ["delete"],
    url: '/partner/units/{unit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::destroyUnit
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
destroyUnit.url = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { unit: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { unit: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            unit: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        unit: typeof args.unit === 'object'
        ? args.unit.id
        : args.unit,
    }

    return destroyUnit.definition.url
            .replace('{unit}', parsedArgs.unit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::destroyUnit
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
destroyUnit.delete = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyUnit.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::destroyUnit
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
const destroyUnitForm = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyUnit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::destroyUnit
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
destroyUnitForm.delete = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyUnit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyUnit.form = destroyUnitForm

const BranchController = { index, store, update, destroy, storeUnit, updateUnit, destroyUnit }

export default BranchController