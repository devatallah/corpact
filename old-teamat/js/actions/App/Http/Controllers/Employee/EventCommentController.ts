import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\EventCommentController::store
* @see app/Http/Controllers/Employee/EventCommentController.php:21
* @route '/employee/detail/{event}/comments'
*/
export const store = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/detail/{event}/comments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventCommentController::store
* @see app/Http/Controllers/Employee/EventCommentController.php:21
* @route '/employee/detail/{event}/comments'
*/
store.url = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventCommentController::store
* @see app/Http/Controllers/Employee/EventCommentController.php:21
* @route '/employee/detail/{event}/comments'
*/
store.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::store
* @see app/Http/Controllers/Employee/EventCommentController.php:21
* @route '/employee/detail/{event}/comments'
*/
const storeForm = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::store
* @see app/Http/Controllers/Employee/EventCommentController.php:21
* @route '/employee/detail/{event}/comments'
*/
storeForm.post = (args: { event: number | { id: number } } | [event: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\EventCommentController::update
* @see app/Http/Controllers/Employee/EventCommentController.php:37
* @route '/employee/comments/{comment}'
*/
export const update = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/employee/comments/{comment}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Employee\EventCommentController::update
* @see app/Http/Controllers/Employee/EventCommentController.php:37
* @route '/employee/comments/{comment}'
*/
update.url = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { comment: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { comment: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            comment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        comment: typeof args.comment === 'object'
        ? args.comment.id
        : args.comment,
    }

    return update.definition.url
            .replace('{comment}', parsedArgs.comment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventCommentController::update
* @see app/Http/Controllers/Employee/EventCommentController.php:37
* @route '/employee/comments/{comment}'
*/
update.patch = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::update
* @see app/Http/Controllers/Employee/EventCommentController.php:37
* @route '/employee/comments/{comment}'
*/
const updateForm = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::update
* @see app/Http/Controllers/Employee/EventCommentController.php:37
* @route '/employee/comments/{comment}'
*/
updateForm.patch = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Employee\EventCommentController::destroy
* @see app/Http/Controllers/Employee/EventCommentController.php:53
* @route '/employee/comments/{comment}'
*/
export const destroy = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/employee/comments/{comment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Employee\EventCommentController::destroy
* @see app/Http/Controllers/Employee/EventCommentController.php:53
* @route '/employee/comments/{comment}'
*/
destroy.url = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { comment: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { comment: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            comment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        comment: typeof args.comment === 'object'
        ? args.comment.id
        : args.comment,
    }

    return destroy.definition.url
            .replace('{comment}', parsedArgs.comment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventCommentController::destroy
* @see app/Http/Controllers/Employee/EventCommentController.php:53
* @route '/employee/comments/{comment}'
*/
destroy.delete = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::destroy
* @see app/Http/Controllers/Employee/EventCommentController.php:53
* @route '/employee/comments/{comment}'
*/
const destroyForm = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::destroy
* @see app/Http/Controllers/Employee/EventCommentController.php:53
* @route '/employee/comments/{comment}'
*/
destroyForm.delete = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Employee\EventCommentController::report
* @see app/Http/Controllers/Employee/EventCommentController.php:62
* @route '/employee/comments/{comment}/report'
*/
export const report = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: report.url(args, options),
    method: 'post',
})

report.definition = {
    methods: ["post"],
    url: '/employee/comments/{comment}/report',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\EventCommentController::report
* @see app/Http/Controllers/Employee/EventCommentController.php:62
* @route '/employee/comments/{comment}/report'
*/
report.url = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { comment: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { comment: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            comment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        comment: typeof args.comment === 'object'
        ? args.comment.id
        : args.comment,
    }

    return report.definition.url
            .replace('{comment}', parsedArgs.comment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\EventCommentController::report
* @see app/Http/Controllers/Employee/EventCommentController.php:62
* @route '/employee/comments/{comment}/report'
*/
report.post = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: report.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::report
* @see app/Http/Controllers/Employee/EventCommentController.php:62
* @route '/employee/comments/{comment}/report'
*/
const reportForm = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: report.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\EventCommentController::report
* @see app/Http/Controllers/Employee/EventCommentController.php:62
* @route '/employee/comments/{comment}/report'
*/
reportForm.post = (args: { comment: number | { id: number } } | [comment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: report.url(args, options),
    method: 'post',
})

report.form = reportForm

const EventCommentController = { store, update, destroy, report }

export default EventCommentController