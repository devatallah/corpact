<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * سطر تصحيح نتيجة بعد إدخالها (H §13): «تصحيحها بعد الاعتماد يحتاج صلاحية +
 * سبباً + سجل تدقيق + إعادة احتساب اللوحة». القيمة قبل/بعد والوحدة قبل/بعد
 * والسبب (إلزامي) والفاعل — لا شيء يُحذف.
 */
#[Fillable([
    'competition_result_id',
    'from_value_scaled',
    'to_value_scaled',
    'from_unit',
    'to_unit',
    'reason',
    'actor_user_id',
    'actor_name',
    'created_at',
])]
class CompetitionResultChange extends Model
{
    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'from_value_scaled' => 'integer',
            'to_value_scaled' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<CompetitionResult, $this>
     */
    public function result(): BelongsTo
    {
        return $this->belongsTo(CompetitionResult::class, 'competition_result_id');
    }
}
