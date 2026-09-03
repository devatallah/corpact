import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchMethod
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
export const switchMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(options),
    method: 'post',
})

switchMethod.definition = {
    methods: ["post"],
    url: '/employee/context/switch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchMethod
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
switchMethod.url = (options?: RouteQueryOptions) => {
    return switchMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchMethod
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
switchMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchMethod
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
*/
const switchMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: switchMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::switchMethod
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:145
* @route '/employee/context/switch'
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