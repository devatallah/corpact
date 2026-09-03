import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Employee\TemplateController::index
* @see app/Http/Controllers/Employee/TemplateController.php:32
* @route '/employee/community/{community}/templates'
*/
export const index = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/employee/community/{community}/templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Employee\TemplateController::index
* @see app/Http/Controllers/Employee/TemplateController.php:32
* @route '/employee/community/{community}/templates'
*/
index.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\TemplateController::index
* @see app/Http/Controllers/Employee/TemplateController.php:32
* @route '/employee/community/{community}/templates'
*/
index.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::index
* @see app/Http/Controllers/Employee/TemplateController.php:32
* @route '/employee/community/{community}/templates'
*/
index.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::index
* @see app/Http/Controllers/Employee/TemplateController.php:32
* @route '/employee/community/{community}/templates'
*/
const indexForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::index
* @see app/Http/Controllers/Employee/TemplateController.php:32
* @route '/employee/community/{community}/templates'
*/
indexForm.get = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::index
* @see app/Http/Controllers/Employee/TemplateController.php:32
* @route '/employee/community/{community}/templates'
*/
indexForm.head = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Employee\TemplateController::store
* @see app/Http/Controllers/Employee/TemplateController.php:45
* @route '/employee/community/{community}/templates'
*/
export const store = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\TemplateController::store
* @see app/Http/Controllers/Employee/TemplateController.php:45
* @route '/employee/community/{community}/templates'
*/
store.url = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\TemplateController::store
* @see app/Http/Controllers/Employee/TemplateController.php:45
* @route '/employee/community/{community}/templates'
*/
store.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::store
* @see app/Http/Controllers/Employee/TemplateController.php:45
* @route '/employee/community/{community}/templates'
*/
const storeForm = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::store
* @see app/Http/Controllers/Employee/TemplateController.php:45
* @route '/employee/community/{community}/templates'
*/
storeForm.post = (args: { community: number | { id: number } } | [community: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Employee\TemplateController::update
* @see app/Http/Controllers/Employee/TemplateController.php:54
* @route '/employee/community/{community}/templates/{template}'
*/
export const update = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/employee/community/{community}/templates/{template}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Employee\TemplateController::update
* @see app/Http/Controllers/Employee/TemplateController.php:54
* @route '/employee/community/{community}/templates/{template}'
*/
update.url = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            template: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return update.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\TemplateController::update
* @see app/Http/Controllers/Employee/TemplateController.php:54
* @route '/employee/community/{community}/templates/{template}'
*/
update.patch = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::update
* @see app/Http/Controllers/Employee/TemplateController.php:54
* @route '/employee/community/{community}/templates/{template}'
*/
const updateForm = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::update
* @see app/Http/Controllers/Employee/TemplateController.php:54
* @route '/employee/community/{community}/templates/{template}'
*/
updateForm.patch = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Employee\TemplateController::pause
* @see app/Http/Controllers/Employee/TemplateController.php:64
* @route '/employee/community/{community}/templates/{template}/pause'
*/
export const pause = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pause.url(args, options),
    method: 'post',
})

pause.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/templates/{template}/pause',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\TemplateController::pause
* @see app/Http/Controllers/Employee/TemplateController.php:64
* @route '/employee/community/{community}/templates/{template}/pause'
*/
pause.url = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            template: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return pause.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\TemplateController::pause
* @see app/Http/Controllers/Employee/TemplateController.php:64
* @route '/employee/community/{community}/templates/{template}/pause'
*/
pause.post = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pause.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::pause
* @see app/Http/Controllers/Employee/TemplateController.php:64
* @route '/employee/community/{community}/templates/{template}/pause'
*/
const pauseForm = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pause.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::pause
* @see app/Http/Controllers/Employee/TemplateController.php:64
* @route '/employee/community/{community}/templates/{template}/pause'
*/
pauseForm.post = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pause.url(args, options),
    method: 'post',
})

pause.form = pauseForm

/**
* @see \App\Http\Controllers\Employee\TemplateController::resume
* @see app/Http/Controllers/Employee/TemplateController.php:74
* @route '/employee/community/{community}/templates/{template}/resume'
*/
export const resume = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resume.url(args, options),
    method: 'post',
})

resume.definition = {
    methods: ["post"],
    url: '/employee/community/{community}/templates/{template}/resume',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Employee\TemplateController::resume
* @see app/Http/Controllers/Employee/TemplateController.php:74
* @route '/employee/community/{community}/templates/{template}/resume'
*/
resume.url = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            community: args[0],
            template: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        community: typeof args.community === 'object'
        ? args.community.id
        : args.community,
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return resume.definition.url
            .replace('{community}', parsedArgs.community.toString())
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Employee\TemplateController::resume
* @see app/Http/Controllers/Employee/TemplateController.php:74
* @route '/employee/community/{community}/templates/{template}/resume'
*/
resume.post = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resume.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::resume
* @see app/Http/Controllers/Employee/TemplateController.php:74
* @route '/employee/community/{community}/templates/{template}/resume'
*/
const resumeForm = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resume.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Employee\TemplateController::resume
* @see app/Http/Controllers/Employee/TemplateController.php:74
* @route '/employee/community/{community}/templates/{template}/resume'
*/
resumeForm.post = (args: { community: number | { id: number }, template: number | { id: number } } | [community: number | { id: number }, template: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resume.url(args, options),
    method: 'post',
})

resume.form = resumeForm

const templates = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    pause: Object.assign(pause, pause),
    resume: Object.assign(resume, resume),
}

export default templates