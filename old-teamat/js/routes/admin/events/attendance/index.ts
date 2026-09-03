import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AttendanceController::update
* @see app/Http/Controllers/Admin/AttendanceController.php:23
* @route '/admin/events/{event}/attendance/{employee}'
*/
export const update = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/admin/events/{event}/attendance/{employee}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AttendanceController::update
* @see app/Http/Controllers/Admin/AttendanceController.php:23
* @route '/admin/events/{event}/attendance/{employee}'
*/
update.url = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{event}', parsedArgs.event.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AttendanceController::update
* @see app/Http/Controllers/Admin/AttendanceController.php:23
* @route '/admin/events/{event}/attendance/{employee}'
*/
update.post = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AttendanceController::update
* @see app/Http/Controllers/Admin/AttendanceController.php:23
* @route '/admin/events/{event}/attendance/{employee}'
*/
const updateForm = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AttendanceController::update
* @see app/Http/Controllers/Admin/AttendanceController.php:23
* @route '/admin/events/{event}/attendance/{employee}'
*/
updateForm.post = (args: { event: number | { id: number }, employee: number | { id: number } } | [event: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, options),
    method: 'post',
})

update.form = updateForm

const attendance = {
    update: Object.assign(update, update),
}

export default attendance