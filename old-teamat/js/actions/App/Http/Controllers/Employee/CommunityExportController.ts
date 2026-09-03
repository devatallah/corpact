import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
const CommunityExportController = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CommunityExportController.url(args, options),
    method: 'get',
})

CommunityExportController.definition = {
    methods: ["get","head"],
    url: '/employee/community/{community}/exports/{exportKey}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
CommunityExportController.url = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            exportKey: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        exportKey: args.exportKey,
    }

    return CommunityExportController.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{exportKey}', parsedArgs.exportKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
CommunityExportController.get = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: CommunityExportController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
CommunityExportController.head = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: CommunityExportController.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
const CommunityExportControllerForm = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: CommunityExportController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
CommunityExportControllerForm.get = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: CommunityExportController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
CommunityExportControllerForm.head = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: CommunityExportController.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

CommunityExportController.form = CommunityExportControllerForm

export default CommunityExportController