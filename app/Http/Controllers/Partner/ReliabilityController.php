<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Services\Provider\ReliabilityService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * بطاقة السلوكيات (H §11): لا يُعرض رقم المؤشر للمزوّد في الإصدار الأول —
 * تُعرض سلوكياته فقط: معدل القبول ومتوسط زمن الرد.
 */
class ReliabilityController extends Controller
{
    public function __construct(private ReliabilityService $reliability) {}

    public function index(): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();

        return Inertia::render('partner/reliability', [
            'behaviors' => $this->reliability->behaviors($partner),
        ]);
    }
}
