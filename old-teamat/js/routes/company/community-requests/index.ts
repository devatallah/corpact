import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\CommunityRequestController::index
* @see app/Http/Controllers/Company/CommunityRequestController.php:22
* @route '/company/community-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/community-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::index
* @see app/Http/Controllers/Company/CommunityRequestController.php:22
* @route '/company/community-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::index
* @see app/Http/Controllers/Company/CommunityRequestController.php:22
* @route '/company/community-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::index
* @see app/Http/Controllers/Company/CommunityRequestController.php:22
* @route '/company/community-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::index
* @see app/Http/Controllers/Company/CommunityRequestController.php:22
* @route '/company/community-requests'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::index
* @see app/Http/Controllers/Company/CommunityRequestController.php:22
* @route '/company/community-requests'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::index
* @see app/Http/Controllers/Company/CommunityRequestController.php:22
* @route '/company/community-requests'
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
* @see \App\Http\Controllers\Company\CommunityRequestController::approve
* @see app/Http/Controllers/Company/CommunityRequestController.php:56
* @route '/company/community-requests/{communityRequest}/approve'
*/
export const approve = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/company/community-requests/{communityRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::approve
* @see app/Http/Controllers/Company/CommunityRequestController.php:56
* @route '/company/community-requests/{communityRequest}/approve'
*/
approve.url = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { communityRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { communityRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            communityRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        communityRequest: typeof args.communityRequest === 'object'
        ? args.communityRequest.id
        : args.communityRequest,
    }

    return approve.definition.url
            .replace('{communityRequest}', parsedArgs.communityRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::approve
* @see app/Http/Controllers/Company/CommunityRequestController.php:56
* @route '/company/community-requests/{communityRequest}/approve'
*/
approve.post = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::approve
* @see app/Http/Controllers/Company/CommunityRequestController.php:56
* @route '/company/community-requests/{communityRequest}/approve'
*/
const approveForm = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::approve
* @see app/Http/Controllers/Company/CommunityRequestController.php:56
* @route '/company/community-requests/{communityRequest}/approve'
*/
approveForm.post = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::reject
* @see app/Http/Controllers/Company/CommunityRequestController.php:68
* @route '/company/community-requests/{communityRequest}/reject'
*/
export const reject = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/company/community-requests/{communityRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::reject
* @see app/Http/Controllers/Company/CommunityRequestController.php:68
* @route '/company/community-requests/{communityRequest}/reject'
*/
reject.url = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { communityRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { communityRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            communityRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        communityRequest: typeof args.communityRequest === 'object'
        ? args.communityRequest.id
        : args.communityRequest,
    }

    return reject.definition.url
            .replace('{communityRequest}', parsedArgs.communityRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::reject
* @see app/Http/Controllers/Company/CommunityRequestController.php:68
* @route '/company/community-requests/{communityRequest}/reject'
*/
reject.post = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::reject
* @see app/Http/Controllers/Company/CommunityRequestController.php:68
* @route '/company/community-requests/{communityRequest}/reject'
*/
const rejectForm = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\CommunityRequestController::reject
* @see app/Http/Controllers/Company/CommunityRequestController.php:68
* @route '/company/community-requests/{communityRequest}/reject'
*/
rejectForm.post = (args: { communityRequest: number | { id: number } } | [communityRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const communityRequests = {
    index: Object.assign(index, index),
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default communityRequests