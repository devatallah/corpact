import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\CommunityController::remove
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
export const remove = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remove.url(args, options),
    method: 'post',
})

remove.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/members/{member}/remove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::remove
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
remove.url = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return remove.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::remove
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
remove.post = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: remove.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::remove
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
const removeForm = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::remove
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
removeForm.post = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: remove.url(args, options),
    method: 'post',
})

remove.form = removeForm

const members = {
    remove: Object.assign(remove, remove),
}

export default members