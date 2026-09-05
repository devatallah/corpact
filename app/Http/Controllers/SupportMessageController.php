<?php

namespace App\Http\Controllers;

use App\Models\SupportMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SupportMessageController extends Controller
{
    /**
     * القيم التي يعرضها مُنتقيا النموذج. التحقق بها لا بالنص المعروض، فالنص
     * عربي معروض والقيمة مفتاح — والقائمة البيضاء هنا هي نفسها في `contact.tsx`.
     */
    public const HEADCOUNT_RANGES = ['less-than-50', '50-200', '201-500', '500-plus'];

    public const FINANCIAL_TRACKS = ['community-wallet', 'employee-pay', 'undecided'];

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:20'],
            'employees_range' => ['nullable', 'string', Rule::in(self::HEADCOUNT_RANGES)],
            'financial_track' => ['nullable', 'string', Rule::in(self::FINANCIAL_TRACKS)],
            'subject' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:3000'],
        ], [
            'name.required' => 'الاسم مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'employees_range.in' => 'اختر نطاقاً من القائمة.',
            'financial_track.in' => 'اختر مساراً من القائمة.',
            'message.required' => 'الرسالة مطلوبة.',
            'message.max' => 'الرسالة طويلة جداً.',
        ]);

        SupportMessage::create($data);

        // كانت تعيد إلى `/support#contact`، وهو مسار حُذفت صفحته فصار 500 —
        // فكان الطلب يُحفظ ثم يُقذف صاحبه إلى خطأ خادم. النموذج الآن على
        // `/contact`، والعودة إليه هي ما يرى المرسِل رسالة النجاح فيه.
        return redirect('/contact#form')
            ->with('success', 'تم استلام رسالتك بنجاح. سيتواصل معك فريق الدعم في أقرب وقت.');
    }
}
