<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Company settings, configurable by the account manager (H §5 / G دليل
 * مسؤول الحساب §2). Defaults per spec: employee_can_create_event off,
 * default_funding_mode مختلط, default_subsidy 0, registration_close_hours
 * 24, allow_absence_marking on.
 */
class SettingController extends Controller
{
    public function index(): Response
    {
        $company = auth('company')->user();

        return Inertia::render('company/settings/index', [
            'settings' => $company->getSettings(),
            'fundingModes' => CompanySetting::FUNDING_MODES,
            // البيانات الرسمية تُعرض ولا تُحرَّر من هنا: النطاق البريدي يفتح
            // التسجيل المباشر لكل من يملك بريداً عليه، وتغييره صلاحية أدمن
            // تيمات وحده (H §5).
            'official' => [
                'name' => $company->name,
                'commercial_registration' => $company->commercial_registration,
                'vat_number' => $company->vat_number,
                'domain' => $company->domain,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $company = auth('company')->user();

        $data = $request->validate([
            'employee_can_create_event' => ['required', 'boolean'],
            'default_funding_mode' => ['required', Rule::in(CompanySetting::FUNDING_MODES)],
            'default_subsidy' => ['required', 'integer', 'min:0'],
            'registration_close_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'allow_absence_marking' => ['required', 'boolean'],
        ], [
            'default_funding_mode.in' => 'مصدر التمويل غير صالح.',
            'default_subsidy.integer' => 'قيمة الدعم يجب أن تكون رقماً صحيحاً بالهللة.',
            'default_subsidy.min' => 'قيمة الدعم لا يمكن أن تكون سالبة.',
            'registration_close_hours.min' => 'ساعات إغلاق التسجيل يجب أن تكون ساعة واحدة على الأقل.',
            'registration_close_hours.max' => 'ساعات إغلاق التسجيل لا تتجاوز أسبوعاً (168 ساعة).',
        ]);

        $company->getSettings()->update($data);

        return back()->with('success', 'تم حفظ إعدادات الشركة.');
    }
}
