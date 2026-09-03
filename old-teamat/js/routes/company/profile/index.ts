import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\ProfileController::index
* @see app/Http/Controllers/Company/ProfileController.php:16
* @route '/company/profile'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\ProfileController::index
* @see app/Http/Controllers/Company/ProfileController.php:16
* @route '/company/profile'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\ProfileController::index
* @see app/Http/Controllers/Company/ProfileController.php:16
* @route '/company/profile'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ProfileController::index
* @see app/Http/Controllers/Company/ProfileController.php:16
* @route '/company/profile'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\ProfileController::index
* @see app/Http/Controllers/Company/ProfileController.php:16
* @route '/company/profile'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ProfileController::index
* @see app/Http/Controllers/Company/ProfileController.php:16
* @route '/company/profile'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\ProfileController::index
* @see app/Http/Controllers/Company/ProfileController.php:16
* @route '/company/profile'
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
* @see \App\Http\Controllers\Company\ProfileController::update
* @see app/Http/Controllers/Company/ProfileController.php:23
* @route '/company/profile'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/company/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Company\ProfileController::update
* @see app/Http/Controllers/Company/ProfileController.php:23
* @route '/company/profile'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\ProfileController::update
* @see app/Http/Controllers/Company/ProfileController.php:23
* @route '/company/profile'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Company\ProfileController::update
* @see app/Http/Controllers/Company/ProfileController.php:23
* @route '/company/profile'
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
* @see \App\Http\Controllers\Company\ProfileController::update
* @see app/Http/Controllers/Company/ProfileController.php:23
* @route '/company/profile'
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

const profile = {
    index: Object.assign(index, index),
    update: Object.assign(update, update),
}

export default profile