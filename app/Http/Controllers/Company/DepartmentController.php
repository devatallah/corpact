<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        $company = auth('company')->user();

        $departments = Department::where('company_id', $company->id)
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        return Inertia::render('company/departments/index', [
            'departments' => $departments,
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

        $department->delete();

        return back()->with('success', 'تم حذف القسم بنجاح.');
    }
}
