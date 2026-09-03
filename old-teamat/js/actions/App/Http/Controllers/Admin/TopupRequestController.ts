import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\TopupRequestController::index
* @see app/Http/Controllers/Admin/TopupRequestController.php:44
* @route '/admin/finance/topups'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/finance/topups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::index
* @see app/Http/Controllers/Admin/TopupRequestController.php:44
* @route '/admin/finance/topups'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::index
* @see app/Http/Controllers/Admin/TopupRequestController.php:44
* @route '/admin/finance/topups'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::index
* @see app/Http/Controllers/Admin/TopupRequestController.php:44
* @route '/admin/finance/topups'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::index
* @see app/Http/Controllers/Admin/TopupRequestController.php:44
* @route '/admin/finance/topups'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::index
* @see app/Http/Controllers/Admin/TopupRequestController.php:44
* @route '/admin/finance/topups'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::index
* @see app/Http/Controllers/Admin/TopupRequestController.php:44
* @route '/admin/finance/topups'
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
* @see \App\Http\Controllers\Admin\TopupRequestController::startReview
* @see app/Http/Controllers/Admin/TopupRequestController.php:101
* @route '/admin/finance/topups/{topup}/start-review'
*/
export const startReview = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startReview.url(args, options),
    method: 'post',
})

startReview.definition = {
    methods: ["post"],
    url: '/admin/finance/topups/{topup}/start-review',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::startReview
* @see app/Http/Controllers/Admin/TopupRequestController.php:101
* @route '/admin/finance/topups/{topup}/start-review'
*/
startReview.url = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { topup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            topup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        topup: typeof args.topup === 'object'
        ? args.topup.id
        : args.topup,
    }

    return startReview.definition.url
            .replace('{topup}', parsedArgs.topup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::startReview
* @see app/Http/Controllers/Admin/TopupRequestController.php:101
* @route '/admin/finance/topups/{topup}/start-review'
*/
startReview.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startReview.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::startReview
* @see app/Http/Controllers/Admin/TopupRequestController.php:101
* @route '/admin/finance/topups/{topup}/start-review'
*/
const startReviewForm = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: startReview.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::startReview
* @see app/Http/Controllers/Admin/TopupRequestController.php:101
* @route '/admin/finance/topups/{topup}/start-review'
*/
startReviewForm.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: startReview.url(args, options),
    method: 'post',
})

startReview.form = startReviewForm

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::approve
* @see app/Http/Controllers/Admin/TopupRequestController.php:137
* @route '/admin/finance/topups/{topup}/approve'
*/
export const approve = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/finance/topups/{topup}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::approve
* @see app/Http/Controllers/Admin/TopupRequestController.php:137
* @route '/admin/finance/topups/{topup}/approve'
*/
approve.url = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { topup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            topup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        topup: typeof args.topup === 'object'
        ? args.topup.id
        : args.topup,
    }

    return approve.definition.url
            .replace('{topup}', parsedArgs.topup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::approve
* @see app/Http/Controllers/Admin/TopupRequestController.php:137
* @route '/admin/finance/topups/{topup}/approve'
*/
approve.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::approve
* @see app/Http/Controllers/Admin/TopupRequestController.php:137
* @route '/admin/finance/topups/{topup}/approve'
*/
const approveForm = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::approve
* @see app/Http/Controllers/Admin/TopupRequestController.php:137
* @route '/admin/finance/topups/{topup}/approve'
*/
approveForm.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::reject
* @see app/Http/Controllers/Admin/TopupRequestController.php:144
* @route '/admin/finance/topups/{topup}/reject'
*/
export const reject = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/finance/topups/{topup}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::reject
* @see app/Http/Controllers/Admin/TopupRequestController.php:144
* @route '/admin/finance/topups/{topup}/reject'
*/
reject.url = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { topup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            topup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        topup: typeof args.topup === 'object'
        ? args.topup.id
        : args.topup,
    }

    return reject.definition.url
            .replace('{topup}', parsedArgs.topup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::reject
* @see app/Http/Controllers/Admin/TopupRequestController.php:144
* @route '/admin/finance/topups/{topup}/reject'
*/
reject.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::reject
* @see app/Http/Controllers/Admin/TopupRequestController.php:144
* @route '/admin/finance/topups/{topup}/reject'
*/
const rejectForm = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::reject
* @see app/Http/Controllers/Admin/TopupRequestController.php:144
* @route '/admin/finance/topups/{topup}/reject'
*/
rejectForm.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::unapprove
* @see app/Http/Controllers/Admin/TopupRequestController.php:156
* @route '/admin/finance/topups/{topup}/unapprove'
*/
export const unapprove = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unapprove.url(args, options),
    method: 'post',
})

unapprove.definition = {
    methods: ["post"],
    url: '/admin/finance/topups/{topup}/unapprove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::unapprove
* @see app/Http/Controllers/Admin/TopupRequestController.php:156
* @route '/admin/finance/topups/{topup}/unapprove'
*/
unapprove.url = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { topup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            topup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        topup: typeof args.topup === 'object'
        ? args.topup.id
        : args.topup,
    }

    return unapprove.definition.url
            .replace('{topup}', parsedArgs.topup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::unapprove
* @see app/Http/Controllers/Admin/TopupRequestController.php:156
* @route '/admin/finance/topups/{topup}/unapprove'
*/
unapprove.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unapprove.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::unapprove
* @see app/Http/Controllers/Admin/TopupRequestController.php:156
* @route '/admin/finance/topups/{topup}/unapprove'
*/
const unapproveForm = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unapprove.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::unapprove
* @see app/Http/Controllers/Admin/TopupRequestController.php:156
* @route '/admin/finance/topups/{topup}/unapprove'
*/
unapproveForm.post = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unapprove.url(args, options),
    method: 'post',
})

unapprove.form = unapproveForm

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::receipt
* @see app/Http/Controllers/Admin/TopupRequestController.php:113
* @route '/admin/finance/topups/{topup}/receipt'
*/
export const receipt = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: receipt.url(args, options),
    method: 'get',
})

receipt.definition = {
    methods: ["get","head"],
    url: '/admin/finance/topups/{topup}/receipt',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::receipt
* @see app/Http/Controllers/Admin/TopupRequestController.php:113
* @route '/admin/finance/topups/{topup}/receipt'
*/
receipt.url = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { topup: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { topup: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            topup: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        topup: typeof args.topup === 'object'
        ? args.topup.id
        : args.topup,
    }

    return receipt.definition.url
            .replace('{topup}', parsedArgs.topup.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::receipt
* @see app/Http/Controllers/Admin/TopupRequestController.php:113
* @route '/admin/finance/topups/{topup}/receipt'
*/
receipt.get = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: receipt.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::receipt
* @see app/Http/Controllers/Admin/TopupRequestController.php:113
* @route '/admin/finance/topups/{topup}/receipt'
*/
receipt.head = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: receipt.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::receipt
* @see app/Http/Controllers/Admin/TopupRequestController.php:113
* @route '/admin/finance/topups/{topup}/receipt'
*/
const receiptForm = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: receipt.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::receipt
* @see app/Http/Controllers/Admin/TopupRequestController.php:113
* @route '/admin/finance/topups/{topup}/receipt'
*/
receiptForm.get = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: receipt.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\TopupRequestController::receipt
* @see app/Http/Controllers/Admin/TopupRequestController.php:113
* @route '/admin/finance/topups/{topup}/receipt'
*/
receiptForm.head = (args: { topup: number | { id: number } } | [topup: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: receipt.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

receipt.form = receiptForm

const TopupRequestController = { index, startReview, approve, reject, unapprove, receipt }

export default TopupRequestController