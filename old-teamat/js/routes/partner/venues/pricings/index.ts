import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:121
* @route '/partner/venues/{venue}/pricings'
*/
export const store = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/partner/venues/{venue}/pricings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:121
* @route '/partner/venues/{venue}/pricings'
*/
store.url = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { venue: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { venue: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            venue: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        venue: typeof args.venue === 'object'
        ? args.venue.id
        : args.venue,
    }

    return store.definition.url
            .replace('{venue}', parsedArgs.venue.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:121
* @route '/partner/venues/{venue}/pricings'
*/
store.post = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:121
* @route '/partner/venues/{venue}/pricings'
*/
const storeForm = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:121
* @route '/partner/venues/{venue}/pricings'
*/
storeForm.post = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:144
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
export const update = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/partner/venues/{venue}/pricings/{pricing}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:144
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
update.url = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            venue: args[0],
            pricing: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        venue: typeof args.venue === 'object'
        ? args.venue.id
        : args.venue,
        pricing: typeof args.pricing === 'object'
        ? args.pricing.id
        : args.pricing,
    }

    return update.definition.url
            .replace('{venue}', parsedArgs.venue.toString())
            .replace('{pricing}', parsedArgs.pricing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:144
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
update.put = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:144
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
const updateForm = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:144
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
updateForm.put = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Partner\VenueController::toggle
* @see app/Http/Controllers/Partner/VenueController.php:167
* @route '/partner/venues/{venue}/pricings/{pricing}/toggle'
*/
export const toggle = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/partner/venues/{venue}/pricings/{pricing}/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::toggle
* @see app/Http/Controllers/Partner/VenueController.php:167
* @route '/partner/venues/{venue}/pricings/{pricing}/toggle'
*/
toggle.url = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            venue: args[0],
            pricing: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        venue: typeof args.venue === 'object'
        ? args.venue.id
        : args.venue,
        pricing: typeof args.pricing === 'object'
        ? args.pricing.id
        : args.pricing,
    }

    return toggle.definition.url
            .replace('{venue}', parsedArgs.venue.toString())
            .replace('{pricing}', parsedArgs.pricing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::toggle
* @see app/Http/Controllers/Partner/VenueController.php:167
* @route '/partner/venues/{venue}/pricings/{pricing}/toggle'
*/
toggle.post = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::toggle
* @see app/Http/Controllers/Partner/VenueController.php:167
* @route '/partner/venues/{venue}/pricings/{pricing}/toggle'
*/
const toggleForm = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::toggle
* @see app/Http/Controllers/Partner/VenueController.php:167
* @route '/partner/venues/{venue}/pricings/{pricing}/toggle'
*/
toggleForm.post = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

toggle.form = toggleForm

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:185
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
export const destroy = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/partner/venues/{venue}/pricings/{pricing}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:185
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
destroy.url = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            venue: args[0],
            pricing: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        venue: typeof args.venue === 'object'
        ? args.venue.id
        : args.venue,
        pricing: typeof args.pricing === 'object'
        ? args.pricing.id
        : args.pricing,
    }

    return destroy.definition.url
            .replace('{venue}', parsedArgs.venue.toString())
            .replace('{pricing}', parsedArgs.pricing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:185
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
destroy.delete = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:185
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
const destroyForm = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:185
* @route '/partner/venues/{venue}/pricings/{pricing}'
*/
destroyForm.delete = (args: { venue: number | { id: number }, pricing: number | { id: number } } | [venue: number | { id: number }, pricing: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const pricings = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    toggle: Object.assign(toggle, toggle),
    destroy: Object.assign(destroy, destroy),
}

export default pricings