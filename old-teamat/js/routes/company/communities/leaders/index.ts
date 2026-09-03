import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\CommunityController::assign
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
export const assign = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(args, options),
    method: 'post',
})

assign.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/leaders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::assign
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
assign.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return assign.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::assign
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
assign.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::assign
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
const assignForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assign.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::assign
* @see app/Http/Controllers/Company/CommunityController.php:146
* @route '/company/communities/{community}/leaders'
*/
assignForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: assign.url(args, options),
    method: 'post',
})

assign.form = assignForm

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
export const remove = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

remove.definition = {
    methods: ["delete"],
    url: '/company/communities/{community}/leaders/{employee}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
remove.url = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return remove.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
remove.delete = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
const removeForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:165
* @route '/company/communities/{community}/leaders/{employee}'
*/
removeForm.delete = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

remove.form = removeForm

/**
* @see \App\Http\Controllers\Company\CommunityController::primary
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
export const primary = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: primary.url(args, options),
    method: 'post',
})

primary.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/leaders/{employee}/primary',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::primary
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
primary.url = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return primary.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::primary
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
primary.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: primary.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::primary
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
const primaryForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: primary.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::primary
* @see app/Http/Controllers/Company/CommunityController.php:177
* @route '/company/communities/{community}/leaders/{employee}/primary'
*/
primaryForm.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: primary.url(args, options),
    method: 'post',
})

primary.form = primaryForm

const leaders = {
    assign: Object.assign(assign, assign),
    remove: Object.assign(remove, remove),
    primary: Object.assign(primary, primary),
}

export default leaders