import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::index
* @see app/Http/Controllers/Employee/PreferredProviderController.php:27
* @route '/employee/communities/{community}/preferred-providers'
*/
export const index = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/communities/{community}/preferred-providers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::index
* @see app/Http/Controllers/Employee/PreferredProviderController.php:27
* @route '/employee/communities/{community}/preferred-providers'
*/
index.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::index
* @see app/Http/Controllers/Employee/PreferredProviderController.php:27
* @route '/employee/communities/{community}/preferred-providers'
*/
index.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::index
* @see app/Http/Controllers/Employee/PreferredProviderController.php:27
* @route '/employee/communities/{community}/preferred-providers'
*/
index.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::index
* @see app/Http/Controllers/Employee/PreferredProviderController.php:27
* @route '/employee/communities/{community}/preferred-providers'
*/
const indexForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::index
* @see app/Http/Controllers/Employee/PreferredProviderController.php:27
* @route '/employee/communities/{community}/preferred-providers'
*/
indexForm.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::index
* @see app/Http/Controllers/Employee/PreferredProviderController.php:27
* @route '/employee/communities/{community}/preferred-providers'
*/
indexForm.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::store
* @see app/Http/Controllers/Employee/PreferredProviderController.php:77
* @route '/employee/communities/{community}/preferred-providers'
*/
export const store = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/communities/{community}/preferred-providers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::store
* @see app/Http/Controllers/Employee/PreferredProviderController.php:77
* @route '/employee/communities/{community}/preferred-providers'
*/
store.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::store
* @see app/Http/Controllers/Employee/PreferredProviderController.php:77
* @route '/employee/communities/{community}/preferred-providers'
*/
store.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::store
* @see app/Http/Controllers/Employee/PreferredProviderController.php:77
* @route '/employee/communities/{community}/preferred-providers'
*/
const storeForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::store
* @see app/Http/Controllers/Employee/PreferredProviderController.php:77
* @route '/employee/communities/{community}/preferred-providers'
*/
storeForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::destroy
* @see app/Http/Controllers/Employee/PreferredProviderController.php:107
* @route '/employee/communities/{community}/preferred-providers/{partner}'
*/
export const destroy = (args: { community: number | { id: number }, partner: number | { id: number } } | [community: number | { id: number }, partner: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/employee/communities/{community}/preferred-providers/{partner}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::destroy
* @see app/Http/Controllers/Employee/PreferredProviderController.php:107
* @route '/employee/communities/{community}/preferred-providers/{partner}'
*/
destroy.url = (args: { community: number | { id: number }, partner: number | { id: number } } | [community: number | { id: number }, partner: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            partner: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        partner: typeof args.partner === 'object'
        ? args.partner.id
        : args.partner,
    }

    return destroy.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{partner}', parsedArgs.partner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::destroy
* @see app/Http/Controllers/Employee/PreferredProviderController.php:107
* @route '/employee/communities/{community}/preferred-providers/{partner}'
*/
destroy.delete = (args: { community: number | { id: number }, partner: number | { id: number } } | [community: number | { id: number }, partner: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::destroy
* @see app/Http/Controllers/Employee/PreferredProviderController.php:107
* @route '/employee/communities/{community}/preferred-providers/{partner}'
*/
const destroyForm = (args: { community: number | { id: number }, partner: number | { id: number } } | [community: number | { id: number }, partner: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\PreferredProviderController::destroy
* @see app/Http/Controllers/Employee/PreferredProviderController.php:107
* @route '/employee/communities/{community}/preferred-providers/{partner}'
*/
destroyForm.delete = (args: { community: number | { id: number }, partner: number | { id: number } } | [community: number | { id: number }, partner: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const PreferredProviderController = { index, store, destroy }

export default PreferredProviderController