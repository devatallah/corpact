import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchMethod
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
export const switchMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(options),
    method: 'post',
})

switchMethod.definition = {
    methods: ["post"],
    url: '/company/context/switch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchMethod
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
switchMethod.url = (options?: RouteQueryOptions) => {
    return switchMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchMethod
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
switchMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchMethod
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
const switchMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\CompanyAuthController::switchMethod
* @see app/Http/Controllers/Auth/CompanyAuthController.php:145
* @route '/company/context/switch'
*/
switchMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchMethod.url(options),
    method: 'post',
})

switchMethod.form = switchMethodForm

const context = {
    switch: Object.assign(switchMethod, switchMethod),
}

export default context