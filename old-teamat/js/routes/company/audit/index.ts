import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\AuditLogController::index
* @see app/Http/Controllers/Company/AuditLogController.php:78
* @route '/company/audit'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/audit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\AuditLogController::index
* @see app/Http/Controllers/Company/AuditLogController.php:78
* @route '/company/audit'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\AuditLogController::index
* @see app/Http/Controllers/Company/AuditLogController.php:78
* @route '/company/audit'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\AuditLogController::index
* @see app/Http/Controllers/Company/AuditLogController.php:78
* @route '/company/audit'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\AuditLogController::index
* @see app/Http/Controllers/Company/AuditLogController.php:78
* @route '/company/audit'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\AuditLogController::index
* @see app/Http/Controllers/Company/AuditLogController.php:78
* @route '/company/audit'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\AuditLogController::index
* @see app/Http/Controllers/Company/AuditLogController.php:78
* @route '/company/audit'
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

const audit = {
    index: Object.assign(index, index),
}

export default audit