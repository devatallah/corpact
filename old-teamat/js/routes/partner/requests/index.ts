import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::link
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
export const link = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: link.url(args, options),
    method: 'get',
})

link.definition = {
    methods: ["get","head"],
    url: '/partner/requests-queue/link/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::link
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
link.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return link.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::link
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
link.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: link.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::link
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
link.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: link.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::link
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
const linkForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: link.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::link
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
linkForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: link.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::link
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
linkForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: link.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

link.form = linkForm

const requests = {
    link: Object.assign(link, link),
}

export default requests