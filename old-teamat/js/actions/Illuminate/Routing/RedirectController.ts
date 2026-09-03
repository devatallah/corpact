import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
const RedirectControllera6735397690d30570f358ff62fa3ef24 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

RedirectControllera6735397690d30570f358ff62fa3ef24.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/pricing',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.url = (options?: RouteQueryOptions) => {
    return RedirectControllera6735397690d30570f358ff62fa3ef24.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
const RedirectControllera6735397690d30570f358ff62fa3ef24Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/pricing'
*/
RedirectControllera6735397690d30570f358ff62fa3ef24Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllera6735397690d30570f358ff62fa3ef24.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectControllera6735397690d30570f358ff62fa3ef24.form = RedirectControllera6735397690d30570f358ff62fa3ef24Form
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
const RedirectController5000462d9c23a562f4014a314fb30901 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'get',
})

RedirectController5000462d9c23a562f4014a314fb30901.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/companies',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.url = (options?: RouteQueryOptions) => {
    return RedirectController5000462d9c23a562f4014a314fb30901.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
const RedirectController5000462d9c23a562f4014a314fb30901Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/companies'
*/
RedirectController5000462d9c23a562f4014a314fb30901Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController5000462d9c23a562f4014a314fb30901.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectController5000462d9c23a562f4014a314fb30901.form = RedirectController5000462d9c23a562f4014a314fb30901Form
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
const RedirectControllerc354eed709c24260c12dd5a68c7824df = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'get',
})

RedirectControllerc354eed709c24260c12dd5a68c7824df.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/employees',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.url = (options?: RouteQueryOptions) => {
    return RedirectControllerc354eed709c24260c12dd5a68c7824df.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824df.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
const RedirectControllerc354eed709c24260c12dd5a68c7824dfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824dfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824dfForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824dfForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824dfForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824dfForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824dfForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/employees'
*/
RedirectControllerc354eed709c24260c12dd5a68c7824dfForm.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc354eed709c24260c12dd5a68c7824df.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectControllerc354eed709c24260c12dd5a68c7824df.form = RedirectControllerc354eed709c24260c12dd5a68c7824dfForm
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
const RedirectControllerb6041c76e8e1cd791f8f89d035d48611 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'get',
})

RedirectControllerb6041c76e8e1cd791f8f89d035d48611.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/login',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url = (options?: RouteQueryOptions) => {
    return RedirectControllerb6041c76e8e1cd791f8f89d035d48611.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
const RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/login'
*/
RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerb6041c76e8e1cd791f8f89d035d48611.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectControllerb6041c76e8e1cd791f8f89d035d48611.form = RedirectControllerb6041c76e8e1cd791f8f89d035d48611Form
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
const RedirectControllerdbafd3d0e11e643988df98e8602254af = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'get',
})

RedirectControllerdbafd3d0e11e643988df98e8602254af.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/businesses',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.url = (options?: RouteQueryOptions) => {
    return RedirectControllerdbafd3d0e11e643988df98e8602254af.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254af.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
const RedirectControllerdbafd3d0e11e643988df98e8602254afForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254afForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254afForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254afForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254afForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254afForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254afForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/businesses'
*/
RedirectControllerdbafd3d0e11e643988df98e8602254afForm.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerdbafd3d0e11e643988df98e8602254af.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectControllerdbafd3d0e11e643988df98e8602254af.form = RedirectControllerdbafd3d0e11e643988df98e8602254afForm
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
const RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'get',
})

RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/business/login',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url = (options?: RouteQueryOptions) => {
    return RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
const RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/login'
*/
RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66.form = RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66Form
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
const RedirectController577db88a280ec101d9cb3243229eb9ea = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'get',
})

RedirectController577db88a280ec101d9cb3243229eb9ea.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/business/register',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.url = (options?: RouteQueryOptions) => {
    return RedirectController577db88a280ec101d9cb3243229eb9ea.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9ea.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
const RedirectController577db88a280ec101d9cb3243229eb9eaForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9eaForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9eaForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9eaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9eaForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9eaForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9eaForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business/register'
*/
RedirectController577db88a280ec101d9cb3243229eb9eaForm.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController577db88a280ec101d9cb3243229eb9ea.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectController577db88a280ec101d9cb3243229eb9ea.form = RedirectController577db88a280ec101d9cb3243229eb9eaForm
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
const RedirectController813da5a24c0bb640ea94a1923c9f0b54 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'get',
})

RedirectController813da5a24c0bb640ea94a1923c9f0b54.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/business',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.url = (options?: RouteQueryOptions) => {
    return RedirectController813da5a24c0bb640ea94a1923c9f0b54.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
const RedirectController813da5a24c0bb640ea94a1923c9f0b54Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/business'
*/
RedirectController813da5a24c0bb640ea94a1923c9f0b54Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController813da5a24c0bb640ea94a1923c9f0b54.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectController813da5a24c0bb640ea94a1923c9f0b54.form = RedirectController813da5a24c0bb640ea94a1923c9f0b54Form
/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
const RedirectController31635d909a78e276decd8a8ba3d696f7 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'get',
})

RedirectController31635d909a78e276decd8a8ba3d696f7.definition = {
    methods: ["get","head","post","put","patch","delete","options"],
    url: '/partners',
} satisfies RouteDefinition<["get","head","post","put","patch","delete","options"]>

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.url = (options?: RouteQueryOptions) => {
    return RedirectController31635d909a78e276decd8a8ba3d696f7.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'put',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'patch',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'delete',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7.options = (options?: RouteQueryOptions): RouteDefinition<'options'> => ({
    url: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'options',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
const RedirectController31635d909a78e276decd8a8ba3d696f7Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url(options),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7Form.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Illuminate\Routing\RedirectController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/RedirectController.php:19
* @route '/partners'
*/
RedirectController31635d909a78e276decd8a8ba3d696f7Form.options = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: RedirectController31635d909a78e276decd8a8ba3d696f7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'OPTIONS',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

RedirectController31635d909a78e276decd8a8ba3d696f7.form = RedirectController31635d909a78e276decd8a8ba3d696f7Form

const RedirectController = {
    '/pricing': RedirectControllera6735397690d30570f358ff62fa3ef24,
    '/companies': RedirectController5000462d9c23a562f4014a314fb30901,
    '/employees': RedirectControllerc354eed709c24260c12dd5a68c7824df,
    '/login': RedirectControllerb6041c76e8e1cd791f8f89d035d48611,
    '/businesses': RedirectControllerdbafd3d0e11e643988df98e8602254af,
    '/business/login': RedirectControllerc7aff996fdd3b04a3a47d24e7693fd66,
    '/business/register': RedirectController577db88a280ec101d9cb3243229eb9ea,
    '/business': RedirectController813da5a24c0bb640ea94a1923c9f0b54,
    '/partners': RedirectController31635d909a78e276decd8a8ba3d696f7,
}

export default RedirectController