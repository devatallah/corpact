<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Services\Provider\ProviderSuggestionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * الاقتراح الآلي للمزوّد عند إنشاء الفعالية (H §11): المفضّلون أولاً ←
 * إقصاء ← ترتيب ← صفر نتائج تُعاد مع السبب. التجاوز مسموح دائماً وسببه
 * يُفرض عند الإنشاء.
 */
class ProviderSuggestionController extends Controller
{
    public function __construct(private ProviderSuggestionService $suggestions) {}

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'community_id' => ['required', 'integer'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'integer', 'min:15'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'participants_count' => ['nullable', 'integer', 'min:1'],
        ]);

        $employee = auth('employee')->user();
        $community = Community::query()->whereKey($data['community_id'])->first();

        // عضو المجتمع فقط يستطلع مزوّديه — كيان أجنبي = 404 (H §4)
        if ($community === null
            || $community->company_id !== $employee->company_id
            || ! $community->members()->where('employee_id', $employee->id)->exists()) {
            throw (new ModelNotFoundException)->setModel(Community::class);
        }

        return response()->json($this->suggestions->suggest($data));
    }
}
