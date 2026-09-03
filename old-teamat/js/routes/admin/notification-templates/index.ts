import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::index
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:48
* @route '/admin/notification-templates'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/notification-templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::index
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:48
* @route '/admin/notification-templates'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::index
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:48
* @route '/admin/notification-templates'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::index
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:48
* @route '/admin/notification-templates'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::index
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:48
* @route '/admin/notification-templates'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::index
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:48
* @route '/admin/notification-templates'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::index
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:48
* @route '/admin/notification-templates'
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
* @see \App\Http\Controllers\Admin\NotificationTemplateController::update
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:93
* @route '/admin/notification-templates/{notificationTemplate}'
*/
export const update = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/notification-templates/{notificationTemplate}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::update
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:93
* @route '/admin/notification-templates/{notificationTemplate}'
*/
update.url = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notificationTemplate: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { notificationTemplate: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            notificationTemplate: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        notificationTemplate: typeof args.notificationTemplate === 'object'
        ? args.notificationTemplate.id
        : args.notificationTemplate,
    }

    return update.definition.url
            .replace('{notificationTemplate}', parsedArgs.notificationTemplate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::update
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:93
* @route '/admin/notification-templates/{notificationTemplate}'
*/
update.put = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::update
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:93
* @route '/admin/notification-templates/{notificationTemplate}'
*/
const updateForm = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::update
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:93
* @route '/admin/notification-templates/{notificationTemplate}'
*/
updateForm.put = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\NotificationTemplateController::preview
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:140
* @route '/admin/notification-templates/{notificationTemplate}/preview'
*/
export const preview = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/admin/notification-templates/{notificationTemplate}/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::preview
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:140
* @route '/admin/notification-templates/{notificationTemplate}/preview'
*/
preview.url = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notificationTemplate: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { notificationTemplate: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            notificationTemplate: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        notificationTemplate: typeof args.notificationTemplate === 'object'
        ? args.notificationTemplate.id
        : args.notificationTemplate,
    }

    return preview.definition.url
            .replace('{notificationTemplate}', parsedArgs.notificationTemplate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::preview
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:140
* @route '/admin/notification-templates/{notificationTemplate}/preview'
*/
preview.post = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::preview
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:140
* @route '/admin/notification-templates/{notificationTemplate}/preview'
*/
const previewForm = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: preview.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\NotificationTemplateController::preview
* @see app/Http/Controllers/Admin/NotificationTemplateController.php:140
* @route '/admin/notification-templates/{notificationTemplate}/preview'
*/
previewForm.post = (args: { notificationTemplate: number | { id: number } } | [notificationTemplate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: preview.url(args, options),
    method: 'post',
})

preview.form = previewForm

const notificationTemplates = {
    index: Object.assign(index, index),
    update: Object.assign(update, update),
    preview: Object.assign(preview, preview),
}

export default notificationTemplates