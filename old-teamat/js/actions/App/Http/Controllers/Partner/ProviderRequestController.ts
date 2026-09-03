import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::queue
* @see app/Http/Controllers/Partner/ProviderRequestController.php:42
* @route '/partner/requests-queue'
*/
export const queue = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: queue.url(options),
    method: 'get',
})

queue.definition = {
    methods: ["get","head"],
    url: '/partner/requests-queue',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::queue
* @see app/Http/Controllers/Partner/ProviderRequestController.php:42
* @route '/partner/requests-queue'
*/
queue.url = (options?: RouteQueryOptions) => {
    return queue.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::queue
* @see app/Http/Controllers/Partner/ProviderRequestController.php:42
* @route '/partner/requests-queue'
*/
queue.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: queue.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::queue
* @see app/Http/Controllers/Partner/ProviderRequestController.php:42
* @route '/partner/requests-queue'
*/
queue.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: queue.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::queue
* @see app/Http/Controllers/Partner/ProviderRequestController.php:42
* @route '/partner/requests-queue'
*/
const queueForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: queue.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::queue
* @see app/Http/Controllers/Partner/ProviderRequestController.php:42
* @route '/partner/requests-queue'
*/
queueForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: queue.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::queue
* @see app/Http/Controllers/Partner/ProviderRequestController.php:42
* @route '/partner/requests-queue'
*/
queueForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: queue.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

queue.form = queueForm

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::openLink
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
export const openLink = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openLink.url(args, options),
    method: 'get',
})

openLink.definition = {
    methods: ["get","head"],
    url: '/partner/requests-queue/link/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::openLink
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
openLink.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return openLink.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::openLink
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
openLink.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openLink.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::openLink
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
openLink.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: openLink.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::openLink
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
const openLinkForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openLink.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::openLink
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
openLinkForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openLink.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::openLink
* @see app/Http/Controllers/Partner/ProviderRequestController.php:99
* @route '/partner/requests-queue/link/{token}'
*/
openLinkForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: openLink.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

openLink.form = openLinkForm

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::decision
* @see app/Http/Controllers/Partner/ProviderRequestController.php:85
* @route '/partner/requests-queue/{providerRequest}'
*/
export const decision = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: decision.url(args, options),
    method: 'get',
})

decision.definition = {
    methods: ["get","head"],
    url: '/partner/requests-queue/{providerRequest}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::decision
* @see app/Http/Controllers/Partner/ProviderRequestController.php:85
* @route '/partner/requests-queue/{providerRequest}'
*/
decision.url = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { providerRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { providerRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            providerRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        providerRequest: typeof args.providerRequest === 'object'
        ? args.providerRequest.id
        : args.providerRequest,
    }

    return decision.definition.url
            .replace('{providerRequest}', parsedArgs.providerRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::decision
* @see app/Http/Controllers/Partner/ProviderRequestController.php:85
* @route '/partner/requests-queue/{providerRequest}'
*/
decision.get = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: decision.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::decision
* @see app/Http/Controllers/Partner/ProviderRequestController.php:85
* @route '/partner/requests-queue/{providerRequest}'
*/
decision.head = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: decision.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::decision
* @see app/Http/Controllers/Partner/ProviderRequestController.php:85
* @route '/partner/requests-queue/{providerRequest}'
*/
const decisionForm = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: decision.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::decision
* @see app/Http/Controllers/Partner/ProviderRequestController.php:85
* @route '/partner/requests-queue/{providerRequest}'
*/
decisionForm.get = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: decision.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::decision
* @see app/Http/Controllers/Partner/ProviderRequestController.php:85
* @route '/partner/requests-queue/{providerRequest}'
*/
decisionForm.head = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: decision.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

decision.form = decisionForm

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::accept
* @see app/Http/Controllers/Partner/ProviderRequestController.php:116
* @route '/partner/requests-queue/{providerRequest}/accept'
*/
export const accept = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/partner/requests-queue/{providerRequest}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::accept
* @see app/Http/Controllers/Partner/ProviderRequestController.php:116
* @route '/partner/requests-queue/{providerRequest}/accept'
*/
accept.url = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { providerRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { providerRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            providerRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        providerRequest: typeof args.providerRequest === 'object'
        ? args.providerRequest.id
        : args.providerRequest,
    }

    return accept.definition.url
            .replace('{providerRequest}', parsedArgs.providerRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::accept
* @see app/Http/Controllers/Partner/ProviderRequestController.php:116
* @route '/partner/requests-queue/{providerRequest}/accept'
*/
accept.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::accept
* @see app/Http/Controllers/Partner/ProviderRequestController.php:116
* @route '/partner/requests-queue/{providerRequest}/accept'
*/
const acceptForm = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::accept
* @see app/Http/Controllers/Partner/ProviderRequestController.php:116
* @route '/partner/requests-queue/{providerRequest}/accept'
*/
acceptForm.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

accept.form = acceptForm

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::reject
* @see app/Http/Controllers/Partner/ProviderRequestController.php:123
* @route '/partner/requests-queue/{providerRequest}/reject'
*/
export const reject = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/partner/requests-queue/{providerRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::reject
* @see app/Http/Controllers/Partner/ProviderRequestController.php:123
* @route '/partner/requests-queue/{providerRequest}/reject'
*/
reject.url = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { providerRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { providerRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            providerRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        providerRequest: typeof args.providerRequest === 'object'
        ? args.providerRequest.id
        : args.providerRequest,
    }

    return reject.definition.url
            .replace('{providerRequest}', parsedArgs.providerRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::reject
* @see app/Http/Controllers/Partner/ProviderRequestController.php:123
* @route '/partner/requests-queue/{providerRequest}/reject'
*/
reject.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::reject
* @see app/Http/Controllers/Partner/ProviderRequestController.php:123
* @route '/partner/requests-queue/{providerRequest}/reject'
*/
const rejectForm = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::reject
* @see app/Http/Controllers/Partner/ProviderRequestController.php:123
* @route '/partner/requests-queue/{providerRequest}/reject'
*/
rejectForm.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::proposeAlternative
* @see app/Http/Controllers/Partner/ProviderRequestController.php:136
* @route '/partner/requests-queue/{providerRequest}/propose-alternative'
*/
export const proposeAlternative = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: proposeAlternative.url(args, options),
    method: 'post',
})

proposeAlternative.definition = {
    methods: ["post"],
    url: '/partner/requests-queue/{providerRequest}/propose-alternative',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::proposeAlternative
* @see app/Http/Controllers/Partner/ProviderRequestController.php:136
* @route '/partner/requests-queue/{providerRequest}/propose-alternative'
*/
proposeAlternative.url = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { providerRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { providerRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            providerRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        providerRequest: typeof args.providerRequest === 'object'
        ? args.providerRequest.id
        : args.providerRequest,
    }

    return proposeAlternative.definition.url
            .replace('{providerRequest}', parsedArgs.providerRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::proposeAlternative
* @see app/Http/Controllers/Partner/ProviderRequestController.php:136
* @route '/partner/requests-queue/{providerRequest}/propose-alternative'
*/
proposeAlternative.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: proposeAlternative.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::proposeAlternative
* @see app/Http/Controllers/Partner/ProviderRequestController.php:136
* @route '/partner/requests-queue/{providerRequest}/propose-alternative'
*/
const proposeAlternativeForm = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: proposeAlternative.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::proposeAlternative
* @see app/Http/Controllers/Partner/ProviderRequestController.php:136
* @route '/partner/requests-queue/{providerRequest}/propose-alternative'
*/
proposeAlternativeForm.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: proposeAlternative.url(args, options),
    method: 'post',
})

proposeAlternative.form = proposeAlternativeForm

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::cancel
* @see app/Http/Controllers/Partner/ProviderRequestController.php:155
* @route '/partner/requests-queue/{providerRequest}/cancel'
*/
export const cancel = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/partner/requests-queue/{providerRequest}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::cancel
* @see app/Http/Controllers/Partner/ProviderRequestController.php:155
* @route '/partner/requests-queue/{providerRequest}/cancel'
*/
cancel.url = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { providerRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { providerRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            providerRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        providerRequest: typeof args.providerRequest === 'object'
        ? args.providerRequest.id
        : args.providerRequest,
    }

    return cancel.definition.url
            .replace('{providerRequest}', parsedArgs.providerRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::cancel
* @see app/Http/Controllers/Partner/ProviderRequestController.php:155
* @route '/partner/requests-queue/{providerRequest}/cancel'
*/
cancel.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::cancel
* @see app/Http/Controllers/Partner/ProviderRequestController.php:155
* @route '/partner/requests-queue/{providerRequest}/cancel'
*/
const cancelForm = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ProviderRequestController::cancel
* @see app/Http/Controllers/Partner/ProviderRequestController.php:155
* @route '/partner/requests-queue/{providerRequest}/cancel'
*/
cancelForm.post = (args: { providerRequest: number | { id: number } } | [providerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancel.url(args, options),
    method: 'post',
})

cancel.form = cancelForm

const ProviderRequestController = { queue, openLink, decision, accept, reject, proposeAlternative, cancel }

export default ProviderRequestController