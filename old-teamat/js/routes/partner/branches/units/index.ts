import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
export const store = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/partner/branches/{branch}/units',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
store.url = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
store.post = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
const storeForm = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\BranchController::store
* @see app/Http/Controllers/Partner/BranchController.php:103
* @route '/partner/branches/{branch}/units'
*/
storeForm.post = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const units = {
    store: Object.assign(store, store),
}

export default units