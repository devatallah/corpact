import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\CommunityController::index
* @see app/Http/Controllers/Admin/CommunityController.php:31
* @route '/admin/communities'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/communities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\CommunityController::index
* @see app/Http/Controllers/Admin/CommunityController.php:31
* @route '/admin/communities'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CommunityController::index
* @see app/Http/Controllers/Admin/CommunityController.php:31
* @route '/admin/communities'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CommunityController::index
* @see app/Http/Controllers/Admin/CommunityController.php:31
* @route '/admin/communities'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\CommunityController::index
* @see app/Http/Controllers/Admin/CommunityController.php:31
* @route '/admin/communities'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CommunityController::index
* @see app/Http/Controllers/Admin/CommunityController.php:31
* @route '/admin/communities'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\CommunityController::index
* @see app/Http/Controllers/Admin/CommunityController.php:31
* @route '/admin/communities'
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

const communities = {
    index: Object.assign(index, index),
}

export default communities