import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/terms'
*/
const ViewController619dc3a99425f668ea9cab64e6648cb4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'get',
})

ViewController619dc3a99425f668ea9cab64e6648cb4.definition = {
    methods: ["get","head"],
    url: '/terms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/terms'
*/
ViewController619dc3a99425f668ea9cab64e6648cb4.url = (options?: RouteQueryOptions) => {
    return ViewController619dc3a99425f668ea9cab64e6648cb4.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/terms'
*/
ViewController619dc3a99425f668ea9cab64e6648cb4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/terms'
*/
ViewController619dc3a99425f668ea9cab64e6648cb4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/terms'
*/
const ViewController619dc3a99425f668ea9cab64e6648cb4Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/terms'
*/
ViewController619dc3a99425f668ea9cab64e6648cb4Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/terms'
*/
ViewController619dc3a99425f668ea9cab64e6648cb4Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController619dc3a99425f668ea9cab64e6648cb4.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController619dc3a99425f668ea9cab64e6648cb4.form = ViewController619dc3a99425f668ea9cab64e6648cb4Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/privacy'
*/
const ViewControllera2c058616aeb0c9393ca03a98bc05c02 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

ViewControllera2c058616aeb0c9393ca03a98bc05c02.definition = {
    methods: ["get","head"],
    url: '/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/privacy'
*/
ViewControllera2c058616aeb0c9393ca03a98bc05c02.url = (options?: RouteQueryOptions) => {
    return ViewControllera2c058616aeb0c9393ca03a98bc05c02.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/privacy'
*/
ViewControllera2c058616aeb0c9393ca03a98bc05c02.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/privacy'
*/
ViewControllera2c058616aeb0c9393ca03a98bc05c02.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/privacy'
*/
const ViewControllera2c058616aeb0c9393ca03a98bc05c02Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/privacy'
*/
ViewControllera2c058616aeb0c9393ca03a98bc05c02Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllera2c058616aeb0c9393ca03a98bc05c02.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/privacy'
*/
ViewControllera2c058616aeb0c9393ca03a98bc05c02Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllera2c058616aeb0c9393ca03a98bc05c02.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewControllera2c058616aeb0c9393ca03a98bc05c02.form = ViewControllera2c058616aeb0c9393ca03a98bc05c02Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/support'
*/
const ViewController5d77483ae26e2ccf08c0552f82051403 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController5d77483ae26e2ccf08c0552f82051403.url(options),
    method: 'get',
})

ViewController5d77483ae26e2ccf08c0552f82051403.definition = {
    methods: ["get","head"],
    url: '/support',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/support'
*/
ViewController5d77483ae26e2ccf08c0552f82051403.url = (options?: RouteQueryOptions) => {
    return ViewController5d77483ae26e2ccf08c0552f82051403.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/support'
*/
ViewController5d77483ae26e2ccf08c0552f82051403.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController5d77483ae26e2ccf08c0552f82051403.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/support'
*/
ViewController5d77483ae26e2ccf08c0552f82051403.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController5d77483ae26e2ccf08c0552f82051403.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/support'
*/
const ViewController5d77483ae26e2ccf08c0552f82051403Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController5d77483ae26e2ccf08c0552f82051403.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/support'
*/
ViewController5d77483ae26e2ccf08c0552f82051403Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController5d77483ae26e2ccf08c0552f82051403.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/support'
*/
ViewController5d77483ae26e2ccf08c0552f82051403Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController5d77483ae26e2ccf08c0552f82051403.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController5d77483ae26e2ccf08c0552f82051403.form = ViewController5d77483ae26e2ccf08c0552f82051403Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/packages'
*/
const ViewController55c72db6241781e72380cd5f32e4d49f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController55c72db6241781e72380cd5f32e4d49f.url(options),
    method: 'get',
})

ViewController55c72db6241781e72380cd5f32e4d49f.definition = {
    methods: ["get","head"],
    url: '/packages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/packages'
*/
ViewController55c72db6241781e72380cd5f32e4d49f.url = (options?: RouteQueryOptions) => {
    return ViewController55c72db6241781e72380cd5f32e4d49f.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/packages'
*/
ViewController55c72db6241781e72380cd5f32e4d49f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController55c72db6241781e72380cd5f32e4d49f.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/packages'
*/
ViewController55c72db6241781e72380cd5f32e4d49f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController55c72db6241781e72380cd5f32e4d49f.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/packages'
*/
const ViewController55c72db6241781e72380cd5f32e4d49fForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController55c72db6241781e72380cd5f32e4d49f.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/packages'
*/
ViewController55c72db6241781e72380cd5f32e4d49fForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController55c72db6241781e72380cd5f32e4d49f.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/packages'
*/
ViewController55c72db6241781e72380cd5f32e4d49fForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController55c72db6241781e72380cd5f32e4d49f.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController55c72db6241781e72380cd5f32e4d49f.form = ViewController55c72db6241781e72380cd5f32e4d49fForm
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/about'
*/
const ViewController535fd093ca1d5254af5dc12ac208e8d5 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController535fd093ca1d5254af5dc12ac208e8d5.url(options),
    method: 'get',
})

ViewController535fd093ca1d5254af5dc12ac208e8d5.definition = {
    methods: ["get","head"],
    url: '/about',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/about'
*/
ViewController535fd093ca1d5254af5dc12ac208e8d5.url = (options?: RouteQueryOptions) => {
    return ViewController535fd093ca1d5254af5dc12ac208e8d5.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/about'
*/
ViewController535fd093ca1d5254af5dc12ac208e8d5.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController535fd093ca1d5254af5dc12ac208e8d5.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/about'
*/
ViewController535fd093ca1d5254af5dc12ac208e8d5.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController535fd093ca1d5254af5dc12ac208e8d5.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/about'
*/
const ViewController535fd093ca1d5254af5dc12ac208e8d5Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController535fd093ca1d5254af5dc12ac208e8d5.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/about'
*/
ViewController535fd093ca1d5254af5dc12ac208e8d5Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController535fd093ca1d5254af5dc12ac208e8d5.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/about'
*/
ViewController535fd093ca1d5254af5dc12ac208e8d5Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController535fd093ca1d5254af5dc12ac208e8d5.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController535fd093ca1d5254af5dc12ac208e8d5.form = ViewController535fd093ca1d5254af5dc12ac208e8d5Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/blog'
*/
const ViewController0281689d11c3db12eb0f0bc21b3e4ed4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

ViewController0281689d11c3db12eb0f0bc21b3e4ed4.definition = {
    methods: ["get","head"],
    url: '/blog',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/blog'
*/
ViewController0281689d11c3db12eb0f0bc21b3e4ed4.url = (options?: RouteQueryOptions) => {
    return ViewController0281689d11c3db12eb0f0bc21b3e4ed4.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/blog'
*/
ViewController0281689d11c3db12eb0f0bc21b3e4ed4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/blog'
*/
ViewController0281689d11c3db12eb0f0bc21b3e4ed4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/blog'
*/
const ViewController0281689d11c3db12eb0f0bc21b3e4ed4Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/blog'
*/
ViewController0281689d11c3db12eb0f0bc21b3e4ed4Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController0281689d11c3db12eb0f0bc21b3e4ed4.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/blog'
*/
ViewController0281689d11c3db12eb0f0bc21b3e4ed4Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController0281689d11c3db12eb0f0bc21b3e4ed4.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController0281689d11c3db12eb0f0bc21b3e4ed4.form = ViewController0281689d11c3db12eb0f0bc21b3e4ed4Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
const ViewController980bb49ee7ae63891f1d891d2fbcf1c9 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

ViewController980bb49ee7ae63891f1d891d2fbcf1c9.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
ViewController980bb49ee7ae63891f1d891d2fbcf1c9.url = (options?: RouteQueryOptions) => {
    return ViewController980bb49ee7ae63891f1d891d2fbcf1c9.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
ViewController980bb49ee7ae63891f1d891d2fbcf1c9.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
ViewController980bb49ee7ae63891f1d891d2fbcf1c9.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
const ViewController980bb49ee7ae63891f1d891d2fbcf1c9Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
ViewController980bb49ee7ae63891f1d891d2fbcf1c9Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/'
*/
ViewController980bb49ee7ae63891f1d891d2fbcf1c9Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController980bb49ee7ae63891f1d891d2fbcf1c9.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController980bb49ee7ae63891f1d891d2fbcf1c9.form = ViewController980bb49ee7ae63891f1d891d2fbcf1c9Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
const ViewControllere280bd4480a1a407d040b2ba05691060 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'get',
})

ViewControllere280bd4480a1a407d040b2ba05691060.definition = {
    methods: ["get","head"],
    url: '/how-it-works',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
ViewControllere280bd4480a1a407d040b2ba05691060.url = (options?: RouteQueryOptions) => {
    return ViewControllere280bd4480a1a407d040b2ba05691060.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
ViewControllere280bd4480a1a407d040b2ba05691060.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
ViewControllere280bd4480a1a407d040b2ba05691060.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewControllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
const ViewControllere280bd4480a1a407d040b2ba05691060Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
ViewControllere280bd4480a1a407d040b2ba05691060Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllere280bd4480a1a407d040b2ba05691060.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/how-it-works'
*/
ViewControllere280bd4480a1a407d040b2ba05691060Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllere280bd4480a1a407d040b2ba05691060.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewControllere280bd4480a1a407d040b2ba05691060.form = ViewControllere280bd4480a1a407d040b2ba05691060Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
const ViewControllera7f461935e614e7cfd42921028d82a8c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllera7f461935e614e7cfd42921028d82a8c.url(options),
    method: 'get',
})

ViewControllera7f461935e614e7cfd42921028d82a8c.definition = {
    methods: ["get","head"],
    url: '/for-companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
ViewControllera7f461935e614e7cfd42921028d82a8c.url = (options?: RouteQueryOptions) => {
    return ViewControllera7f461935e614e7cfd42921028d82a8c.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
ViewControllera7f461935e614e7cfd42921028d82a8c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllera7f461935e614e7cfd42921028d82a8c.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
ViewControllera7f461935e614e7cfd42921028d82a8c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewControllera7f461935e614e7cfd42921028d82a8c.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
const ViewControllera7f461935e614e7cfd42921028d82a8cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllera7f461935e614e7cfd42921028d82a8c.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
ViewControllera7f461935e614e7cfd42921028d82a8cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllera7f461935e614e7cfd42921028d82a8c.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-companies'
*/
ViewControllera7f461935e614e7cfd42921028d82a8cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllera7f461935e614e7cfd42921028d82a8c.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewControllera7f461935e614e7cfd42921028d82a8c.form = ViewControllera7f461935e614e7cfd42921028d82a8cForm
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
const ViewControllerc39623e4f92a326f349ad51a66a6002a = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllerc39623e4f92a326f349ad51a66a6002a.url(options),
    method: 'get',
})

ViewControllerc39623e4f92a326f349ad51a66a6002a.definition = {
    methods: ["get","head"],
    url: '/for-providers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
ViewControllerc39623e4f92a326f349ad51a66a6002a.url = (options?: RouteQueryOptions) => {
    return ViewControllerc39623e4f92a326f349ad51a66a6002a.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
ViewControllerc39623e4f92a326f349ad51a66a6002a.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllerc39623e4f92a326f349ad51a66a6002a.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
ViewControllerc39623e4f92a326f349ad51a66a6002a.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewControllerc39623e4f92a326f349ad51a66a6002a.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
const ViewControllerc39623e4f92a326f349ad51a66a6002aForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllerc39623e4f92a326f349ad51a66a6002a.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
ViewControllerc39623e4f92a326f349ad51a66a6002aForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllerc39623e4f92a326f349ad51a66a6002a.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/for-providers'
*/
ViewControllerc39623e4f92a326f349ad51a66a6002aForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllerc39623e4f92a326f349ad51a66a6002a.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewControllerc39623e4f92a326f349ad51a66a6002a.form = ViewControllerc39623e4f92a326f349ad51a66a6002aForm
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
const ViewControllerf286f0bb17f25b1a68a9c0f56f396f44 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.url(options),
    method: 'get',
})

ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.definition = {
    methods: ["get","head"],
    url: '/activities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.url = (options?: RouteQueryOptions) => {
    return ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
const ViewControllerf286f0bb17f25b1a68a9c0f56f396f44Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
ViewControllerf286f0bb17f25b1a68a9c0f56f396f44Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/activities'
*/
ViewControllerf286f0bb17f25b1a68a9c0f56f396f44Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewControllerf286f0bb17f25b1a68a9c0f56f396f44.form = ViewControllerf286f0bb17f25b1a68a9c0f56f396f44Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
const ViewController34d5f887d5ee727ffcc35e89c620d180 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController34d5f887d5ee727ffcc35e89c620d180.url(options),
    method: 'get',
})

ViewController34d5f887d5ee727ffcc35e89c620d180.definition = {
    methods: ["get","head"],
    url: '/model',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
ViewController34d5f887d5ee727ffcc35e89c620d180.url = (options?: RouteQueryOptions) => {
    return ViewController34d5f887d5ee727ffcc35e89c620d180.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
ViewController34d5f887d5ee727ffcc35e89c620d180.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController34d5f887d5ee727ffcc35e89c620d180.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
ViewController34d5f887d5ee727ffcc35e89c620d180.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController34d5f887d5ee727ffcc35e89c620d180.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
const ViewController34d5f887d5ee727ffcc35e89c620d180Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController34d5f887d5ee727ffcc35e89c620d180.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
ViewController34d5f887d5ee727ffcc35e89c620d180Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController34d5f887d5ee727ffcc35e89c620d180.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/model'
*/
ViewController34d5f887d5ee727ffcc35e89c620d180Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController34d5f887d5ee727ffcc35e89c620d180.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController34d5f887d5ee727ffcc35e89c620d180.form = ViewController34d5f887d5ee727ffcc35e89c620d180Form
/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
const ViewController36402f3b102b68b92616e946647e00cf = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController36402f3b102b68b92616e946647e00cf.url(options),
    method: 'get',
})

ViewController36402f3b102b68b92616e946647e00cf.definition = {
    methods: ["get","head"],
    url: '/contact',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
ViewController36402f3b102b68b92616e946647e00cf.url = (options?: RouteQueryOptions) => {
    return ViewController36402f3b102b68b92616e946647e00cf.definition.url + queryParams(options)
}

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
ViewController36402f3b102b68b92616e946647e00cf.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ViewController36402f3b102b68b92616e946647e00cf.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
ViewController36402f3b102b68b92616e946647e00cf.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ViewController36402f3b102b68b92616e946647e00cf.url(options),
    method: 'head',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
const ViewController36402f3b102b68b92616e946647e00cfForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController36402f3b102b68b92616e946647e00cf.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
ViewController36402f3b102b68b92616e946647e00cfForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController36402f3b102b68b92616e946647e00cf.url(options),
    method: 'get',
})

/**
* @see \Illuminate\Routing\ViewController::__invoke
* @see vendor/laravel/framework/src/Illuminate/Routing/ViewController.php:32
* @route '/contact'
*/
ViewController36402f3b102b68b92616e946647e00cfForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ViewController36402f3b102b68b92616e946647e00cf.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ViewController36402f3b102b68b92616e946647e00cf.form = ViewController36402f3b102b68b92616e946647e00cfForm

const ViewController = {
    '/terms': ViewController619dc3a99425f668ea9cab64e6648cb4,
    '/privacy': ViewControllera2c058616aeb0c9393ca03a98bc05c02,
    '/support': ViewController5d77483ae26e2ccf08c0552f82051403,
    '/packages': ViewController55c72db6241781e72380cd5f32e4d49f,
    '/about': ViewController535fd093ca1d5254af5dc12ac208e8d5,
    '/blog': ViewController0281689d11c3db12eb0f0bc21b3e4ed4,
    '/': ViewController980bb49ee7ae63891f1d891d2fbcf1c9,
    '/how-it-works': ViewControllere280bd4480a1a407d040b2ba05691060,
    '/for-companies': ViewControllera7f461935e614e7cfd42921028d82a8c,
    '/for-providers': ViewControllerc39623e4f92a326f349ad51a66a6002a,
    '/activities': ViewControllerf286f0bb17f25b1a68a9c0f56f396f44,
    '/model': ViewController34d5f887d5ee727ffcc35e89c620d180,
    '/contact': ViewController36402f3b102b68b92616e946647e00cf,
}

export default ViewController