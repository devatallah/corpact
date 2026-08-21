<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\League;
use App\Support\Lists\ListSort;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /**
     * H §18 — الترتيب عبر قائمة بيضاء. العمودان معروضان في الجدول، و
     * `employees_count` تجميع موجود أصلاً في الاستعلام.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'employees_count' => 'employees_count',
            'created_at' => 'created_at',
        ], 'name', ListSort::ASC, 'id');
    }

    public function index(Request $request): Response
    {
        $company = auth('company')->user();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $query = Department::where('company_id', $company->id)
            ->withCount('employees')
            ->when(filled($filters['search'] ?? null), fn ($q) => $q->where('name', 'like', '%'.$filters['search'].'%'));

        // كانت `->get()` بلا حدّ: شركة بستين قسماً تُحمّل الصفحة كلها دفعةً.
        $departments = self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('company/departments/index', [
            'departments' => $departments,
            'filters' => $filters,
            'sort' => self::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $company = auth('company')->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ], [
            'name.required' => 'اسم القسم مطلوب.',
        ]);

        $data['company_id'] = $company->id;

        Department::create($data);

        return back()->with('success', 'تم إنشاء القسم بنجاح.');
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $company = auth('company')->user();

        if ($department->company_id !== $company->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ], [
            'name.required' => 'اسم القسم مطلوب.',
        ]);

        $department->update($data);

        return back()->with('success', 'تم تحديث القسم بنجاح.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $company = auth('company')->user();

        if ($department->company_id !== $company->id) {
            abort(403);
        }

        if ($department->employees()->exists()) {
            return back()->with('error', 'لا يمكن حذف قسم يحتوي على موظفين.');
        }

        // Check if department is in an active league
        $inActiveLeague = League::where('status', 'active')
            ->whereHas('departments', fn ($q) => $q->where('departments.id', $department->id))
            ->exists();

        if ($inActiveLeague) {
            return back()->with('error', 'لا يمكن حذف قسم مشترك في بطولة نشطة.');
        }

        $department->delete();

        return back()->with('success', 'تم حذف القسم بنجاح.');
    }
}
