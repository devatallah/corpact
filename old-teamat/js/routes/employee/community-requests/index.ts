import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::index
* @see app/Http/Controllers/Employee/CommunityRequestController.php:24
* @route '/employee/community-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/community-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::index
* @see app/Http/Controllers/Employee/CommunityRequestController.php:24
* @route '/employee/community-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::index
* @see app/Http/Controllers/Employee/CommunityRequestController.php:24
* @route '/employee/community-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::index
* @see app/Http/Controllers/Employee/CommunityRequestController.php:24
* @route '/employee/community-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::index
* @see app/Http/Controllers/Employee/CommunityRequestController.php:24
* @route '/employee/community-requests'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::index
* @see app/Http/Controllers/Employee/CommunityRequestController.php:24
* @route '/employee/community-requests'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::index
* @see app/Http/Controllers/Employee/CommunityRequestController.php:24
* @route '/employee/community-requests'
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
* @see \App\Http\Controllers\Employee\CommunityRequestController::store
* @see app/Http/Controllers/Employee/CommunityRequestController.php:56
* @route '/employee/community-requests'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/community-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::store
* @see app/Http/Controllers/Employee/CommunityRequestController.php:56
* @route '/employee/community-requests'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::store
* @see app/Http/Controllers/Employee/CommunityRequestController.php:56
* @route '/employee/community-requests'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::store
* @see app/Http/Controllers/Employee/CommunityRequestController.php:56
* @route '/employee/community-requests'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityRequestController::store
* @see app/Http/Controllers/Employee/CommunityRequestController.php:56
* @route '/employee/community-requests'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const communityRequests = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
}

export default communityRequests