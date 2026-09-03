import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\EmployeeImportController::index
* @see app/Http/Controllers/Company/EmployeeImportController.php:25
* @route '/company/employees/import'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/employees/import',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::index
* @see app/Http/Controllers/Company/EmployeeImportController.php:25
* @route '/company/employees/import'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::index
* @see app/Http/Controllers/Company/EmployeeImportController.php:25
* @route '/company/employees/import'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::index
* @see app/Http/Controllers/Company/EmployeeImportController.php:25
* @route '/company/employees/import'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::index
* @see app/Http/Controllers/Company/EmployeeImportController.php:25
* @route '/company/employees/import'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::index
* @see app/Http/Controllers/Company/EmployeeImportController.php:25
* @route '/company/employees/import'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::index
* @see app/Http/Controllers/Company/EmployeeImportController.php:25
* @route '/company/employees/import'
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
* @see \App\Http\Controllers\Company\EmployeeImportController::store
* @see app/Http/Controllers/Company/EmployeeImportController.php:61
* @route '/company/employees/import'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/company/employees/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::store
* @see app/Http/Controllers/Company/EmployeeImportController.php:61
* @route '/company/employees/import'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::store
* @see app/Http/Controllers/Company/EmployeeImportController.php:61
* @route '/company/employees/import'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::store
* @see app/Http/Controllers/Company/EmployeeImportController.php:61
* @route '/company/employees/import'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::store
* @see app/Http/Controllers/Company/EmployeeImportController.php:61
* @route '/company/employees/import'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::errors
* @see app/Http/Controllers/Company/EmployeeImportController.php:90
* @route '/company/employees/import/{import}/errors'
*/
export const errors = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: errors.url(args, options),
    method: 'get',
})

errors.definition = {
    methods: ["get","head"],
    url: '/company/employees/import/{import}/errors',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::errors
* @see app/Http/Controllers/Company/EmployeeImportController.php:90
* @route '/company/employees/import/{import}/errors'
*/
errors.url = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { import: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { import: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            import: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        import: typeof args.import === 'object'
        ? args.import.id
        : args.import,
    }

    return errors.definition.url
            .replace('{import}', parsedArgs.import.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::errors
* @see app/Http/Controllers/Company/EmployeeImportController.php:90
* @route '/company/employees/import/{import}/errors'
*/
errors.get = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: errors.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::errors
* @see app/Http/Controllers/Company/EmployeeImportController.php:90
* @route '/company/employees/import/{import}/errors'
*/
errors.head = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: errors.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::errors
* @see app/Http/Controllers/Company/EmployeeImportController.php:90
* @route '/company/employees/import/{import}/errors'
*/
const errorsForm = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: errors.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::errors
* @see app/Http/Controllers/Company/EmployeeImportController.php:90
* @route '/company/employees/import/{import}/errors'
*/
errorsForm.get = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: errors.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::errors
* @see app/Http/Controllers/Company/EmployeeImportController.php:90
* @route '/company/employees/import/{import}/errors'
*/
errorsForm.head = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: errors.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

errors.form = errorsForm

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::invites
* @see app/Http/Controllers/Company/EmployeeImportController.php:112
* @route '/company/employees/import/{import}/invites'
*/
export const invites = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invites.url(args, options),
    method: 'post',
})

invites.definition = {
    methods: ["post"],
    url: '/company/employees/import/{import}/invites',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::invites
* @see app/Http/Controllers/Company/EmployeeImportController.php:112
* @route '/company/employees/import/{import}/invites'
*/
invites.url = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { import: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { import: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            import: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        import: typeof args.import === 'object'
        ? args.import.id
        : args.import,
    }

    return invites.definition.url
            .replace('{import}', parsedArgs.import.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::invites
* @see app/Http/Controllers/Company/EmployeeImportController.php:112
* @route '/company/employees/import/{import}/invites'
*/
invites.post = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invites.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::invites
* @see app/Http/Controllers/Company/EmployeeImportController.php:112
* @route '/company/employees/import/{import}/invites'
*/
const invitesForm = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invites.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EmployeeImportController::invites
* @see app/Http/Controllers/Company/EmployeeImportController.php:112
* @route '/company/employees/import/{import}/invites'
*/
invitesForm.post = (args: { import: number | { id: number } } | [importParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invites.url(args, options),
    method: 'post',
})

invites.form = invitesForm

const importMethod = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    errors: Object.assign(errors, errors),
    invites: Object.assign(invites, invites),
}

export default importMethod