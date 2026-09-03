import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import waitlistOffer from './waitlist-offer'
import proposal from './proposal'
import attendance from './attendance'
import results from './results'
import comments from './comments'
/**
* @see \App\Http\Controllers\Employee\EventController::create
* @see app/Http/Controllers/Employee/EventController.php:51
* @route '/employee/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/employee/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\EventController::create
* @see app/Http/Controllers/Employee/EventController.php:51
* @route '/employee/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::create
* @see app/Http/Controllers/Employee/EventController.php:51
* @route '/employee/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::create
* @see app/Http/Controllers/Employee/EventController.php:51
* @route '/employee/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\EventController::create
* @see app/Http/Controllers/Employee/EventController.php:51
* @route '/employee/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::create
* @see app/Http/Controllers/Employee/EventController.php:51
* @route '/employee/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::create
* @see app/Http/Controllers/Employee/EventController.php:51
* @route '/employee/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Employee\EventController::pricings
* @see app/Http/Controllers/Employee/EventController.php:78
* @route '/employee/create/pricings'
*/
export const pricings = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pricings.url(options),
    method: 'post',
})

pricings.definition = {
    methods: ["post"],
    url: '/employee/create/pricings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::pricings
* @see app/Http/Controllers/Employee/EventController.php:78
* @route '/employee/create/pricings'
*/
pricings.url = (options?: RouteQueryOptions) => {
    return pricings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::pricings
* @see app/Http/Controllers/Employee/EventController.php:78
* @route '/employee/create/pricings'
*/
pricings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pricings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::pricings
* @see app/Http/Controllers/Employee/EventController.php:78
* @route '/employee/create/pricings'
*/
const pricingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pricings.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::pricings
* @see app/Http/Controllers/Employee/EventController.php:78
* @route '/employee/create/pricings'
*/
pricingsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pricings.url(options),
    method: 'post',
})

pricings.form = pricingsForm

/**
* @see \App\Http\Controllers\Employee\EventController::store
* @see app/Http/Controllers/Employee/EventController.php:123
* @route '/employee/create'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::store
* @see app/Http/Controllers/Employee/EventController.php:123
* @route '/employee/create'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::store
* @see app/Http/Controllers/Employee/EventController.php:123
* @route '/employee/create'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::store
* @see app/Http/Controllers/Employee/EventController.php:123
* @route '/employee/create'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::store
* @see app/Http/Controllers/Employee/EventController.php:123
* @route '/employee/create'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\EventController::show
* @see app/Http/Controllers/Employee/EventController.php:204
* @route '/employee/detail/{event}'
*/
export const show = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/employee/detail/{event}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\EventController::show
* @see app/Http/Controllers/Employee/EventController.php:204
* @route '/employee/detail/{event}'
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
* @see \App\Http\Controllers\Employee\EventController::show
* @see app/Http/Controllers/Employee/EventController.php:204
* @route '/employee/detail/{event}'
*/
show.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::show
* @see app/Http/Controllers/Employee/EventController.php:204
* @route '/employee/detail/{event}'
*/
show.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\EventController::show
* @see app/Http/Controllers/Employee/EventController.php:204
* @route '/employee/detail/{event}'
*/
const showForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::show
* @see app/Http/Controllers/Employee/EventController.php:204
* @route '/employee/detail/{event}'
*/
showForm.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::show
* @see app/Http/Controllers/Employee/EventController.php:204
* @route '/employee/detail/{event}'
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
* @see \App\Http\Controllers\Employee\EventController::join
* @see app/Http/Controllers/Employee/EventController.php:352
* @route '/employee/detail/{event}/join'
*/
export const join = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

join.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::join
* @see app/Http/Controllers/Employee/EventController.php:352
* @route '/employee/detail/{event}/join'
*/
join.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return join.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::join
* @see app/Http/Controllers/Employee/EventController.php:352
* @route '/employee/detail/{event}/join'
*/
join.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::join
* @see app/Http/Controllers/Employee/EventController.php:352
* @route '/employee/detail/{event}/join'
*/
const joinForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: join.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::join
* @see app/Http/Controllers/Employee/EventController.php:352
* @route '/employee/detail/{event}/join'
*/
joinForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: join.url(args, options),
    method: 'post',
})

join.form = joinForm

/**
* @see \App\Http\Controllers\Employee\EventController::leave
* @see app/Http/Controllers/Employee/EventController.php:374
* @route '/employee/detail/{event}/leave'
*/
export const leave = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

leave.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/leave',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::leave
* @see app/Http/Controllers/Employee/EventController.php:374
* @route '/employee/detail/{event}/leave'
*/
leave.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return leave.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::leave
* @see app/Http/Controllers/Employee/EventController.php:374
* @route '/employee/detail/{event}/leave'
*/
leave.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::leave
* @see app/Http/Controllers/Employee/EventController.php:374
* @route '/employee/detail/{event}/leave'
*/
const leaveForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: leave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::leave
* @see app/Http/Controllers/Employee/EventController.php:374
* @route '/employee/detail/{event}/leave'
*/
leaveForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: leave.url(args, options),
    method: 'post',
})

leave.form = leaveForm

/**
* @see \App\Http\Controllers\Employee\EventController::leaveWaitlist
* @see app/Http/Controllers/Employee/EventController.php:390
* @route '/employee/detail/{event}/leave-waitlist'
*/
export const leaveWaitlist = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leaveWaitlist.url(args, options),
    method: 'post',
})

leaveWaitlist.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/leave-waitlist',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::leaveWaitlist
* @see app/Http/Controllers/Employee/EventController.php:390
* @route '/employee/detail/{event}/leave-waitlist'
*/
leaveWaitlist.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return leaveWaitlist.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::leaveWaitlist
* @see app/Http/Controllers/Employee/EventController.php:390
* @route '/employee/detail/{event}/leave-waitlist'
*/
leaveWaitlist.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leaveWaitlist.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::leaveWaitlist
* @see app/Http/Controllers/Employee/EventController.php:390
* @route '/employee/detail/{event}/leave-waitlist'
*/
const leaveWaitlistForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: leaveWaitlist.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::leaveWaitlist
* @see app/Http/Controllers/Employee/EventController.php:390
* @route '/employee/detail/{event}/leave-waitlist'
*/
leaveWaitlistForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: leaveWaitlist.url(args, options),
    method: 'post',
})

leaveWaitlist.form = leaveWaitlistForm

/**
* @see \App\Http\Controllers\Employee\EventController::acceptAlternative
* @see app/Http/Controllers/Employee/EventController.php:507
* @route '/employee/detail/{event}/alternatives/{alternative}/accept'
*/
export const acceptAlternative = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptAlternative.url(args, options),
    method: 'post',
})

acceptAlternative.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/alternatives/{alternative}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::acceptAlternative
* @see app/Http/Controllers/Employee/EventController.php:507
* @route '/employee/detail/{event}/alternatives/{alternative}/accept'
*/
acceptAlternative.url = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            event: args[0],
            alternative: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
        alternative: typeof args.alternative === 'object'
        ? args.alternative.id
        : args.alternative,
    }

    return acceptAlternative.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace('{alternative}', parsedArgs.alternative.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::acceptAlternative
* @see app/Http/Controllers/Employee/EventController.php:507
* @route '/employee/detail/{event}/alternatives/{alternative}/accept'
*/
acceptAlternative.post = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acceptAlternative.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::acceptAlternative
* @see app/Http/Controllers/Employee/EventController.php:507
* @route '/employee/detail/{event}/alternatives/{alternative}/accept'
*/
const acceptAlternativeForm = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: acceptAlternative.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::acceptAlternative
* @see app/Http/Controllers/Employee/EventController.php:507
* @route '/employee/detail/{event}/alternatives/{alternative}/accept'
*/
acceptAlternativeForm.post = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: acceptAlternative.url(args, options),
    method: 'post',
})

acceptAlternative.form = acceptAlternativeForm

/**
* @see \App\Http\Controllers\Employee\EventController::rejectAlternative
* @see app/Http/Controllers/Employee/EventController.php:520
* @route '/employee/detail/{event}/alternatives/{alternative}/reject'
*/
export const rejectAlternative = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectAlternative.url(args, options),
    method: 'post',
})

rejectAlternative.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/alternatives/{alternative}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::rejectAlternative
* @see app/Http/Controllers/Employee/EventController.php:520
* @route '/employee/detail/{event}/alternatives/{alternative}/reject'
*/
rejectAlternative.url = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            event: args[0],
            alternative: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
        alternative: typeof args.alternative === 'object'
        ? args.alternative.id
        : args.alternative,
    }

    return rejectAlternative.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace('{alternative}', parsedArgs.alternative.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::rejectAlternative
* @see app/Http/Controllers/Employee/EventController.php:520
* @route '/employee/detail/{event}/alternatives/{alternative}/reject'
*/
rejectAlternative.post = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectAlternative.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::rejectAlternative
* @see app/Http/Controllers/Employee/EventController.php:520
* @route '/employee/detail/{event}/alternatives/{alternative}/reject'
*/
const rejectAlternativeForm = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectAlternative.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::rejectAlternative
* @see app/Http/Controllers/Employee/EventController.php:520
* @route '/employee/detail/{event}/alternatives/{alternative}/reject'
*/
rejectAlternativeForm.post = (args: { event: number | { id: number }, alternative: number | { id: number } } | [event: number | { id: number }, alternative: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectAlternative.url(args, options),
    method: 'post',
})

rejectAlternative.form = rejectAlternativeForm

/**
* @see \App\Http\Controllers\Employee\EventController::removeMember
* @see app/Http/Controllers/Employee/EventController.php:533
* @route '/employee/detail/{event}/remove/{employee}'
*/
export const removeMember = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

removeMember.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/remove/{employee}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::removeMember
* @see app/Http/Controllers/Employee/EventController.php:533
* @route '/employee/detail/{event}/remove/{employee}'
*/
removeMember.url = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            event: args[0],
            employee: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return removeMember.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::removeMember
* @see app/Http/Controllers/Employee/EventController.php:533
* @route '/employee/detail/{event}/remove/{employee}'
*/
removeMember.post = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::removeMember
* @see app/Http/Controllers/Employee/EventController.php:533
* @route '/employee/detail/{event}/remove/{employee}'
*/
const removeMemberForm = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::removeMember
* @see app/Http/Controllers/Employee/EventController.php:533
* @route '/employee/detail/{event}/remove/{employee}'
*/
removeMemberForm.post = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

removeMember.form = removeMemberForm

/**
* @see \App\Http\Controllers\Employee\EventController::refundPreview
* @see app/Http/Controllers/Employee/EventController.php:569
* @route '/employee/detail/{event}/refund-preview'
*/
export const refundPreview = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: refundPreview.url(args, options),
    method: 'get',
})

refundPreview.definition = {
    methods: ["get","head"],
    url: '/employee/detail/{event}/refund-preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\EventController::refundPreview
* @see app/Http/Controllers/Employee/EventController.php:569
* @route '/employee/detail/{event}/refund-preview'
*/
refundPreview.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return refundPreview.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::refundPreview
* @see app/Http/Controllers/Employee/EventController.php:569
* @route '/employee/detail/{event}/refund-preview'
*/
refundPreview.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: refundPreview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::refundPreview
* @see app/Http/Controllers/Employee/EventController.php:569
* @route '/employee/detail/{event}/refund-preview'
*/
refundPreview.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: refundPreview.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\EventController::refundPreview
* @see app/Http/Controllers/Employee/EventController.php:569
* @route '/employee/detail/{event}/refund-preview'
*/
const refundPreviewForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: refundPreview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::refundPreview
* @see app/Http/Controllers/Employee/EventController.php:569
* @route '/employee/detail/{event}/refund-preview'
*/
refundPreviewForm.get = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: refundPreview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\EventController::refundPreview
* @see app/Http/Controllers/Employee/EventController.php:569
* @route '/employee/detail/{event}/refund-preview'
*/
refundPreviewForm.head = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: refundPreview.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

refundPreview.form = refundPreviewForm

/**
* @see \App\Http\Controllers\Employee\EventController::extendRegistration
* @see app/Http/Controllers/Employee/EventController.php:645
* @route '/employee/detail/{event}/extend-registration'
*/
export const extendRegistration = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extendRegistration.url(args, options),
    method: 'post',
})

extendRegistration.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/extend-registration',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::extendRegistration
* @see app/Http/Controllers/Employee/EventController.php:645
* @route '/employee/detail/{event}/extend-registration'
*/
extendRegistration.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return extendRegistration.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::extendRegistration
* @see app/Http/Controllers/Employee/EventController.php:645
* @route '/employee/detail/{event}/extend-registration'
*/
extendRegistration.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extendRegistration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::extendRegistration
* @see app/Http/Controllers/Employee/EventController.php:645
* @route '/employee/detail/{event}/extend-registration'
*/
const extendRegistrationForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: extendRegistration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::extendRegistration
* @see app/Http/Controllers/Employee/EventController.php:645
* @route '/employee/detail/{event}/extend-registration'
*/
extendRegistrationForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: extendRegistration.url(args, options),
    method: 'post',
})

extendRegistration.form = extendRegistrationForm

/**
* @see \App\Http\Controllers\Employee\EventController::destroy
* @see app/Http/Controllers/Employee/EventController.php:587
* @route '/employee/detail/{event}'
*/
export const destroy = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/employee/detail/{event}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Employee\EventController::destroy
* @see app/Http/Controllers/Employee/EventController.php:587
* @route '/employee/detail/{event}'
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
* @see \App\Http\Controllers\Employee\EventController::destroy
* @see app/Http/Controllers/Employee/EventController.php:587
* @route '/employee/detail/{event}'
*/
destroy.delete = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Employee\EventController::destroy
* @see app/Http/Controllers/Employee/EventController.php:587
* @route '/employee/detail/{event}'
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
* @see \App\Http\Controllers\Employee\EventController::destroy
* @see app/Http/Controllers/Employee/EventController.php:587
* @route '/employee/detail/{event}'
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

const events = {
    create: Object.assign(create, create),
    pricings: Object.assign(pricings, pricings),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    join: Object.assign(join, join),
    leave: Object.assign(leave, leave),
    leaveWaitlist: Object.assign(leaveWaitlist, leaveWaitlist),
    waitlistOffer: Object.assign(waitlistOffer, waitlistOffer),
    proposal: Object.assign(proposal, proposal),
    acceptAlternative: Object.assign(acceptAlternative, acceptAlternative),
    rejectAlternative: Object.assign(rejectAlternative, rejectAlternative),
    removeMember: Object.assign(removeMember, removeMember),
    refundPreview: Object.assign(refundPreview, refundPreview),
    attendance: Object.assign(attendance, attendance),
    results: Object.assign(results, results),
    extendRegistration: Object.assign(extendRegistration, extendRegistration),
    comments: Object.assign(comments, comments),
    destroy: Object.assign(destroy, destroy),
}

export default events