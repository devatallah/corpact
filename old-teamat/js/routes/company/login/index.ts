import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::context
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
export const context = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: context.url(options),
    method: 'post',
})

context.definition = {
    methods: ["post"],
    url: '/company/login/context',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::context
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
context.url = (options?: RouteQueryOptions) => {
    return context.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::context
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
context.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: context.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::context
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
const contextForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: context.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::context
* @see app/Http/Controllers/Auth/CompanyAuthController.php:116
* @route '/company/login/context'
*/
contextForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: context.url(options),
    method: 'post',
})

context.form = contextForm

const login = {
    context: Object.assign(context, context),
}

export default login