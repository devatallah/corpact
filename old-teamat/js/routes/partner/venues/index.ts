import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import pricings from './pricings'
/**
* @see \App\Http\Controllers\Partner\VenueController::index
* @see app/Http/Controllers/Partner/VenueController.php:31
* @route '/partner/venues'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/partner/venues',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::index
* @see app/Http/Controllers/Partner/VenueController.php:31
* @route '/partner/venues'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::index
* @see app/Http/Controllers/Partner/VenueController.php:31
* @route '/partner/venues'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::index
* @see app/Http/Controllers/Partner/VenueController.php:31
* @route '/partner/venues'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::index
* @see app/Http/Controllers/Partner/VenueController.php:31
* @route '/partner/venues'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::index
* @see app/Http/Controllers/Partner/VenueController.php:31
* @route '/partner/venues'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::index
* @see app/Http/Controllers/Partner/VenueController.php:31
* @route '/partner/venues'
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
* @see \App\Http\Controllers\Partner\VenueController::create
* @see app/Http/Controllers/Partner/VenueController.php:53
* @route '/partner/venues/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/partner/venues/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::create
* @see app/Http/Controllers/Partner/VenueController.php:53
* @route '/partner/venues/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::create
* @see app/Http/Controllers/Partner/VenueController.php:53
* @route '/partner/venues/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::create
* @see app/Http/Controllers/Partner/VenueController.php:53
* @route '/partner/venues/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::create
* @see app/Http/Controllers/Partner/VenueController.php:53
* @route '/partner/venues/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::create
* @see app/Http/Controllers/Partner/VenueController.php:53
* @route '/partner/venues/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::create
* @see app/Http/Controllers/Partner/VenueController.php:53
* @route '/partner/venues/create'
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
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:63
* @route '/partner/venues'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/partner/venues',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:63
* @route '/partner/venues'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:63
* @route '/partner/venues'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:63
* @route '/partner/venues'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::store
* @see app/Http/Controllers/Partner/VenueController.php:63
* @route '/partner/venues'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Partner\VenueController::edit
* @see app/Http/Controllers/Partner/VenueController.php:80
* @route '/partner/venues/{venue}/edit'
*/
export const edit = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/partner/venues/{venue}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::edit
* @see app/Http/Controllers/Partner/VenueController.php:80
* @route '/partner/venues/{venue}/edit'
*/
edit.url = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{venue}', parsedArgs.venue.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::edit
* @see app/Http/Controllers/Partner/VenueController.php:80
* @route '/partner/venues/{venue}/edit'
*/
edit.get = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::edit
* @see app/Http/Controllers/Partner/VenueController.php:80
* @route '/partner/venues/{venue}/edit'
*/
edit.head = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::edit
* @see app/Http/Controllers/Partner/VenueController.php:80
* @route '/partner/venues/{venue}/edit'
*/
const editForm = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::edit
* @see app/Http/Controllers/Partner/VenueController.php:80
* @route '/partner/venues/{venue}/edit'
*/
editForm.get = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::edit
* @see app/Http/Controllers/Partner/VenueController.php:80
* @route '/partner/venues/{venue}/edit'
*/
editForm.head = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:91
* @route '/partner/venues/{venue}'
*/
export const update = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/partner/venues/{venue}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:91
* @route '/partner/venues/{venue}'
*/
update.url = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{venue}', parsedArgs.venue.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:91
* @route '/partner/venues/{venue}'
*/
update.put = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:91
* @route '/partner/venues/{venue}'
*/
update.patch = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::update
* @see app/Http/Controllers/Partner/VenueController.php:91
* @route '/partner/venues/{venue}'
*/
const updateForm = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Partner/VenueController.php:91
* @route '/partner/venues/{venue}'
*/
updateForm.put = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Partner/VenueController.php:91
* @route '/partner/venues/{venue}'
*/
updateForm.patch = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:106
* @route '/partner/venues/{venue}'
*/
export const destroy = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/partner/venues/{venue}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:106
* @route '/partner/venues/{venue}'
*/
destroy.url = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{venue}', parsedArgs.venue.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:106
* @route '/partner/venues/{venue}'
*/
destroy.delete = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\VenueController::destroy
* @see app/Http/Controllers/Partner/VenueController.php:106
* @route '/partner/venues/{venue}'
*/
const destroyForm = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Partner/VenueController.php:106
* @route '/partner/venues/{venue}'
*/
destroyForm.delete = (args: { venue: number | { id: number } } | [venue: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const venues = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    pricings: Object.assign(pricings, pricings),
}

export default venues