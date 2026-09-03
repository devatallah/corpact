import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\CommunityController::store
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
export const store = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/polls',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::store
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
store.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return store.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::store
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
store.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::store
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
const storeForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::store
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
storeForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::vote
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
export const vote = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

vote.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/polls/{poll}/vote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::vote
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
vote.url = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            poll: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        poll: typeof args.poll === 'object'
        ? args.poll.id
        : args.poll,
    }

    return vote.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{poll}', parsedArgs.poll.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::vote
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
vote.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::vote
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
const voteForm = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::vote
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
voteForm.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

vote.form = voteForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::close
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
export const close = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

close.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/polls/{poll}/close',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::close
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
close.url = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            poll: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        poll: typeof args.poll === 'object'
        ? args.poll.id
        : args.poll,
    }

    return close.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{poll}', parsedArgs.poll.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::close
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
close.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::close
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
const closeForm = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: close.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::close
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
closeForm.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: close.url(args, options),
    method: 'post',
})

close.form = closeForm

const polls = {
    store: Object.assign(store, store),
    vote: Object.assign(vote, vote),
    close: Object.assign(close, close),
}

export default polls