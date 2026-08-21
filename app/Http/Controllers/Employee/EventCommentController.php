<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventComment;
use App\Services\Community\EventCommentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * H §6: member comments exist only under events — text only, author
 * edit/delete within 15 minutes, report button routes to the account
 * manager. No general chat, no DMs.
 */
class EventCommentController extends Controller
{
    public function __construct(private EventCommentService $comments) {}

    public function store(Request $request, Event $event): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ], [
            'body.required' => 'نص التعليق مطلوب.',
            'body.max' => 'نص التعليق يجب ألا يتجاوز 500 حرف.',
        ]);

        $this->comments->post($event, $employee, $data['body']);

        return back()->with('success', 'تم نشر التعليق.');
    }

    public function update(Request $request, EventComment $comment): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ], [
            'body.required' => 'نص التعليق مطلوب.',
            'body.max' => 'نص التعليق يجب ألا يتجاوز 500 حرف.',
        ]);

        $this->comments->edit($comment, $employee, $data['body']);

        return back()->with('success', 'تم تعديل التعليق.');
    }

    public function destroy(EventComment $comment): RedirectResponse
    {
        $employee = auth('employee')->user();

        $this->comments->delete($comment, $employee);

        return back()->with('success', 'تم حذف التعليق.');
    }

    public function report(Request $request, EventComment $comment): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $this->comments->report($comment, $employee, $data['reason'] ?? null);

        return back()->with('success', 'تم إرسال التبليغ لمسؤول الحساب.');
    }
}
