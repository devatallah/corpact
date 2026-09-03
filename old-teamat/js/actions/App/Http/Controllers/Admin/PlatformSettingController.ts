import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::index
* @see app/Http/Controllers/Admin/PlatformSettingController.php:22
* @route '/admin/settings/platform'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/settings/platform',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::index
* @see app/Http/Controllers/Admin/PlatformSettingController.php:22
* @route '/admin/settings/platform'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::index
* @see app/Http/Controllers/Admin/PlatformSettingController.php:22
* @route '/admin/settings/platform'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::index
* @see app/Http/Controllers/Admin/PlatformSettingController.php:22
* @route '/admin/settings/platform'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::index
* @see app/Http/Controllers/Admin/PlatformSettingController.php:22
* @route '/admin/settings/platform'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::index
* @see app/Http/Controllers/Admin/PlatformSettingController.php:22
* @route '/admin/settings/platform'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::index
* @see app/Http/Controllers/Admin/PlatformSettingController.php:22
* @route '/admin/settings/platform'
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
* @see \App\Http\Controllers\Admin\PlatformSettingController::update
* @see app/Http/Controllers/Admin/PlatformSettingController.php:48
* @route '/admin/settings/platform'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/settings/platform',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::update
* @see app/Http/Controllers/Admin/PlatformSettingController.php:48
* @route '/admin/settings/platform'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::update
* @see app/Http/Controllers/Admin/PlatformSettingController.php:48
* @route '/admin/settings/platform'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::update
* @see app/Http/Controllers/Admin/PlatformSettingController.php:48
* @route '/admin/settings/platform'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PlatformSettingController::update
* @see app/Http/Controllers/Admin/PlatformSettingController.php:48
* @route '/admin/settings/platform'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const PlatformSettingController = { index, update }

export default PlatformSettingController