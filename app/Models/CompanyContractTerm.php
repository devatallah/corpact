<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * تغيير مجدول لرسوم عقد شركة (H §12.10): رسم الموظف المفعّل و/أو الحد الأدنى
 * الشهري **يسريان من تاريخ مستقبلي محدد ولا يُطبَّقان بأثر رجعي** — فاتورة
 * دورة سابقة لا تتغير أبداً بتعديل العقد اليوم.
 *
 * القيم بالهللة و nullable: أرقام العقد من المالك ولا افتراضات مسموحة.
 */
#[Fillable([
    'company_id',
    'fee_per_activated_employee_halalas',
    'monthly_minimum_halalas',
    'effective_from',
    'created_by_user_id',
    'reason',
])]
class CompanyContractTerm extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fee_per_activated_employee_halalas' => 'integer',
            'monthly_minimum_halalas' => 'integer',
            'effective_from' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
