<?php

namespace App\Http\Controllers\Employee;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\RoleAssignment;
use Inertia\Inertia;
use Inertia\Response;

/**
 * «قيادتي» — مدخل واحد لأدوات قائد المجتمع.
 *
 * القيادة ليست بوابة منفصلة: الموظف نفسه يقود. لكن أدواته الثلاث — الأعضاء
 * وقالب التكرار ومحفظة المجتمع — لم تكن مذكورة في أي قائمة، فتُبلَغ بالمرور
 * عبر «مجتمعاتي» ثم النزول داخل الصفحة. وقائد مجتمعين لم يكن له طريق مباشر
 * إلى أيّهما. هذه الصفحة تُسمّي ما يملكه وتفتحه بنقرة.
 */
class LeadershipController extends Controller
{
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $communities = Community::query()
            ->whereIn('id', RoleAssignment::query()
                ->where('user_id', $employee->user_id)
                ->where('role', Role::CommunityLeader->value)
                ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
                ->pluck('scope_id'))
            ->where('company_id', $employee->company_id)
            ->withCount('members')
            ->orderBy('name')
            ->get()
            ->map(fn (Community $community) => [
                'id' => $community->id,
                'name' => $community->name,
                'icon' => $community->icon,
                'status' => $community->status,
                'members_count' => $community->members_count,
                // القائد الأساسي يتحمّل المسؤولية؛ النائب يشاركه الأدوات.
                'is_primary' => $community->primaryLeader()?->id === $employee->id,
            ])
            ->all();

        return Inertia::render('employee/leadership/index', [
            'communities' => $communities,
        ]);
    }
}
