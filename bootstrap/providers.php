<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\HorizonServiceProvider;
use Laravel\Horizon\HorizonApplicationServiceProvider;

/*
 * Horizon اختياري: يُسجَّل مزوّده إن كانت الحزمة مثبَّتة، ويُتخطّى إن لم تكن.
 *
 * `HorizonServiceProvider` يرث صنفاً من الحزمة، فتسجيله بلا تثبيتها يُسقط
 * إقلاع التطبيق كله: كل أمر artisan يموت بـ«Failed to open stream»، ومنها
 * `wayfinder:generate` الذي يستدعيه بناء Vite — فينهار البناء برسالة
 * «Command failed» لا تذكر السبب.
 *
 * وهذا ما يحدث في أي بيئة سُحب فيها الكود قبل `composer install`: حاوية
 * قائمة، أو نشرٌ يبني الأصول قبل تحديث الاعتماديات. الغياب هنا يعطّل لوحة
 * الطوابير وحدها بدل أن يُسقط المنصة.
 *
 * `::class` على صنف غائب سلسلة تُحسب وقت الترجمة ولا تُحمّل شيئاً، والفحص
 * وحده هو ما يُشغّل المحمّل — فالملف آمن بلا الحزمة.
 */
return array_values(array_filter([
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    class_exists(HorizonApplicationServiceProvider::class)
        ? HorizonServiceProvider::class
        : null,
]));
