import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::index
* @see app/Http/Controllers/Admin/PermissionReviewController.php:44
* @route '/admin/security/permission-review'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/security/permission-review',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::index
* @see app/Http/Controllers/Admin/PermissionReviewController.php:44
* @route '/admin/security/permission-review'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::index
* @see app/Http/Controllers/Admin/PermissionReviewController.php:44
* @route '/admin/security/permission-review'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::index
* @see app/Http/Controllers/Admin/PermissionReviewController.php:44
* @route '/admin/security/permission-review'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::index
* @see app/Http/Controllers/Admin/PermissionReviewController.php:44
* @route '/admin/security/permission-review'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::index
* @see app/Http/Controllers/Admin/PermissionReviewController.php:44
* @route '/admin/security/permission-review'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::index
* @see app/Http/Controllers/Admin/PermissionReviewController.php:44
* @route '/admin/security/permission-review'
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
* @see \App\Http\Controllers\Admin\PermissionReviewController::store
* @see app/Http/Controllers/Admin/PermissionReviewController.php:130
* @route '/admin/security/permission-review'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/security/permission-review',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::store
* @see app/Http/Controllers/Admin/PermissionReviewController.php:130
* @route '/admin/security/permission-review'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::store
* @see app/Http/Controllers/Admin/PermissionReviewController.php:130
* @route '/admin/security/permission-review'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::store
* @see app/Http/Controllers/Admin/PermissionReviewController.php:130
* @route '/admin/security/permission-review'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PermissionReviewController::store
* @see app/Http/Controllers/Admin/PermissionReviewController.php:130
* @route '/admin/security/permission-review'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const permissionReview = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
}

export default permissionReview