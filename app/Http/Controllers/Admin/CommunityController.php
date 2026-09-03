<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Support\Lists\ListSort;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    /**
     * الأعمدة المسموح الترتيب بها — كلها معروضة في جدول الشاشة أصلاً (H §18).
     * `members_count` و`events_count` تجميعان موجودان في الاستعلام. الشركة
     * والفئة والقائد علاقات، و`balance` مشتق من المحفظة لا عمود — فلا مفاتيح
     * لها (لا تُضاف وصلات من أجل الترتيب).
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'members_count' => 'members_count',
            'events_count' => 'events_count',
        ], 'name', ListSort::ASC, 'id');
    }

    public function index(Request $request): Response
    {
        $query = Community::with(['category', 'company'])
            ->withCount(['members', 'events']);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($companyId = $request->input('company_id')) {
            $query->where('company_id', $companyId);
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // H §18 — الترتيب: القيمتان مفتاحان من قائمة بيضاء، لا اسما عمودين.
        $sortKey = is_string($request->query('sort')) ? $request->query('sort') : null;
        $sortDir = is_string($request->query('dir')) ? $request->query('dir') : null;

        $communities = self::sort()
            ->apply($query, $sortKey, $sortDir)
            ->paginate(20)
            ->withQueryString();

        Community::attachPrimaryLeaders($communities->items());

        return Inertia::render('admin/communities/index', [
            'communities' => $communities,
            'totalCommunities' => Community::count(),
            'companies' => Company::where('status', 'active')->select('id', 'name')->orderBy('name')->get(),
            'categories' => Category::whereNull('parent_id')->with('children:id,parent_id,name,icon')->select('id', 'parent_id', 'name', 'icon')->orderBy('name')->get(),
            'filters' => (object) $request->only('search', 'company_id', 'category_id', 'sort', 'dir'),
            'sort' => self::sort()->state($sortKey, $sortDir),
        ]);
    }
}
