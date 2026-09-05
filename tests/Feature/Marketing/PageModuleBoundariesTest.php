<?php

use Symfony\Component\Finder\Finder;

/**
 * كل صفحة على القرص لها مدخل في بيان Vite.
 *
 * `pages/partner/venues/edit.tsx` كان يستورد ثابتاً من صفحة القائمة، فصارت
 * القائمة تبعيةً لصفحة أخرى: طواها Rollup في حزمة مشتركة فسقط مدخلها من
 * البيان، وصار `/partner/venues` يردّ 500 في كل نشر مبنيّ. خادم التطوير لا
 * يقرأ البيان أصلاً، فالعطل لا يظهر إلا بعد النشر — وهذا ما يجعله جديراً
 * باختبار.
 */
test('every Inertia page has an entry in the built Vite manifest', function () {
    $manifest = public_path('build/manifest.json');

    if (! file_exists($manifest)) {
        $this->markTestSkipped('لا يوجد بناء — شغّل `npm run build` أولاً.');
    }

    $entries = array_keys(json_decode(file_get_contents($manifest), true));

    $missing = [];

    foreach (Finder::create()->files()->in(resource_path('js/pages'))->name('*.tsx') as $file) {
        $relative = str_replace(base_path().'/', '', $file->getPathname());

        if (! in_array($relative, $entries, true)) {
            $missing[] = $relative;
        }
    }

    expect($missing)->toBe([]);
});

/**
 * صفحة لا تستورد من صفحة — قاعدة بلا استثناءات.
 *
 * كانت هنا قائمة بثمانية استثناءات قائمة، أُفرغت بنقل كل مُصدَّر مشترك إلى
 * موضعه: مفردات الحالات في `lib/status.ts`، والمكوّنات في `components/`.
 * القائمة الفارغة هي المقصد — كل سطر كان فيها صفحةً قد تسقط من بيان Vite
 * متى غيّر Rollup تقسيمه.
 */
test('no page imports another page', function () {
    $offenders = [];

    foreach (Finder::create()->files()->in(resource_path('js/pages'))->name('*.tsx') as $file) {
        if (preg_match("#from '@/pages/#", (string) file_get_contents($file->getPathname()))) {
            $offenders[] = str_replace(base_path().'/', '', $file->getPathname());
        }
    }

    expect($offenders)->toBe([]);
});

/**
 * الشريط الجانبي على الهاتف يخرج من جهة البداية.
 *
 * `translate-x-full` إزاحة فيزيائية موجبة لا تنقلب مع اتجاه الصفحة. وتثبيت
 * الدرج على `end` يعني في RTL الحافة اليسرى، فإخفاؤه كان يدفعه **إلى داخل**
 * الشاشة بدل أن يخرجه منها — درجٌ مغلق يحجب ثلث الصفحة. الاختبار يمنع عودة
 * الصنف لأن العطل لا يظهر إلا بعرض هاتف وباتجاه RTL معاً.
 */
test('the mobile drawer is anchored to the start edge, never the end', function () {
    $sidebar = file_get_contents(resource_path('js/components/portal-sidebar.tsx'));

    expect($sidebar)->toContain('max-lg:start-0')
        ->and($sidebar)->not->toContain('max-lg:end-0');
});

/**
 * أزرار ترويسة الصفحة تلتفّ على الشاشات الصغيرة.
 *
 * `shrink-0` بلا التفاف كان يدفعها خارج الشاشة فيتمدّد المستند ويظهر تمرير
 * أفقي في كل صفحة لها أكثر من زر — وهو مكوّن مشترك، فالعطل كان في كل بوابة.
 */
test('page header actions wrap instead of overflowing the phone', function () {
    $ui = file_get_contents(resource_path('js/components/portal/ui.tsx'));

    expect($ui)->toContain('flex flex-wrap items-center gap-2 sm:shrink-0');
});
