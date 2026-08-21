<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileCategory;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Partner;
use App\Services\Audit\AuditLogService;
use App\Services\Files\FileStorageService;
use App\Support\Audit\AuditAction;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * H §16 «الشركات والعقود» + G (أدمن تيمات §1): «سجّل العقد: رسوم النظام لكل
 * موظف مفعّل، والحد الأدنى الشهري، وخدمة المنسّق إن وُجدت»، plus the tax
 * numbers A11 needs on the invoice (H §12.9) and the commercial register.
 *
 * The columns were prepared by A4/A11 and left without an input surface —
 * this is that surface. Effective-dated term *changes* stay with A11's
 * `company_contract_terms` screen; this writes the base contract record.
 */
class CompanyContractController extends Controller
{
    public function __construct(private FileStorageService $files) {}

    public function update(Request $request, Company $company): RedirectResponse
    {
        $data = $request->validate([
            'commercial_registration' => ['sometimes', 'nullable', 'string', 'max:32'],
            'vat_number' => ['sometimes', 'nullable', 'string', 'regex:/^3\d{13}3$/'],
            'contract_fee_per_activated_employee' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100000'],
            'contract_monthly_minimum' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:10000000'],
            'contract_coordinator_service' => ['sometimes', 'boolean'],
            // الملف نفسه يُفحص في FileStorageService (pdf فقط، حتى 10MB،
            // بفحص MIME الفعلي) — لا `mimes:` هنا كي لا يُعتمد على الامتداد.
            'contract_file' => ['sometimes', 'file'],
        ], [
            'vat_number.regex' => 'الرقم الضريبي السعودي 15 رقماً يبدأ وينتهي بالرقم 3.',
            'contract_fee_per_activated_employee.numeric' => 'رسوم النظام لكل موظف مفعّل يجب أن تكون رقماً.',
            'contract_monthly_minimum.numeric' => 'الحد الأدنى الشهري يجب أن يكون رقماً.',
        ]);

        $tracked = [
            'commercial_registration',
            'vat_number',
            'contract_fee_per_activated_employee',
            'contract_monthly_minimum',
            'contract_coordinator_service',
        ];

        $before = $company->only($tracked);

        // H §19: عقد pdf حتى 10MB — والاستبدال ينشئ نسخة جديدة ويحتفظ
        // بالقديمة، ولا حذف نهائي للعقود إطلاقاً.
        if ($request->hasFile('contract_file')) {
            $this->files->store(
                upload: $request->file('contract_file'),
                category: FileCategory::Contract,
                owner: $company,
                companyId: $company->id,
                field: 'contract_file',
            );
        }

        unset($data['contract_file']);

        // المبالغ تُخزَّن هللات (H §12: كل المبالغ integer بالهللة).
        foreach (['contract_fee_per_activated_employee', 'contract_monthly_minimum'] as $money) {
            if (array_key_exists($money, $data) && $data[$money] !== null) {
                $data[$money] = Money::toHalalas((float) $data[$money]);
            }
        }

        $company->fill($data)->save();

        AuditLogService::record(
            action: AuditAction::COMPANY_CONTRACT_UPDATED,
            entity: $company,
            before: $before,
            after: $company->only($tracked),
            reason: 'تحديث بيانات عقد الشركة من لوحة الأدمن',
            companyId: $company->id,
        );

        return back()->with('success', 'حُفظت بيانات العقد وسُجِّلت في سجل التدقيق.');
    }

    /**
     * The provider's tax number — A11 needs it on the settlement statement
     * (H §12.9); the column existed with no input.
     */
    public function updateProvider(Request $request, Partner $partner): RedirectResponse
    {
        $data = $request->validate([
            'vat_number' => ['sometimes', 'nullable', 'string', 'regex:/^3\d{13}3$/'],
            'cr_number' => ['sometimes', 'nullable', 'string', 'max:32'],
        ], [
            'vat_number.regex' => 'الرقم الضريبي السعودي 15 رقماً يبدأ وينتهي بالرقم 3.',
        ]);

        $before = $partner->only(['vat_number', 'cr_number']);

        $partner->fill($data)->save();

        AuditLogService::record(
            action: AuditAction::COMPANY_CONTRACT_UPDATED,
            entity: $partner,
            before: $before,
            after: $partner->only(['vat_number', 'cr_number']),
            reason: 'تحديث السجل التجاري/الرقم الضريبي للمزوّد من لوحة الأدمن',
        );

        return back()->with('success', 'حُفظت بيانات المزوّد الضريبية.');
    }
}
