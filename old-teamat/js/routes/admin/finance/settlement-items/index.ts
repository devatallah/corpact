import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::correct
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:189
* @route '/admin/finance/settlement-items/{item}/correct'
*/
export const correct = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: correct.url(args, options),
    method: 'post',
})

correct.definition = {
    methods: ["post"],
    url: '/admin/finance/settlement-items/{item}/correct',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::correct
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:189
* @route '/admin/finance/settlement-items/{item}/correct'
*/
correct.url = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { item: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { item: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            item: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        item: typeof args.item === 'object'
        ? args.item.id
        : args.item,
    }

    return correct.definition.url
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::correct
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:189
* @route '/admin/finance/settlement-items/{item}/correct'
*/
correct.post = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: correct.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::correct
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:189
* @route '/admin/finance/settlement-items/{item}/correct'
*/
const correctForm = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: correct.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FinanceSettlementController::correct
* @see app/Http/Controllers/Admin/FinanceSettlementController.php:189
* @route '/admin/finance/settlement-items/{item}/correct'
*/
correctForm.post = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: correct.url(args, options),
    method: 'post',
})

correct.form = correctForm

const settlementItems = {
    correct: Object.assign(correct, correct),
}

export default settlementItems