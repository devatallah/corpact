import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::index
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:54
* @route '/admin/finance/settlements'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/finance/settlements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::index
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:54
* @route '/admin/finance/settlements'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::index
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:54
* @route '/admin/finance/settlements'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::index
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:54
* @route '/admin/finance/settlements'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::index
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:54
* @route '/admin/finance/settlements'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::index
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:54
* @route '/admin/finance/settlements'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::index
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:54
* @route '/admin/finance/settlements'
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
* @see \App\Http\Controllers\Admin\FinanceSettlementController::generate
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:142
* @route '/admin/finance/settlements/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/admin/finance/settlements/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::generate
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:142
* @route '/admin/finance/settlements/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::generate
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:142
* @route '/admin/finance/settlements/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::generate
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:142
* @route '/admin/finance/settlements/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::generate
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:142
* @route '/admin/finance/settlements/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::show
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:122
* @route '/admin/finance/settlements/{statement}'
*/
export const show = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/finance/settlements/{statement}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::show
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:122
* @route '/admin/finance/settlements/{statement}'
*/
show.url = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { statement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { statement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            statement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        statement: typeof args.statement === 'object'
        ? args.statement.id
        : args.statement,
    }

    return show.definition.url
            .replace('{statement}', parsedArgs.statement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::show
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:122
* @route '/admin/finance/settlements/{statement}'
*/
show.get = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::show
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:122
* @route '/admin/finance/settlements/{statement}'
*/
show.head = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::show
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:122
* @route '/admin/finance/settlements/{statement}'
*/
const showForm = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::show
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:122
* @route '/admin/finance/settlements/{statement}'
*/
showForm.get = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::show
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:122
* @route '/admin/finance/settlements/{statement}'
*/
showForm.head = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::approve
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:152
* @route '/admin/finance/settlements/{statement}/approve'
*/
export const approve = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/finance/settlements/{statement}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::approve
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:152
* @route '/admin/finance/settlements/{statement}/approve'
*/
approve.url = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { statement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { statement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            statement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        statement: typeof args.statement === 'object'
        ? args.statement.id
        : args.statement,
    }

    return approve.definition.url
            .replace('{statement}', parsedArgs.statement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::approve
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:152
* @route '/admin/finance/settlements/{statement}/approve'
*/
approve.post = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::approve
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:152
* @route '/admin/finance/settlements/{statement}/approve'
*/
const approveForm = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::approve
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:152
* @route '/admin/finance/settlements/{statement}/approve'
*/
approveForm.post = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::pay
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:163
* @route '/admin/finance/settlements/{statement}/pay'
*/
export const pay = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pay.url(args, options),
    method: 'post',
})

pay.definition = {
    methods: ["post"],
    url: '/admin/finance/settlements/{statement}/pay',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::pay
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:163
* @route '/admin/finance/settlements/{statement}/pay'
*/
pay.url = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { statement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { statement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            statement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        statement: typeof args.statement === 'object'
        ? args.statement.id
        : args.statement,
    }

    return pay.definition.url
            .replace('{statement}', parsedArgs.statement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::pay
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:163
* @route '/admin/finance/settlements/{statement}/pay'
*/
pay.post = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pay.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::pay
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:163
* @route '/admin/finance/settlements/{statement}/pay'
*/
const payForm = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pay.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::pay
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:163
* @route '/admin/finance/settlements/{statement}/pay'
*/
payForm.post = (args: { statement: number | { id: number } } | [statement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pay.url(args, options),
    method: 'post',
})

pay.form = payForm

const settlements = {
    index: Object.assign(index, index),
    generate: Object.assign(generate, generate),
    show: Object.assign(show, show),
    approve: Object.assign(approve, approve),
    pay: Object.assign(pay, pay),
}

export default settlements