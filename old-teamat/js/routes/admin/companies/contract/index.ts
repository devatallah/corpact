import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\CompanyContractController::update
* @see app/Http/Controllers/Admin/CompanyContractController.php:29
* @route '/admin/companies/{company}/contract'
*/
export const update = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/companies/{company}/contract',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\CompanyContractController::update
* @see app/Http/Controllers/Admin/CompanyContractController.php:29
* @route '/admin/companies/{company}/contract'
*/
update.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { company: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: typeof args.company === 'object'
        ? args.company.id
        : args.company,
    }

    return update.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\CompanyContractController::update
* @see app/Http/Controllers/Admin/CompanyContractController.php:29
* @route '/admin/companies/{company}/contract'
*/
update.put = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\CompanyContractController::update
* @see app/Http/Controllers/Admin/CompanyContractController.php:29
* @route '/admin/companies/{company}/contract'
*/
const updateForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\CompanyContractController::update
* @see app/Http/Controllers/Admin/CompanyContractController.php:29
* @route '/admin/companies/{company}/contract'
*/
updateForm.put = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const contract = {
    update: Object.assign(update, update),
}

export default contract