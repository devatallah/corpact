<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SupportMessage::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $messages = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        return Inertia::render('admin/support/index', [
            'messages' => $messages,
            'stats' => [
                'total' => SupportMessage::count(),
                'new' => SupportMessage::where('status', 'new')->count(),
                'in_progress' => SupportMessage::where('status', 'in_progress')->count(),
                'resolved' => SupportMessage::where('status', 'resolved')->count(),
            ],
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function update(Request $request, SupportMessage $supportMessage): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:new,in_progress,resolved'],
        ]);

        $supportMessage->update($validated);

        return back()->with('success', 'تم تحديث حالة الرسالة.');
    }

    public function destroy(SupportMessage $supportMessage): RedirectResponse
    {
        $supportMessage->delete();

        return back()->with('success', 'تم حذف الرسالة.');
    }
}
