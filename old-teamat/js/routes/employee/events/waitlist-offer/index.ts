import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\EventController::accept
* @see app/Http/Controllers/Employee/EventController.php:406
* @route '/employee/detail/{event}/waitlist-offer/accept'
*/
export const accept = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/waitlist-offer/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::accept
* @see app/Http/Controllers/Employee/EventController.php:406
* @route '/employee/detail/{event}/waitlist-offer/accept'
*/
accept.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return accept.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::accept
* @see app/Http/Controllers/Employee/EventController.php:406
* @route '/employee/detail/{event}/waitlist-offer/accept'
*/
accept.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::accept
* @see app/Http/Controllers/Employee/EventController.php:406
* @route '/employee/detail/{event}/waitlist-offer/accept'
*/
const acceptForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::accept
* @see app/Http/Controllers/Employee/EventController.php:406
* @route '/employee/detail/{event}/waitlist-offer/accept'
*/
acceptForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

accept.form = acceptForm

/**
* @see \App\Http\Controllers\Employee\EventController::decline
* @see app/Http/Controllers/Employee/EventController.php:424
* @route '/employee/detail/{event}/waitlist-offer/decline'
*/
export const decline = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decline.url(args, options),
    method: 'post',
})

decline.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/waitlist-offer/decline',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventController::decline
* @see app/Http/Controllers/Employee/EventController.php:424
* @route '/employee/detail/{event}/waitlist-offer/decline'
*/
decline.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return decline.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventController::decline
* @see app/Http/Controllers/Employee/EventController.php:424
* @route '/employee/detail/{event}/waitlist-offer/decline'
*/
decline.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decline.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::decline
* @see app/Http/Controllers/Employee/EventController.php:424
* @route '/employee/detail/{event}/waitlist-offer/decline'
*/
const declineForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decline.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventController::decline
* @see app/Http/Controllers/Employee/EventController.php:424
* @route '/employee/detail/{event}/waitlist-offer/decline'
*/
declineForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decline.url(args, options),
    method: 'post',
})

decline.form = declineForm

const waitlistOffer = {
    accept: Object.assign(accept, accept),
    decline: Object.assign(decline, decline),
}

export default waitlistOffer