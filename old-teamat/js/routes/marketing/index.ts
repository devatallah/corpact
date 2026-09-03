import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
export const howItWorks = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: howItWorks.url(options),
    method: 'get',
})

howItWorks.definition = {
    methods: ["get","head"],
    url: '/how-it-works',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
howItWorks.url = (options?: RouteQueryOptions) => {
    return howItWorks.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
howItWorks.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: howItWorks.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
howItWorks.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: howItWorks.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
const howItWorksForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: howItWorks.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
howItWorksForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: howItWorks.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
howItWorksForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: howItWorks.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

howItWorks.form = howItWorksForm

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
export const forCompanies = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forCompanies.url(options),
    method: 'get',
})

forCompanies.definition = {
    methods: ["get","head"],
    url: '/for-companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
forCompanies.url = (options?: RouteQueryOptions) => {
    return forCompanies.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
forCompanies.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forCompanies.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
forCompanies.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forCompanies.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
const forCompaniesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: forCompanies.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
forCompaniesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: forCompanies.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
forCompaniesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: forCompanies.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

forCompanies.form = forCompaniesForm

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
export const forProviders = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forProviders.url(options),
    method: 'get',
})

forProviders.definition = {
    methods: ["get","head"],
    url: '/for-providers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
forProviders.url = (options?: RouteQueryOptions) => {
    return forProviders.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
forProviders.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forProviders.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
forProviders.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forProviders.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
const forProvidersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: forProviders.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
forProvidersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: forProviders.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
forProvidersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: forProviders.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

forProviders.form = forProvidersForm

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
export const activities = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activities.url(options),
    method: 'get',
})

activities.definition = {
    methods: ["get","head"],
    url: '/activities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
activities.url = (options?: RouteQueryOptions) => {
    return activities.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
activities.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activities.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
activities.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activities.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
const activitiesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activities.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
activitiesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activities.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
activitiesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activities.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

activities.form = activitiesForm

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
export const model = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: model.url(options),
    method: 'get',
})

model.definition = {
    methods: ["get","head"],
    url: '/model',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
model.url = (options?: RouteQueryOptions) => {
    return model.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
model.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: model.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
model.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: model.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
const modelForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: model.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
modelForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: model.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
modelForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: model.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

model.form = modelForm

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
export const contact = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contact.url(options),
    method: 'get',
})

contact.definition = {
    methods: ["get","head"],
    url: '/contact',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
contact.url = (options?: RouteQueryOptions) => {
    return contact.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
contact.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contact.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
contact.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contact.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
const contactForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contact.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
contactForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contact.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
contactForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contact.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

contact.form = contactForm

const marketing = {
    home: Object.assign(home, home),
    howItWorks: Object.assign(howItWorks, howItWorks),
    forCompanies: Object.assign(forCompanies, forCompanies),
    forProviders: Object.assign(forProviders, forProviders),
    activities: Object.assign(activities, activities),
    model: Object.assign(model, model),
    contact: Object.assign(contact, contact),
}

export default marketing