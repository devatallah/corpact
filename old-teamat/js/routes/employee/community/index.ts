import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import announce55659f from './announce'
import members from './members'
import templates from './templates'
import polls from './polls'
/**
* @see \App\Http\Controllers\Employee\CommunityController::index
* @see app/Http/Controllers/Employee/CommunityController.php:38
* @route '/employee/community'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/community',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::index
* @see app/Http/Controllers/Employee/CommunityController.php:38
* @route '/employee/community'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::index
* @see app/Http/Controllers/Employee/CommunityController.php:38
* @route '/employee/community'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::index
* @see app/Http/Controllers/Employee/CommunityController.php:38
* @route '/employee/community'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::index
* @see app/Http/Controllers/Employee/CommunityController.php:38
* @route '/employee/community'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::index
* @see app/Http/Controllers/Employee/CommunityController.php:38
* @route '/employee/community'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::index
* @see app/Http/Controllers/Employee/CommunityController.php:38
* @route '/employee/community'
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
* @see \App\Http\Controllers\Employee\CommunityController::show
* @see app/Http/Controllers/Employee/CommunityController.php:59
* @route '/employee/community/{community}'
*/
export const show = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/employee/community/{community}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::show
* @see app/Http/Controllers/Employee/CommunityController.php:59
* @route '/employee/community/{community}'
*/
show.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return show.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::show
* @see app/Http/Controllers/Employee/CommunityController.php:59
* @route '/employee/community/{community}'
*/
show.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::show
* @see app/Http/Controllers/Employee/CommunityController.php:59
* @route '/employee/community/{community}'
*/
show.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::show
* @see app/Http/Controllers/Employee/CommunityController.php:59
* @route '/employee/community/{community}'
*/
const showForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::show
* @see app/Http/Controllers/Employee/CommunityController.php:59
* @route '/employee/community/{community}'
*/
showForm.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::show
* @see app/Http/Controllers/Employee/CommunityController.php:59
* @route '/employee/community/{community}'
*/
showForm.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Employee\CommunityController::join
* @see app/Http/Controllers/Employee/CommunityController.php:128
* @route '/employee/community/{community}/join'
*/
export const join = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

join.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::join
* @see app/Http/Controllers/Employee/CommunityController.php:128
* @route '/employee/community/{community}/join'
*/
join.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return join.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::join
* @see app/Http/Controllers/Employee/CommunityController.php:128
* @route '/employee/community/{community}/join'
*/
join.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::join
* @see app/Http/Controllers/Employee/CommunityController.php:128
* @route '/employee/community/{community}/join'
*/
const joinForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: join.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::join
* @see app/Http/Controllers/Employee/CommunityController.php:128
* @route '/employee/community/{community}/join'
*/
joinForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: join.url(args, options),
    method: 'post',
})

join.form = joinForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::leave
* @see app/Http/Controllers/Employee/CommunityController.php:140
* @route '/employee/community/{community}/leave'
*/
export const leave = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

leave.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/leave',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::leave
* @see app/Http/Controllers/Employee/CommunityController.php:140
* @route '/employee/community/{community}/leave'
*/
leave.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return leave.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::leave
* @see app/Http/Controllers/Employee/CommunityController.php:140
* @route '/employee/community/{community}/leave'
*/
leave.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::leave
* @see app/Http/Controllers/Employee/CommunityController.php:140
* @route '/employee/community/{community}/leave'
*/
const leaveForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: leave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::leave
* @see app/Http/Controllers/Employee/CommunityController.php:140
* @route '/employee/community/{community}/leave'
*/
leaveForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: leave.url(args, options),
    method: 'post',
})

leave.form = leaveForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::announce
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
export const announce = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: announce.url(args, options),
    method: 'post',
})

announce.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/announcement',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::announce
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
announce.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return announce.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::announce
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
announce.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: announce.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::announce
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
const announceForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: announce.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::announce
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
announceForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: announce.url(args, options),
    method: 'post',
})

announce.form = announceForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::invite
* @see app/Http/Controllers/Employee/CommunityController.php:173
* @route '/employee/community/{community}/invite'
*/
export const invite = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(args, options),
    method: 'post',
})

invite.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/invite',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::invite
* @see app/Http/Controllers/Employee/CommunityController.php:173
* @route '/employee/community/{community}/invite'
*/
invite.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return invite.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::invite
* @see app/Http/Controllers/Employee/CommunityController.php:173
* @route '/employee/community/{community}/invite'
*/
invite.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::invite
* @see app/Http/Controllers/Employee/CommunityController.php:173
* @route '/employee/community/{community}/invite'
*/
const inviteForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invite.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::invite
* @see app/Http/Controllers/Employee/CommunityController.php:173
* @route '/employee/community/{community}/invite'
*/
inviteForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invite.url(args, options),
    method: 'post',
})

invite.form = inviteForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::transferLeadership
* @see app/Http/Controllers/Employee/CommunityController.php:191
* @route '/employee/community/{community}/transfer-leadership'
*/
export const transferLeadership = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transferLeadership.url(args, options),
    method: 'post',
})

transferLeadership.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/transfer-leadership',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::transferLeadership
* @see app/Http/Controllers/Employee/CommunityController.php:191
* @route '/employee/community/{community}/transfer-leadership'
*/
transferLeadership.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return transferLeadership.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::transferLeadership
* @see app/Http/Controllers/Employee/CommunityController.php:191
* @route '/employee/community/{community}/transfer-leadership'
*/
transferLeadership.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transferLeadership.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::transferLeadership
* @see app/Http/Controllers/Employee/CommunityController.php:191
* @route '/employee/community/{community}/transfer-leadership'
*/
const transferLeadershipForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: transferLeadership.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::transferLeadership
* @see app/Http/Controllers/Employee/CommunityController.php:191
* @route '/employee/community/{community}/transfer-leadership'
*/
transferLeadershipForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: transferLeadership.url(args, options),
    method: 'post',
})

transferLeadership.form = transferLeadershipForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::stepDown
* @see app/Http/Controllers/Employee/CommunityController.php:212
* @route '/employee/community/{community}/step-down'
*/
export const stepDown = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stepDown.url(args, options),
    method: 'post',
})

stepDown.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/step-down',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::stepDown
* @see app/Http/Controllers/Employee/CommunityController.php:212
* @route '/employee/community/{community}/step-down'
*/
stepDown.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { community: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { community: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            community: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
    }

    return stepDown.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::stepDown
* @see app/Http/Controllers/Employee/CommunityController.php:212
* @route '/employee/community/{community}/step-down'
*/
stepDown.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stepDown.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::stepDown
* @see app/Http/Controllers/Employee/CommunityController.php:212
* @route '/employee/community/{community}/step-down'
*/
const stepDownForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stepDown.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::stepDown
* @see app/Http/Controllers/Employee/CommunityController.php:212
* @route '/employee/community/{community}/step-down'
*/
stepDownForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stepDown.url(args, options),
    method: 'post',
})

stepDown.form = stepDownForm

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
export const download = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/employee/community/{community}/exports/{exportKey}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
download.url = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            exportKey: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        exportKey: args.exportKey,
    }

    return download.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{exportKey}', parsedArgs.exportKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
download.get = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
download.head = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
const downloadForm = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
downloadForm.get = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\CommunityExportController::__invoke
* @see app/Http/Controllers/Employee/CommunityExportController.php:35
* @route '/employee/community/{community}/exports/{exportKey}'
*/
downloadForm.head = (args: { community: number | { id: number }, exportKey: string | number } | [community: number | { id: number }, exportKey: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

download.form = downloadForm

const community = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    join: Object.assign(join, join),
    leave: Object.assign(leave, leave),
    announce: Object.assign(announce, announce55659f),
    members: Object.assign(members, members),
    invite: Object.assign(invite, invite),
    transferLeadership: Object.assign(transferLeadership, transferLeadership),
    stepDown: Object.assign(stepDown, stepDown),
    templates: Object.assign(templates, templates),
    polls: Object.assign(polls, polls),
    download: Object.assign(download, download),
}

export default community