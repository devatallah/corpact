import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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
* @see \App\Http\Controllers\Employee\CommunityController::postAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
export const postAnnouncement = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: postAnnouncement.url(args, options),
    method: 'post',
})

postAnnouncement.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/announcement',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::postAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
postAnnouncement.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return postAnnouncement.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::postAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
postAnnouncement.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: postAnnouncement.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::postAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
const postAnnouncementForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: postAnnouncement.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::postAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:226
* @route '/employee/community/{community}/announcement'
*/
postAnnouncementForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: postAnnouncement.url(args, options),
    method: 'post',
})

postAnnouncement.form = postAnnouncementForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::updateAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
export const updateAnnouncement = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateAnnouncement.url(args, options),
    method: 'patch',
})

updateAnnouncement.definition = {
    methods: ["patch"],
    url: '/employee/community/{community}/announcement/{announcement}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::updateAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
updateAnnouncement.url = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            announcement: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        announcement: typeof args.announcement === 'object'
        ? args.announcement.id
        : args.announcement,
    }

    return updateAnnouncement.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{announcement}', parsedArgs.announcement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::updateAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
updateAnnouncement.patch = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateAnnouncement.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::updateAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
const updateAnnouncementForm = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateAnnouncement.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::updateAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:240
* @route '/employee/community/{community}/announcement/{announcement}'
*/
updateAnnouncementForm.patch = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateAnnouncement.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateAnnouncement.form = updateAnnouncementForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
export const deleteAnnouncement = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAnnouncement.url(args, options),
    method: 'delete',
})

deleteAnnouncement.definition = {
    methods: ["delete"],
    url: '/employee/community/{community}/announcement/{announcement}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
deleteAnnouncement.url = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            announcement: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        announcement: typeof args.announcement === 'object'
        ? args.announcement.id
        : args.announcement,
    }

    return deleteAnnouncement.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{announcement}', parsedArgs.announcement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
deleteAnnouncement.delete = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteAnnouncement.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
const deleteAnnouncementForm = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteAnnouncement.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::deleteAnnouncement
* @see app/Http/Controllers/Employee/CommunityController.php:256
* @route '/employee/community/{community}/announcement/{announcement}'
*/
deleteAnnouncementForm.delete = (args: { community: number | { id: number }, announcement: number | { id: number } } | [community: number | { id: number }, announcement: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteAnnouncement.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteAnnouncement.form = deleteAnnouncementForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::removeMember
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
export const removeMember = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

removeMember.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/members/{member}/remove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::removeMember
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
removeMember.url = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return removeMember.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::removeMember
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
removeMember.post = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::removeMember
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
const removeMemberForm = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::removeMember
* @see app/Http/Controllers/Employee/CommunityController.php:152
* @route '/employee/community/{community}/members/{member}/remove'
*/
removeMemberForm.post = (args: { community: number | { id: number }, member: number | { id: number } } | [community: number | { id: number }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeMember.url(args, options),
    method: 'post',
})

removeMember.form = removeMemberForm

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
* @see \App\Http\Controllers\Employee\CommunityController::createPoll
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
export const createPoll = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createPoll.url(args, options),
    method: 'post',
})

createPoll.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/polls',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::createPoll
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
createPoll.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return createPoll.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::createPoll
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
createPoll.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createPoll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::createPoll
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
const createPollForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createPoll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::createPoll
* @see app/Http/Controllers/Employee/CommunityController.php:270
* @route '/employee/community/{community}/polls'
*/
createPollForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createPoll.url(args, options),
    method: 'post',
})

createPoll.form = createPollForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::votePoll
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
export const votePoll = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: votePoll.url(args, options),
    method: 'post',
})

votePoll.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/polls/{poll}/vote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::votePoll
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
votePoll.url = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            poll: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        poll: typeof args.poll === 'object'
        ? args.poll.id
        : args.poll,
    }

    return votePoll.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{poll}', parsedArgs.poll.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::votePoll
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
votePoll.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: votePoll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::votePoll
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
const votePollForm = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: votePoll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::votePoll
* @see app/Http/Controllers/Employee/CommunityController.php:304
* @route '/employee/community/{community}/polls/{poll}/vote'
*/
votePollForm.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: votePoll.url(args, options),
    method: 'post',
})

votePoll.form = votePollForm

/**
* @see \App\Http\Controllers\Employee\CommunityController::closePoll
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
export const closePoll = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: closePoll.url(args, options),
    method: 'post',
})

closePoll.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/polls/{poll}/close',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\CommunityController::closePoll
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
closePoll.url = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            poll: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        poll: typeof args.poll === 'object'
        ? args.poll.id
        : args.poll,
    }

    return closePoll.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{poll}', parsedArgs.poll.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\CommunityController::closePoll
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
closePoll.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: closePoll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::closePoll
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
const closePollForm = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: closePoll.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\CommunityController::closePoll
* @see app/Http/Controllers/Employee/CommunityController.php:323
* @route '/employee/community/{community}/polls/{poll}/close'
*/
closePollForm.post = (args: { community: number | { id: number }, poll: number | { id: number } } | [community: number | { id: number }, poll: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: closePoll.url(args, options),
    method: 'post',
})

closePoll.form = closePollForm

const CommunityController = { index, show, join, leave, postAnnouncement, updateAnnouncement, deleteAnnouncement, removeMember, invite, transferLeadership, stepDown, createPoll, votePoll, closePoll }

export default CommunityController