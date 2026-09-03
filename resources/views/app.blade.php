<!DOCTYPE html>
{{--
    The single Inertia root — marketing and portals alike.

    Arabic RTL at the document element, deliberately: the previous shell shipped
    `lang="{{ app()->getLocale() }}"` with APP_LOCALE=en and no `dir` at all, so
    every logical property in the product resolved the wrong way round.

    No dark-mode detection either. teamat is one light design, and the old
    script could put `.dark` on <html> against a palette with no dark values.
--}}
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#0A0A0A">

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'تيمات') }}</title>
        </x-inertia::head>
    </head>
    <body class="min-h-screen bg-page text-ink font-arabic antialiased selection:bg-lime selection:text-ink">
        <x-inertia::app />
    </body>
</html>
