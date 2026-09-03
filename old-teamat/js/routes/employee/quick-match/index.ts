import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\QuickMatchController::store
* @see app/Http/Controllers/Employee/QuickMatchController.php:20
* @route '/employee/quick-match'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/quick-match',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::store
* @see app/Http/Controllers/Employee/QuickMatchController.php:20
* @route '/employee/quick-match'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::store
* @see app/Http/Controllers/Employee/QuickMatchController.php:20
* @route '/employee/quick-match'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::store
* @see app/Http/Controllers/Employee/QuickMatchController.php:20
* @route '/employee/quick-match'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::store
* @see app/Http/Controllers/Employee/QuickMatchController.php:20
* @route '/employee/quick-match'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::vote
* @see app/Http/Controllers/Employee/QuickMatchController.php:49
* @route '/employee/quick-match/{quickMatch}/vote'
*/
export const vote = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

vote.definition = {
    methods: ["post"],
    url: '/employee/quick-match/{quickMatch}/vote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::vote
* @see app/Http/Controllers/Employee/QuickMatchController.php:49
* @route '/employee/quick-match/{quickMatch}/vote'
*/
vote.url = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quickMatch: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { quickMatch: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            quickMatch: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        quickMatch: typeof args.quickMatch === 'object'
        ? args.quickMatch.id
        : args.quickMatch,
    }

    return vote.definition.url
            .replace('{quickMatch}', parsedArgs.quickMatch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::vote
* @see app/Http/Controllers/Employee/QuickMatchController.php:49
* @route '/employee/quick-match/{quickMatch}/vote'
*/
vote.post = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::vote
* @see app/Http/Controllers/Employee/QuickMatchController.php:49
* @route '/employee/quick-match/{quickMatch}/vote'
*/
const voteForm = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::vote
* @see app/Http/Controllers/Employee/QuickMatchController.php:49
* @route '/employee/quick-match/{quickMatch}/vote'
*/
voteForm.post = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

vote.form = voteForm

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::convert
* @see app/Http/Controllers/Employee/QuickMatchController.php:75
* @route '/employee/quick-match/{quickMatch}/convert'
*/
export const convert = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convert.url(args, options),
    method: 'post',
})

convert.definition = {
    methods: ["post"],
    url: '/employee/quick-match/{quickMatch}/convert',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::convert
* @see app/Http/Controllers/Employee/QuickMatchController.php:75
* @route '/employee/quick-match/{quickMatch}/convert'
*/
convert.url = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quickMatch: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { quickMatch: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            quickMatch: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        quickMatch: typeof args.quickMatch === 'object'
        ? args.quickMatch.id
        : args.quickMatch,
    }

    return convert.definition.url
            .replace('{quickMatch}', parsedArgs.quickMatch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::convert
* @see app/Http/Controllers/Employee/QuickMatchController.php:75
* @route '/employee/quick-match/{quickMatch}/convert'
*/
convert.post = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convert.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::convert
* @see app/Http/Controllers/Employee/QuickMatchController.php:75
* @route '/employee/quick-match/{quickMatch}/convert'
*/
const convertForm = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: convert.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\QuickMatchController::convert
* @see app/Http/Controllers/Employee/QuickMatchController.php:75
* @route '/employee/quick-match/{quickMatch}/convert'
*/
convertForm.post = (args: { quickMatch: number | { id: number } } | [quickMatch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: convert.url(args, options),
    method: 'post',
})

convert.form = convertForm

const quickMatch = {
    store: Object.assign(store, store),
    vote: Object.assign(vote, vote),
    convert: Object.assign(convert, convert),
}

export default quickMatch