import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\NotificationPreferenceController::update
* @see app/Http/Controllers/Employee/NotificationPreferenceController.php:21
* @route '/employee/profile/notification-preferences'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/employee/profile/notification-preferences',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Employee\NotificationPreferenceController::update
* @see app/Http/Controllers/Employee/NotificationPreferenceController.php:21
* @route '/employee/profile/notification-preferences'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\NotificationPreferenceController::update
* @see app/Http/Controllers/Employee/NotificationPreferenceController.php:21
* @route '/employee/profile/notification-preferences'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Employee\NotificationPreferenceController::update
* @see app/Http/Controllers/Employee/NotificationPreferenceController.php:21
* @route '/employee/profile/notification-preferences'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\NotificationPreferenceController::update
* @see app/Http/Controllers/Employee/NotificationPreferenceController.php:21
* @route '/employee/profile/notification-preferences'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const notificationPreferences = {
    update: Object.assign(update, update),
}

export default notificationPreferences