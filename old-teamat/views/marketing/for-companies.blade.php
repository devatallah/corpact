@extends('layouts.marketing', [
    'headerTheme' => 'dark',
    'activeNav' => '/for-companies',
])

@section('title', 'تيمات | فعاليات متكررة تلقائياً للموظفين')
@section('description', 'حوّل اهتمامات موظفيك إلى نشاط مستمر يقوي الروابط داخل الشركة مع لوحة مؤشرات حية وتحكّم كامل في الميزانية.')

@section('content')
<script type="application/ld+json">{"@@context":"https://schema.org","@@type":"Organization","name":"تيمات | Teamat","url":"https://teamat.app","logo":"https://teamat.app/favicon.svg","description":"منصة B2B SaaS سعودية تحوّل الاهتمامات المشتركة بين الموظفين إلى فعاليات متكررة تلقائياً دون الحاجة إلى مجهود تنظيمي داخل الشركة.","address":{"@@type":"PostalAddress","addressLocality":"الرياض","addressCountry":"SA"},"contactPoint":{"@@type":"ContactPoint","email":"contact@teamat.app","contactType":"customer support","areaServed":"SA","availableLanguage":["Arabic"]}}</script><script type="application/ld+json">{"@@context":"https://schema.org","@@type":"SoftwareApplication","name":"Teamat Platform | منصة تيمات","operatingSystem":"Web","applicationCategory":"BusinessApplication","offers":{"@@type":"Offer","price":"0","priceCurrency":"SAR","availability":"https://schema.org/InStock"},"description":"منصة B2B SaaS سعودية تحوّل الاهتمامات المشتركة بين الموظفين إلى فعاليات متكررة تلقائياً دون الحاجة إلى مجهود تنظيمي داخل الشركة."}</script>
<section id="for-companies-hero" class="bg-[#0A0A0A] text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 border-b-[0.5px] border-white/10 relative overflow-hidden">
    <div aria-hidden="true" class="absolute -top-24 -left-24 w-80 h-80 rounded-full border-[24px] border-[#C8FF00]/[0.04] pointer-events-none"></div>
    <div class="max-w-[1120px] mx-auto relative z-10">
        <div class="max-w-[740px] space-y-4"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#C8FF00] ">حلول الشركات</span>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold font-arabic text-white leading-tight">ثقافة تُقاس، لا تُفترض</h1>
            <p class="text-base sm:text-lg text-white/80 leading-[1.8] pt-1">حوّل المبادرات المتفرقة إلى مجتمعات حقيقية مستمرة، واجعل التقارب بين فرق العمل أثراً ملموساً تدعمه بيانات دقيقة.</p>
            <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"><a class="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] disabled:opacity-50 disabled:cursor-not-allowed text-[16px] py-3.5 px-7 font-bold bg-[#C8FF00] text-[#0A0A0A] border-[0.5px] border-[#C8FF00] hover:bg-[#bcf200] hover:border-[#bcf200] active:opacity-90 " href="/contact" data-discover="true">احجز عرضاً لفريقك</a><a class="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] disabled:opacity-50 disabled:cursor-not-allowed text-[16px] py-3.5 px-7 font-bold bg-transparent text-[#C8FF00] border-[0.5px] border-[#C8FF00] hover:bg-[#C8FF00]/10 active:bg-[#C8FF00]/20 " href="/model" data-discover="true">استكشف النموذج المالي</a></div></div></div></section>
<section id="company-value-pillars" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#F6F8F5] text-[#0A0A0A] ">
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="space-y-12">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#0A0A0A] ">القيمة المضافة</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-[#0A0A0A]">ما الذي يحصل عليه فريقك مع تيمات؟</h2></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard w-6 h-6 text-[#0A0A0A]" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg></div>
                    <h3 class="text-xl font-bold font-arabic text-[#0A0A0A]">لوحة مؤشرات موثّقة</h3>
                    <p class="text-base text-[#0A0A0A]/70 leading-relaxed">بيانات فورية عن الفعاليات المكتملة، ومعدلات تفعيل الموظفين، والمجتمعات الأكثر نشاطاً لدعم قرارات إدارة رأس المال البشري.</p></div>
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-6 h-6 text-[#0A0A0A]" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg></div>
                    <h3 class="text-xl font-bold font-arabic text-[#0A0A0A]">تحكّم دقيق في الميزانية</h3>
                    <p class="text-base text-[#0A0A0A]/70 leading-relaxed">محفظة مالية واضحة تمنع تجاوز النفقات، مع تقارير شهرية مفصلة لكل ريال يُصرف على فعاليات الموظفين.</p></div>
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-6 h-6 text-[#0A0A0A]" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg></div>
                    <h3 class="text-xl font-bold font-arabic text-[#0A0A0A]">صلاحيات متعددة المستويات</h3>
                    <p class="text-base text-[#0A0A0A]/70 leading-relaxed">أدوات مخصصة لمسؤول الحساب في الشركة لاعتماد قادة المجتمعات وتحديد الضوابط والموافقة على الأنشطة.</p></div>
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-4">
                    <div class="w-12 h-12 rounded-full bg-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-6 h-6 text-[#0A0A0A]" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg></div>
                    <h3 class="text-xl font-bold font-arabic text-[#0A0A0A]">تقارير دورية جاهزة</h3>
                    <p class="text-base text-[#0A0A0A]/70 leading-relaxed">ملخصات تنفيذية دورية توضح أثر المنصة على اندماج الفرق وتفاعلهم الإيجابي المستمر.</p></div></div></div></div></section>
<section id="governance-section" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#0A0A0A] text-white border-t-[0.5px] border-b-[0.5px] border-white/10">
    <div aria-hidden="true" class="absolute rounded-full border-[20px] sm:border-[32px] border-[#C8FF00]/[0.05] pointer-events-none top-1/2 -translate-y-1/2 -right-40 w-96 h-96 sm:w-[600px] sm:h-[600px]"></div>
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div class="lg:col-span-5 space-y-4"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#C8FF00] ">الحوكمة والأمان</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-white leading-tight">التحكم والصلاحيات لمسؤول الحساب في الشركة</h2>
                <p class="text-white/80 text-base leading-[1.8]">صُممت تيمات لتمنح الشركات السيطرة الكاملة على البيئة المؤسسية دون إغراق المسؤولين في التفاصيل اليومية:</p></div>
            <div class="lg:col-span-7 space-y-4">
                <div class="p-5 sm:p-6 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 flex items-start gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#C8FF00] text-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5 font-inter text-xs font-extrabold">01</div>
                    <p class="text-sm sm:text-base text-white/85 leading-relaxed">اعتماد المجتمعات الجديدة قبل إطلاق فعالياتها لضمان التوافق مع قيم وثقافة الشركة.</p></div>
                <div class="p-5 sm:p-6 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 flex items-start gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#C8FF00] text-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5 font-inter text-xs font-extrabold">02</div>
                    <p class="text-sm sm:text-base text-white/85 leading-relaxed">تحديد الميزانية وسقف الإنفاق لكل مجتمع أو قسم بمرونة تامة.</p></div>
                <div class="p-5 sm:p-6 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 flex items-start gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#C8FF00] text-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5 font-inter text-xs font-extrabold">03</div>
                    <p class="text-sm sm:text-base text-white/85 leading-relaxed">متابعة الحضور الموثّق والفعاليات المكتملة أولاً بأول.</p></div>
                <div class="p-5 sm:p-6 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 flex items-start gap-4">
                    <div class="w-6 h-6 rounded-full bg-[#C8FF00] text-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5 font-inter text-xs font-extrabold">04</div>
                    <p class="text-sm sm:text-base text-white/85 leading-relaxed">إمكانية إسناد المهام للمنسّق المُدار لضمان أعلى مستويات الفعالية التشغيلية.</p></div></div></div></div></section>
<section id="privacy-section" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#F0EDE6] text-[#0A0A0A] ">
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="space-y-12">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#0A0A0A] ">حماية البيانات</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-[#0A0A0A]">الخصوصية والأمان في كل تفاعل</h2>
                <p class="text-[#0A0A0A]/80 text-base leading-[1.8]">نلتزم بأعلى معايير أمن المعلومات والخصوصية المؤسسية داخل المملكة العربية السعودية:</p></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#0A0A0A] text-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database w-5 h-5" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg></div>
                    <h3 class="text-lg sm:text-xl font-bold font-arabic text-[#0A0A0A]">بيانات داخل المنصة</h3>
                    <p class="text-sm sm:text-base text-[#0A0A0A]/70 leading-relaxed">جميع التفاعلات وسجلات الحضور والاهتمامات موثّقة داخل بيئة مشفرة ومحمية لا تعتمد على قنوات تواصل خارجية غير منضبطة.</p></div>
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#0A0A0A] text-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-5 h-5" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                    <h3 class="text-lg sm:text-xl font-bold font-arabic text-[#0A0A0A]">صلاحيات وصول مقيدة</h3>
                    <p class="text-sm sm:text-base text-[#0A0A0A]/70 leading-relaxed">وصول موجه فقط للمسؤولين المعتمدين مع فصل كامل لسجلات كل شركة ومجتمعاتها.</p></div>
                <div class="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#0A0A0A] text-[#C8FF00] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-5 h-5" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg></div>
                    <h3 class="text-lg sm:text-xl font-bold font-arabic text-[#0A0A0A]">سجلات تدقيق مالية</h3>
                    <p class="text-sm sm:text-base text-[#0A0A0A]/70 leading-relaxed">كل عملية خصم أو تسوية تملك سجلاً محاسبياً واضحاً قابل للمطابقة والمراجعة في أي وقت.</p></div></div></div></div></section>
<section id="fit-section" class="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-[#F6F8F5] text-[#0A0A0A] ">
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div class="space-y-12">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#0A0A0A] ">الملاءمة التشغيلية</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-[#0A0A0A]">لمن تصلح تيمات؟</h2>
                <p class="text-[#0A0A0A]/80 text-base leading-[1.8]">نطرح حلولنا بصدق ووضوح للشركات التي تحقق معها المنصة أعلى عائد على الاستثمار في بيئة العمل:</p></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-6 sm:p-7 rounded-[16px] bg-white border-[0.5px] border-[#0A0A0A]/10 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#F6F8F5] border-[0.5px] border-[#0A0A0A]/10 flex items-center justify-center text-[#0A0A0A]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building w-5 h-5" aria-hidden="true"><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M12 6h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path><path d="M8 6h.01"></path><path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path><rect x="4" y="2" width="16" height="20" rx="2"></rect></svg></div>
                    <h3 class="text-lg font-bold font-arabic text-[#0A0A0A]">شركات تضم ٥٠ موظفاً فأكثر</h3>
                    <p class="text-sm text-[#0A0A0A]/70 leading-relaxed">حيث تتسع قاعدة الاهتمامات وتتنوع الهوايات وتبرز الحاجة لمجتمعات فرعية متعددة.</p></div>
                <div class="p-6 sm:p-7 rounded-[16px] bg-white border-[0.5px] border-[#0A0A0A]/10 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#F6F8F5] border-[0.5px] border-[#0A0A0A]/10 flex items-center justify-center text-[#0A0A0A]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building w-5 h-5" aria-hidden="true"><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M12 6h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path><path d="M8 6h.01"></path><path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path><rect x="4" y="2" width="16" height="20" rx="2"></rect></svg></div>
                    <h3 class="text-lg font-bold font-arabic text-[#0A0A0A]">فرق عمل موزّعة على عدة مواقع أو مكاتب</h3>
                    <p class="text-sm text-[#0A0A0A]/70 leading-relaxed">عندما يحتاج الموظفون في الفروع المختلفة إلى مساحات مشتركة للتواصل الواقعي وبناء العلاقات المهنية.</p></div>
                <div class="p-6 sm:p-7 rounded-[16px] bg-white border-[0.5px] border-[#0A0A0A]/10 space-y-3">
                    <div class="w-10 h-10 rounded-full bg-[#F6F8F5] border-[0.5px] border-[#0A0A0A]/10 flex items-center justify-center text-[#0A0A0A]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building w-5 h-5" aria-hidden="true"><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M12 6h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path><path d="M8 6h.01"></path><path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path><rect x="4" y="2" width="16" height="20" rx="2"></rect></svg></div>
                    <h3 class="text-lg font-bold font-arabic text-[#0A0A0A]">شركات تملك برامج رفاهية موظفين وتبحث عن أثر مستمر</h3>
                    <p class="text-sm text-[#0A0A0A]/70 leading-relaxed">لمن يرغب في تجاوز الفعاليات السنوية المعزولة وبناء ثقافة تواصل تتكرر أسبوعياً وشرياً.</p></div></div></div></div></section>
<section id="for-companies-cta" class="bg-[#0A0A0A] text-white py-16 sm:py-20 border-t-[0.5px] border-b-[0.5px] border-white/10 relative overflow-hidden">
    <div aria-hidden="true" class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border-[24px] border-[#C8FF00]/[0.04] pointer-events-none"></div>
    <div aria-hidden="true" class="absolute -top-24 -right-24 w-80 h-80 rounded-full border-[24px] border-[#C8FF00]/[0.04] pointer-events-none"></div>
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#111111] p-8 sm:p-12 rounded-[16px] border-[0.5px] border-white/10">
            <div class="max-w-[640px] space-y-3"><span class="inline-block font-inter text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none text-[#C8FF00] ">الخطوة القادمة</span>
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight font-arabic">احجز عرضاً تقديمياً مخصصاً لفريقك وشاهد أثر المنصة بالأرقام والمؤشرات</h2></div>
            <div class="shrink-0 w-full sm:w-auto"><a id="for-companies-cta-button" class="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] disabled:opacity-50 disabled:cursor-not-allowed text-[16px] py-3.5 px-7 font-bold bg-[#C8FF00] text-[#0A0A0A] border-[0.5px] border-[#C8FF00] hover:bg-[#bcf200] hover:border-[#bcf200] active:opacity-90 w-full sm:w-auto" href="/contact" data-discover="true">احجز عرضاً لفريقك</a></div></div></div></section>
@endsection
