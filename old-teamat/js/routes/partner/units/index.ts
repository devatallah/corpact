import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
export const update = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/partner/units/{unit}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
update.url = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{unit}', parsedArgs.unit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
update.put = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::update
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
const updateForm = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Partner/BranchController.php:114
* @route '/partner/units/{unit}'
*/
updateForm.put = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
export const destroy = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/partner/units/{unit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
destroy.url = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{unit}', parsedArgs.unit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
destroy.delete = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::destroy
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
const destroyForm = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Partner/BranchController.php:146
* @route '/partner/units/{unit}'
*/
destroyForm.delete = (args: { unit: number | { id: number } } | [unit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const units = {
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default units