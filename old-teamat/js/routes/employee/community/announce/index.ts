import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\CommunityController::update
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
export const update = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/employee/community/{community}/announcement/{announcement}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::update
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
update.url = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            announcement: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        announcement: typeof args.announcement === 'object'
        ? args.announcement.id
        : args.announcement,
    }

    return update.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{announcement}', parsedArgs.announcement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::update
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
update.patch = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::update
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
const updateForm = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::update
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
updateForm.patch = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Employee\CommunityController::deleteMethod
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
export const deleteMethod = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/employee/community/{community}/announcement/{announcement}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteMethod
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
deleteMethod.url = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            announcement: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        announcement: typeof args.announcement === 'object'
        ? args.announcement.id
        : args.announcement,
    }

    return deleteMethod.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{announcement}', parsedArgs.announcement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteMethod
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
deleteMethod.delete = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteMethod
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
const deleteMethodForm = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteMethod
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
deleteMethodForm.delete = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteMethod.form = deleteMethodForm

const announce = {
    update: Object.assign(update, update),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default announce