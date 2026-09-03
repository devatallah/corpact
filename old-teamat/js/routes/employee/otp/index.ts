import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::request
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
export const request = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(options),
    method: 'post',
})

request.definition = {
    methods: ["post"],
    url: '/employee/otp/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::request
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
request.url = (options?: RouteQueryOptions) => {
    return request.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::request
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
request.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::request
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
const requestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: request.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::request
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:56
* @route '/employee/otp/request'
*/
requestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: request.url(options),
    method: 'post',
})

request.form = requestForm

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verify
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/employee/otp/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verify
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verify
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verify
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmployeeAuthController::verify
* @see app/Http/Controllers/Auth/EmployeeAuthController.php:77
* @route '/employee/otp/verify'
*/
verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

verify.form = verifyForm

const otp = {
    request: Object.assign(request, request),
    verify: Object.assign(verify, verify),
}

export default otp