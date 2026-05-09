<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Company;
use App\Models\Sport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Community::with(['sport', 'leader', 'company'])
            ->withCount(['members', 'events']);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($companyId = $request->input('company_id')) {
            $query->where('company_id', $companyId);
        }

        if ($sportId = $request->input('sport_id')) {
            $query->where('sport_id', $sportId);
        }

        $communities = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('admin/communities/index', [
            'communities' => $communities,
            'totalCommunities' => Community::count(),
            'companies' => Company::where('status', 'active')->select('id', 'name')->orderBy('name')->get(),
            'sports' => Sport::select('id', 'name', 'icon')->orderBy('name')->get(),
            'filters' => $request->only('search', 'company_id', 'sport_id'),
        ]);
    }
}
