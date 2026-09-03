import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
export const remove = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remove.url(args, options),
    method: 'post',
})

remove.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/members/{employee}/remove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
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
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
remove.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remove.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
const removeForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::remove
* @see app/Http/Controllers/Company/CommunityController.php:189
* @route '/company/communities/{community}/members/{employee}/remove'
*/
removeForm.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, options),
    method: 'post',
})

remove.form = removeForm

/**
* @see \App\Http\Controllers\Company\CommunityController::ban
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
export const ban = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ban.url(args, options),
    method: 'post',
})

ban.definition = {
    methods: ["post"],
    url: '/company/communities/{community}/members/{employee}/ban',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityController::ban
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
ban.url = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return ban.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityController::ban
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
ban.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ban.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::ban
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
const banForm = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ban.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityController::ban
* @see app/Http/Controllers/Company/CommunityController.php:211
* @route '/company/communities/{community}/members/{employee}/ban'
*/
banForm.post = (args: { community: number | { id: number }, employee: number | { id: number } } | [community: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ban.url(args, options),
    method: 'post',
})

ban.form = banForm

const members = {
    remove: Object.assign(remove, remove),
    ban: Object.assign(ban, ban),
}

export default members