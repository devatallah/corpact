import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Company\EventController::index
* @see app/Http/Controllers/Company/EventController.php:38
* @route '/company/events'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/company/events',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EventController::index
* @see app/Http/Controllers/Company/EventController.php:38
* @route '/company/events'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EventController::index
* @see app/Http/Controllers/Company/EventController.php:38
* @route '/company/events'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EventController::index
* @see app/Http/Controllers/Company/EventController.php:38
* @route '/company/events'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EventController::index
* @see app/Http/Controllers/Company/EventController.php:38
* @route '/company/events'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EventController::index
* @see app/Http/Controllers/Company/EventController.php:38
* @route '/company/events'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EventController::index
* @see app/Http/Controllers/Company/EventController.php:38
* @route '/company/events'
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
* @see \App\Http\Controllers\Company\EventController::show
* @see app/Http/Controllers/Company/EventController.php:66
* @route '/company/events/{event}'
*/
export const show = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/company/events/{event}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Company\EventController::show
* @see app/Http/Controllers/Company/EventController.php:66
* @route '/company/events/{event}'
*/
show.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { event: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { event: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            event: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return show.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EventController::show
* @see app/Http/Controllers/Company/EventController.php:66
* @route '/company/events/{event}'
*/
show.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EventController::show
* @see app/Http/Controllers/Company/EventController.php:66
* @route '/company/events/{event}'
*/
show.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Company\EventController::show
* @see app/Http/Controllers/Company/EventController.php:66
* @route '/company/events/{event}'
*/
const showForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EventController::show
* @see app/Http/Controllers/Company/EventController.php:66
* @route '/company/events/{event}'
*/
showForm.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Company\EventController::show
* @see app/Http/Controllers/Company/EventController.php:66
* @route '/company/events/{event}'
*/
showForm.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Company\EventController::destroy
* @see app/Http/Controllers/Company/EventController.php:122
* @route '/company/events/{event}'
*/
export const destroy = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/company/events/{event}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Company\EventController::destroy
* @see app/Http/Controllers/Company/EventController.php:122
* @route '/company/events/{event}'
*/
destroy.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { event: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { event: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            event: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return destroy.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EventController::destroy
* @see app/Http/Controllers/Company/EventController.php:122
* @route '/company/events/{event}'
*/
destroy.delete = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Company\EventController::destroy
* @see app/Http/Controllers/Company/EventController.php:122
* @route '/company/events/{event}'
*/
const destroyForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EventController::destroy
* @see app/Http/Controllers/Company/EventController.php:122
* @route '/company/events/{event}'
*/
destroyForm.delete = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Company\EventController::cancel
* @see app/Http/Controllers/Company/EventController.php:132
* @route '/company/events/{event}/cancel'
*/
export const cancel = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/company/events/{event}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\EventController::cancel
* @see app/Http/Controllers/Company/EventController.php:132
* @route '/company/events/{event}/cancel'
*/
cancel.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { event: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { event: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            event: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return cancel.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EventController::cancel
* @see app/Http/Controllers/Company/EventController.php:132
* @route '/company/events/{event}/cancel'
*/
cancel.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EventController::cancel
* @see app/Http/Controllers/Company/EventController.php:132
* @route '/company/events/{event}/cancel'
*/
const cancelForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EventController::cancel
* @see app/Http/Controllers/Company/EventController.php:132
* @route '/company/events/{event}/cancel'
*/
cancelForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancel.url(args, options),
    method: 'post',
})

cancel.form = cancelForm

/**
* @see \App\Http\Controllers\Company\EventController::addMember
* @see app/Http/Controllers/Company/EventController.php:170
* @route '/company/events/{event}/add-member'
*/
export const addMember = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addMember.url(args, options),
    method: 'post',
})

addMember.definition = {
    methods: ["post"],
    url: '/company/events/{event}/add-member',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\EventController::addMember
* @see app/Http/Controllers/Company/EventController.php:170
* @route '/company/events/{event}/add-member'
*/
addMember.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { event: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { event: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            event: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return addMember.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EventController::addMember
* @see app/Http/Controllers/Company/EventController.php:170
* @route '/company/events/{event}/add-member'
*/
addMember.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EventController::addMember
* @see app/Http/Controllers/Company/EventController.php:170
* @route '/company/events/{event}/add-member'
*/
const addMemberForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EventController::addMember
* @see app/Http/Controllers/Company/EventController.php:170
* @route '/company/events/{event}/add-member'
*/
addMemberForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addMember.url(args, options),
    method: 'post',
})

addMember.form = addMemberForm

/**
* @see \App\Http\Controllers\Company\EventController::removeMember
* @see app/Http/Controllers/Company/EventController.php:191
* @route '/company/events/{event}/remove-member'
*/
export const removeMember = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

removeMember.definition = {
    methods: ["post"],
    url: '/company/events/{event}/remove-member',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Company\EventController::removeMember
* @see app/Http/Controllers/Company/EventController.php:191
* @route '/company/events/{event}/remove-member'
*/
removeMember.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { event: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { event: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            event: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return removeMember.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Company\EventController::removeMember
* @see app/Http/Controllers/Company/EventController.php:191
* @route '/company/events/{event}/remove-member'
*/
removeMember.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EventController::removeMember
* @see app/Http/Controllers/Company/EventController.php:191
* @route '/company/events/{event}/remove-member'
*/
const removeMemberForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Company\EventController::removeMember
* @see app/Http/Controllers/Company/EventController.php:191
* @route '/company/events/{event}/remove-member'
*/
removeMemberForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

removeMember.form = removeMemberForm

const events = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    destroy: Object.assign(destroy, destroy),
    cancel: Object.assign(cancel, cancel),
    addMember: Object.assign(addMember, addMember),
    removeMember: Object.assign(removeMember, removeMember),
}

export default events