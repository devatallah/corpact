import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::index
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:51
* @route '/admin/finance/invoices'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/finance/invoices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::index
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:51
* @route '/admin/finance/invoices'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::index
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:51
* @route '/admin/finance/invoices'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::index
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:51
* @route '/admin/finance/invoices'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::index
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:51
* @route '/admin/finance/invoices'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::index
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:51
* @route '/admin/finance/invoices'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::index
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:51
* @route '/admin/finance/invoices'
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
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::generate
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:135
* @route '/admin/finance/invoices/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/admin/finance/invoices/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::generate
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:135
* @route '/admin/finance/invoices/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::generate
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:135
* @route '/admin/finance/invoices/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::generate
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:135
* @route '/admin/finance/invoices/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::generate
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:135
* @route '/admin/finance/invoices/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::runArrears
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:168
* @route '/admin/finance/invoices/arrears'
*/
export const runArrears = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: runArrears.url(options),
    method: 'post',
})

runArrears.definition = {
    methods: ["post"],
    url: '/admin/finance/invoices/arrears',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::runArrears
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:168
* @route '/admin/finance/invoices/arrears'
*/
runArrears.url = (options?: RouteQueryOptions) => {
    return runArrears.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::runArrears
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:168
* @route '/admin/finance/invoices/arrears'
*/
runArrears.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: runArrears.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::runArrears
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:168
* @route '/admin/finance/invoices/arrears'
*/
const runArrearsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: runArrears.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::runArrears
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:168
* @route '/admin/finance/invoices/arrears'
*/
runArrearsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: runArrears.url(options),
    method: 'post',
})

runArrears.form = runArrearsForm

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::show
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:108
* @route '/admin/finance/invoices/{invoice}'
*/
export const show = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/finance/invoices/{invoice}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::show
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:108
* @route '/admin/finance/invoices/{invoice}'
*/
show.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invoice: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { invoice: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            invoice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        invoice: typeof args.invoice === 'object'
        ? args.invoice.id
        : args.invoice,
    }

    return show.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::show
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:108
* @route '/admin/finance/invoices/{invoice}'
*/
show.get = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::show
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:108
* @route '/admin/finance/invoices/{invoice}'
*/
show.head = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::show
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:108
* @route '/admin/finance/invoices/{invoice}'
*/
const showForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::show
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:108
* @route '/admin/finance/invoices/{invoice}'
*/
showForm.get = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::show
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:108
* @route '/admin/finance/invoices/{invoice}'
*/
showForm.head = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::markPaid
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:150
* @route '/admin/finance/invoices/{invoice}/pay'
*/
export const markPaid = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPaid.url(args, options),
    method: 'post',
})

markPaid.definition = {
    methods: ["post"],
    url: '/admin/finance/invoices/{invoice}/pay',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::markPaid
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:150
* @route '/admin/finance/invoices/{invoice}/pay'
*/
markPaid.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invoice: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { invoice: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            invoice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        invoice: typeof args.invoice === 'object'
        ? args.invoice.id
        : args.invoice,
    }

    return markPaid.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::markPaid
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:150
* @route '/admin/finance/invoices/{invoice}/pay'
*/
markPaid.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markPaid.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::markPaid
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:150
* @route '/admin/finance/invoices/{invoice}/pay'
*/
const markPaidForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markPaid.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceInvoiceController::markPaid
* @see app/Http/Controllers/Admin/FinanceInvoiceController.php:150
* @route '/admin/finance/invoices/{invoice}/pay'
*/
markPaidForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markPaid.url(args, options),
    method: 'post',
})

markPaid.form = markPaidForm

const FinanceInvoiceController = { index, generate, runArrears, show, markPaid }

export default FinanceInvoiceController