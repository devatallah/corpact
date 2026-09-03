import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Partner\ScheduleController::index
* @see app/Http/Controllers/Partner/ScheduleController.php:24
* @route '/partner/schedule'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/partner/schedule',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Partner\ScheduleController::index
* @see app/Http/Controllers/Partner/ScheduleController.php:24
* @route '/partner/schedule'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ScheduleController::index
* @see app/Http/Controllers/Partner/ScheduleController.php:24
* @route '/partner/schedule'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::index
* @see app/Http/Controllers/Partner/ScheduleController.php:24
* @route '/partner/schedule'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::index
* @see app/Http/Controllers/Partner/ScheduleController.php:24
* @route '/partner/schedule'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::index
* @see app/Http/Controllers/Partner/ScheduleController.php:24
* @route '/partner/schedule'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::index
* @see app/Http/Controllers/Partner/ScheduleController.php:24
* @route '/partner/schedule'
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
* @see \App\Http\Controllers\Partner\ScheduleController::store
* @see app/Http/Controllers/Partner/ScheduleController.php:44
* @route '/partner/schedule'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/partner/schedule',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Partner\ScheduleController::store
* @see app/Http/Controllers/Partner/ScheduleController.php:44
* @route '/partner/schedule'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ScheduleController::store
* @see app/Http/Controllers/Partner/ScheduleController.php:44
* @route '/partner/schedule'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::store
* @see app/Http/Controllers/Partner/ScheduleController.php:44
* @route '/partner/schedule'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::store
* @see app/Http/Controllers/Partner/ScheduleController.php:44
* @route '/partner/schedule'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Partner\ScheduleController::update
* @see app/Http/Controllers/Partner/ScheduleController.php:56
* @route '/partner/schedule/{slot}'
*/
export const update = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/partner/schedule/{slot}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Partner\ScheduleController::update
* @see app/Http/Controllers/Partner/ScheduleController.php:56
* @route '/partner/schedule/{slot}'
*/
update.url = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slot: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { slot: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            slot: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        slot: typeof args.slot === 'object'
        ? args.slot.id
        : args.slot,
    }

    return update.definition.url
            .replace('{slot}', parsedArgs.slot.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ScheduleController::update
* @see app/Http/Controllers/Partner/ScheduleController.php:56
* @route '/partner/schedule/{slot}'
*/
update.put = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::update
* @see app/Http/Controllers/Partner/ScheduleController.php:56
* @route '/partner/schedule/{slot}'
*/
const updateForm = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::update
* @see app/Http/Controllers/Partner/ScheduleController.php:56
* @route '/partner/schedule/{slot}'
*/
updateForm.put = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Partner\ScheduleController::destroy
* @see app/Http/Controllers/Partner/ScheduleController.php:68
* @route '/partner/schedule/{slot}'
*/
export const destroy = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/partner/schedule/{slot}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Partner\ScheduleController::destroy
* @see app/Http/Controllers/Partner/ScheduleController.php:68
* @route '/partner/schedule/{slot}'
*/
destroy.url = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slot: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { slot: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            slot: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        slot: typeof args.slot === 'object'
        ? args.slot.id
        : args.slot,
    }

    return destroy.definition.url
            .replace('{slot}', parsedArgs.slot.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Partner\ScheduleController::destroy
* @see app/Http/Controllers/Partner/ScheduleController.php:68
* @route '/partner/schedule/{slot}'
*/
destroy.delete = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::destroy
* @see app/Http/Controllers/Partner/ScheduleController.php:68
* @route '/partner/schedule/{slot}'
*/
const destroyForm = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Partner\ScheduleController::destroy
* @see app/Http/Controllers/Partner/ScheduleController.php:68
* @route '/partner/schedule/{slot}'
*/
destroyForm.delete = (args: { slot: number | { id: number } } | [slot: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const schedule = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default schedule