import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\BankAccountController::edit
* @see app/Http/Controllers/Partner/BankAccountController.php:21
* @route '/partner/bank'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/partner/bank',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\BankAccountController::edit
* @see app/Http/Controllers/Partner/BankAccountController.php:21
* @route '/partner/bank'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BankAccountController::edit
* @see app/Http/Controllers/Partner/BankAccountController.php:21
* @route '/partner/bank'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\BankAccountController::edit
* @see app/Http/Controllers/Partner/BankAccountController.php:21
* @route '/partner/bank'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\BankAccountController::edit
* @see app/Http/Controllers/Partner/BankAccountController.php:21
* @route '/partner/bank'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\BankAccountController::edit
* @see app/Http/Controllers/Partner/BankAccountController.php:21
* @route '/partner/bank'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\BankAccountController::edit
* @see app/Http/Controllers/Partner/BankAccountController.php:21
* @route '/partner/bank'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Partner\BankAccountController::update
* @see app/Http/Controllers/Partner/BankAccountController.php:36
* @route '/partner/bank'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/partner/bank',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Partner\BankAccountController::update
* @see app/Http/Controllers/Partner/BankAccountController.php:36
* @route '/partner/bank'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\BankAccountController::update
* @see app/Http/Controllers/Partner/BankAccountController.php:36
* @route '/partner/bank'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\BankAccountController::update
* @see app/Http/Controllers/Partner/BankAccountController.php:36
* @route '/partner/bank'
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
* @see \App\Http\Controllers\Partner\BankAccountController::update
* @see app/Http/Controllers/Partner/BankAccountController.php:36
* @route '/partner/bank'
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

const BankAccountController = { edit, update }

export default BankAccountController