<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * تغيير مجدول لنسبة عمولة مزوّد (H §12.10): **يسري من تاريخ مستقبلي محدد
 * فقط ولا يُطبَّق بأثر رجعي**. النسبة السارية على تاريخ ما = آخر صف
 * `effective_from <= التاريخ`، وإلا نسبة العقد القائمة على `partners`.
 */
#[Fillable([
    'partner_id',
    'rate_percent',
    'effective_from',
    'created_by_user_id',
    'reason',
])]
class ProviderCommissionRate extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rate_percent' => 'decimal:2',
            'effective_from' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
