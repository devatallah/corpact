@extends('layouts.marketing', [
    'headerTheme' => 'dark',
    'activeNav' => '/model',
])

@section('title', 'تيمات | فعاليات متكررة تلقائياً للموظفين')
@section('description', 'تعرّف على النموذج المالي لمنصة تيمات القائم على رسوم النظام وحصة الفعالية ومقارنة مساري محفظة المجتمع ودفع الموظف.')

@section('content')
<script type="application/ld+json">{"@@context":"https://schema.org","@@type":"Organization","name":"تيمات | Teamat","url":"https://teamat.app","logo":"https://teamat.app/favicon.svg","description":"منصة B2B SaaS سعودية تحوّل الاهتمامات المشتركة بين الموظفين إلى فعاليات متكررة تلقائياً دون الحاجة إلى مجهود تنظيمي داخل الشركة.","address":{"@@type":"PostalAddress","addressLocality":"الرياض","addressCountry":"SA"},"contactPoint":{"@@type":"ContactPoint","email":"contact@teamat.app","contactType":"customer support","areaServed":"SA","availableLanguage":["Arabic"]}}</script><script type="application/ld+json">{"@@context":"https://schema.org","@@type":"SoftwareApplication","name":"Teamat Platform | منصة تيمات","operatingSystem":"Web","applicationCategory":"BusinessApplication","offers":{"@@type":"Offer","price":"0","priceCurrency":"SAR","availability":"https://schema.org/InStock"},"description":"منصة B2B SaaS سعودية تحوّل الاهتمامات المشتركة بين الموظفين إلى فعاليات متكررة تلقائياً دون الحاجة إلى مجهود تنظيمي داخل الشركة."}</script>
<section id="model-hero" class="bg-[#0A0A0A] text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 border-b-[0.5px] border-white/10 relative overflow-hidden">
    <div aria-hidden="true" class="absolute -top-24 -right-24 w-80 h-80 rounded-full border-[24px] border-[#C8FF00]/[0.04] pointer-events-none"></div>
    <div class="max-w-[1120px] mx-auto relative z-10">
        <div class="max-w-[740px] space-y-4"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#C8FF00] ">النموذج المالي</span>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold font-arabic text-white leading-tight">نموذج واضح — تدفع مقابل ما يكتمل</h1>
            <p class="text-base sm:text-lg text-white/80 leading-[1.8] pt-1">بنية تسعير عادلة ومباشرة ترتكز على القيمة المحققة والفعاليات المكتملة دون التزامات غامضة أو رسوم مخفية.</p></div></div></section>
<section id="model-elements" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#F6F8F5] text-[#0A0A0A] ">
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="space-y-12">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#0A0A0A] ">عناصر التكلفة</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-[#0A0A0A]">ثلاثة عناصر تشكل هيكل التسعير</h2></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cpu w-6 h-6 text-[#0A0A0A]" aria-hidden="true"><path d="M12 20v2"></path><path d="M12 2v2"></path><path d="M17 20v2"></path><path d="M17 2v2"></path><path d="M2 12h2"></path><path d="M2 17h2"></path><path d="M2 7h2"></path><path d="M20 12h2"></path><path d="M20 17h2"></path><path d="M20 7h2"></path><path d="M7 20v2"></path><path d="M7 2v2"></path><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="8" y="8" width="8" height="8" rx="1"></rect></svg></div>
                    <h3 class="text-xl font-bold font-arabic text-[#0A0A0A]">رسوم النظام</h3>
                    <p class="text-sm sm:text-base text-[#0A0A0A]/70 leading-relaxed">تُحتسب لكل موظف مفعّل، وتغطي الوصول الكامل للمنصة، وإدارة المجتمعات، ولوحة التحكم والتقارير الحية.</p></div>
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-receipt w-6 h-6 text-[#0A0A0A]" aria-hidden="true"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17.5v-11"></path></svg></div>
                    <h3 class="text-xl font-bold font-arabic text-[#0A0A0A]">حصة الفعالية</h3>
                    <p class="text-sm sm:text-base text-[#0A0A0A]/70 leading-relaxed">تُدفع عبر محفظة المجتمع أو من الموظف مباشرة حسب المسار المختار، وتغطي تكلفة حجز المرفق والنشاط الفعلي.</p></div>
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-check w-6 h-6 text-[#0A0A0A]" aria-hidden="true"><path d="m16 11 2 2 4-4"></path><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                    <h3 class="text-xl font-bold font-arabic text-[#0A0A0A]">المنسّق المُدار</h3>
                    <p class="text-sm sm:text-base text-[#0A0A0A]/70 leading-relaxed">خدمة اختيارية تُضاف عند الحاجة ليتولى فريق تيمات الإشراف التشغيلي وجدولة الفعاليات نيابة عن الشركة.</p></div></div></div></div></section>
<section id="model-comparison" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#F0EDE6] text-[#0A0A0A] border-t-[0.5px] border-b-[0.5px] border-[#0A0A0A]/10">
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="space-y-12">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#0A0A0A] ">مقارنة المسارين</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-[#0A0A0A]">اختر المسار المالي الذي يلائم ميزانيتك</h2>
                <p class="text-[#0A0A0A]/80 text-base leading-[1.8]">نوفر مسارين ماليين مرنين لتحقيق التوازن الأمثل بين التزام الشركة ومشاركة الموظف:</p></div>
            <div class="bg-white p-6 sm:p-8 rounded-[16px] border-[0.5px] border-[#0A0A0A]/10">
                <div id="track-compare" class="w-full overflow-x-auto">
                    <table class="w-full text-right border-collapse min-w-[600px]">
                        <thead>
                            <tr class="border-b-[0.5px] border-[#0A0A0A]/10">
                                <th class="py-4 px-5 text-sm font-bold text-[#0A0A0A]/60 font-inter uppercase">وجه المقارنة</th>
                                <th class="py-4 px-5 text-base sm:text-lg font-extrabold text-[#0A0A0A] bg-[#C8FF00]/15 rounded-t-[12px]">
                                    <div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-5 h-5 text-[#0A0A0A]" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg><span>مسار محفظة المجتمع</span></div></th>
                                <th class="py-4 px-5 text-base sm:text-lg font-extrabold text-[#0A0A0A] bg-white rounded-t-[12px] border-[0.5px] border-b-0 border-[#0A0A0A]/10">
                                    <div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-5 h-5 text-[#0A0A0A]" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg><span>مسار دفع الموظف</span></div></th></tr></thead>
                        <tbody class="divide-y-[0.5px] divide-[#0A0A0A]/10 text-sm sm:text-base">
                            <tr class="transition-colors hover:bg-black/[0.02]">
                                <td class="py-5 px-5 font-bold text-[#0A0A0A] align-top w-1/4">من يتحمّل تكلفة الفعالية؟</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-[#C8FF00]/10 leading-relaxed align-top w-[37.5%]">الشركة بالكامل عبر شحن محفظة المجتمع.</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-white border-x-[0.5px] border-[#0A0A0A]/10 leading-relaxed align-top w-[37.5%]">الموظف يدفع حصة الفرد المحددة لكل فعالية.</td></tr>
                            <tr class="transition-colors hover:bg-black/[0.02]">
                                <td class="py-5 px-5 font-bold text-[#0A0A0A] align-top w-1/4">التزام الشركة المالي</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-[#C8FF00]/10 leading-relaxed align-top w-[37.5%]">رسوم النظام + رصيد المحفظة المشحون.</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-white border-x-[0.5px] border-[#0A0A0A]/10 leading-relaxed align-top w-[37.5%]">رسوم النظام فقط لكل موظف مفعّل.</td></tr>
                            <tr class="transition-colors hover:bg-black/[0.02]">
                                <td class="py-5 px-5 font-bold text-[#0A0A0A] align-top w-1/4">سرعة التوسّع</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-[#C8FF00]/10 leading-relaxed align-top w-[37.5%]">مرتبطة بحجم الميزانية المخصصة للأنشطة.</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-white border-x-[0.5px] border-[#0A0A0A]/10 leading-relaxed align-top w-[37.5%]">توسّع غير محدود بعدد الفعاليات بتكلفة ثابتة على الشركة.</td></tr>
                            <tr class="transition-colors hover:bg-black/[0.02]">
                                <td class="py-5 px-5 font-bold text-[#0A0A0A] align-top w-1/4">الأنسب لـ</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-[#C8FF00]/10 leading-relaxed align-top w-[37.5%]">الشركات التي تضع ميزانية رفاهية وتتحمل التكاليف.</td>
                                <td class="py-5 px-5 text-[#0A0A0A]/85 bg-white border-x-[0.5px] border-[#0A0A0A]/10 leading-relaxed align-top w-[37.5%]">الشركات الكبيرة الراغبة بتمكين الموظفين بتكلفة تشغيلية منخفضة.</td></tr></tbody></table></div></div></div></div></section>
<section id="model-transparency" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#0A0A0A] text-white border-b-[0.5px] border-white/10">
    <div aria-hidden="true" class="absolute rounded-full border-[20px] sm:border-[32px] border-[#C8FF00]/[0.05] pointer-events-none -bottom-32 -left-32 w-96 h-96 sm:w-[500px] sm:h-[500px]"></div>
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="space-y-12">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#C8FF00] ">مبادئ التسعير</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-white">الشفافية في كل مرحلة مالية</h2></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-6 sm:p-7 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#C8FF00]/15 border-[0.5px] border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-5 h-5" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg></div>
                    <h3 class="text-lg sm:text-xl font-bold font-arabic text-white">السعر يُثبَّت عند إنشاء الفعالية</h3>
                    <p class="text-sm sm:text-base text-white/70 leading-relaxed">السعر الإجمالي للفعالية مع مزوّد الخدمة معتمد وثابت ولا يتأثر بتغير أعداد الحضور في اللحظات الأخيرة.</p></div>
                <div class="p-6 sm:p-7 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#C8FF00]/15 border-[0.5px] border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-5 h-5" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg></div>
                    <h3 class="text-lg sm:text-xl font-bold font-arabic text-white">الاسترداد يعود لوسيلة الدفع الأصلية</h3>
                    <p class="text-sm sm:text-base text-white/70 leading-relaxed">في حال حدوث أي إلغاء وفق الشروط المعتمدة، تُعاد المبالغ فوراً لمحفظة المجتمع أو بطاقة الموظف.</p></div>
                <div class="p-6 sm:p-7 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#C8FF00]/15 border-[0.5px] border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-check w-5 h-5" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 15 2 2 4-4"></path></svg></div>
                    <h3 class="text-lg sm:text-xl font-bold font-arabic text-white">سجل مالي دائم وغير قابل للتعديل</h3>
                    <p class="text-sm sm:text-base text-white/70 leading-relaxed">كل معاملة مالية موثقة برقم مرجعي وتفاصيل كاملة تتيح لمسؤول الحساب في الشركة تدقيقها بسهولة.</p></div></div></div></div></section>
<section id="quote-note-section" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#F6F8F5] text-[#0A0A0A] ">
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="max-w-[800px] mx-auto p-8 sm:p-10 rounded-[16px] bg-white border-[0.5px] border-[#0A0A0A]/10 text-center space-y-4"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#0A0A0A] ">تسعير مخصص</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-arabic text-[#0A0A0A]">احصل على عرض مالي مخصص لشركتك</h2>
            <p class="text-[#0A0A0A]/70 text-base sm:text-lg leading-relaxed max-w-[620px] mx-auto">نظراً لأن القيمة النهائية لرسوم النظام تعتمد على عدد الموظفين المفعّلين والمسار المالي المختار، يقوم فريقنا بإعداد عرض مالي مفصل يلائم حجم شركتك واحتياجاتها بدقة.</p></div></div></section>
<section id="model-cta" class="bg-[#0A0A0A] text-white py-16 sm:py-20 border-t-[0.5px] border-b-[0.5px] border-white/10 relative overflow-hidden">
    <div aria-hidden="true" class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border-[24px] border-[#C8FF00]/[0.04] pointer-events-none"></div>
    <div aria-hidden="true" class="absolute -top-24 -right-24 w-80 h-80 rounded-full border-[24px] border-[#C8FF00]/[0.04] pointer-events-none"></div>
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#111111] p-8 sm:p-12 rounded-[16px] border-[0.5px] border-white/10">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#C8FF00] ">الخطوة القادمة</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight font-arabic">اطلب عرضاً مخصصاً لشركتك واكتشف الخيار المالي الأنسب لفرق عملك</h2></div>
            <div class="shrink-0 w-full sm:w-auto"><a id="model-cta-button" class="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] disabled:opacity-50 disabled:cursor-not-allowed text-[16px] py-3.5 px-7 font-bold bg-[#C8FF00] text-[#0A0A0A] border-[0.5px] border-[#C8FF00] hover:bg-[#bcf200] hover:border-[#bcf200] active:opacity-90 w-full sm:w-auto" href="/contact" data-discover="true">اطلب عرضاً مخصصاً</a></div></div></div></section>
@endsection
