import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::index
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/providers/oversight',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::index
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::index
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::index
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::index
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::index
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::index
* @see app/Http/Controllers/Admin/ProviderOversightController.php:32
* @route '/admin/providers/oversight'
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
* @see \App\Http\Controllers\Admin\ProviderOversightController::approveBank
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
export const approveBank = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveBank.url(args, options),
    method: 'post',
})

approveBank.definition = {
    methods: ["post"],
    url: '/admin/providers/{partner}/bank/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approveBank
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
approveBank.url = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { partner: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { partner: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            partner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        partner: typeof args.partner === 'object'
        ? args.partner.id
        : args.partner,
    }

    return approveBank.definition.url
            .replace('{partner}', parsedArgs.partner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approveBank
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
approveBank.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveBank.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approveBank
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
const approveBankForm = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveBank.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::approveBank
* @see app/Http/Controllers/Admin/ProviderOversightController.php:70
* @route '/admin/providers/{partner}/bank/approve'
*/
approveBankForm.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveBank.url(args, options),
    method: 'post',
})

approveBank.form = approveBankForm

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjustReliability
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
export const adjustReliability = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustReliability.url(args, options),
    method: 'post',
})

adjustReliability.definition = {
    methods: ["post"],
    url: '/admin/providers/{partner}/reliability',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjustReliability
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
adjustReliability.url = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { partner: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { partner: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            partner: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        partner: typeof args.partner === 'object'
        ? args.partner.id
        : args.partner,
    }

    return adjustReliability.definition.url
            .replace('{partner}', parsedArgs.partner.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjustReliability
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
adjustReliability.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustReliability.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjustReliability
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
const adjustReliabilityForm = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustReliability.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::adjustReliability
* @see app/Http/Controllers/Admin/ProviderOversightController.php:80
* @route '/admin/providers/{partner}/reliability'
*/
adjustReliabilityForm.post = (args: { partner: number | { id: number } } | [partner: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustReliability.url(args, options),
    method: 'post',
})

adjustReliability.form = adjustReliabilityForm

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decidePriceChange
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
export const decidePriceChange = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decidePriceChange.url(args, options),
    method: 'post',
})

decidePriceChange.definition = {
    methods: ["post"],
    url: '/admin/providers/price-changes/{priceChange}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decidePriceChange
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
decidePriceChange.url = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { priceChange: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { priceChange: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            priceChange: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        priceChange: typeof args.priceChange === 'object'
        ? args.priceChange.id
        : args.priceChange,
    }

    return decidePriceChange.definition.url
            .replace('{priceChange}', parsedArgs.priceChange.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decidePriceChange
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
decidePriceChange.post = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decidePriceChange.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decidePriceChange
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
const decidePriceChangeForm = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decidePriceChange.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ProviderOversightController::decidePriceChange
* @see app/Http/Controllers/Admin/ProviderOversightController.php:103
* @route '/admin/providers/price-changes/{priceChange}'
*/
decidePriceChangeForm.post = (args: { priceChange: number | { id: number } } | [priceChange: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decidePriceChange.url(args, options),
    method: 'post',
})

decidePriceChange.form = decidePriceChangeForm

const ProviderOversightController = { index, approveBank, adjustReliability, decidePriceChange }

export default ProviderOversightController