<?php

namespace App\Services\Community;

use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventComment;
use App\Support\Notify;
use Illuminate\Auth\Access\AuthorizationException;

/**
 * H §6: member comments live ONLY under events — no general chat, no DMs.
 * Text only; the author may edit/delete within 15 minutes; a report button
 * routes the comment to the account manager.
 */
class EventCommentService
{
    public function post(Event $event, Employee $author, string $body): EventComment
    {
        $community = $event->community;

        if ($community === null || ! $this->isActiveMemberOrLeader($community, $author)) {
            throw new AuthorizationException('التعليقات لأعضاء المجتمع فقط.');
        }

        return EventComment::create([
            'event_id' => $event->id,
            'employee_id' => $author->id,
            'body' => $body,
        ]);
    }

    public function edit(EventComment $comment, Employee $author, string $body): EventComment
    {
        if (! $comment->isModifiableBy($author)) {
            abort(403, 'يمكن تعديل التعليق خلال 15 دقيقة من نشره ومن صاحبه فقط.');
        }

        $comment->update(['body' => $body, 'edited_at' => now()]);

        return $comment;
    }

    public function delete(EventComment $comment, Employee $author): void
    {
        if (! $comment->isModifiableBy($author)) {
            abort(403, 'يمكن حذف التعليق خلال 15 دقيقة من نشره ومن صاحبه فقط.');
        }

        $comment->delete();
    }

    /**
     * Report a comment — routes to the account manager (H §6: «زر تبليغ
     * يصل لمسؤول الحساب»).
     */
    public function report(EventComment $comment, Employee $reporter, ?string $reason = null): void
    {
        $event = $comment->event()->withoutGlobalScopes()->first();
        $community = $event?->community()->withoutGlobalScopes()->first();

        if ($community === null || ! $this->isActiveMemberOrLeader($community, $reporter)) {
            throw new AuthorizationException('التبليغ لأعضاء المجتمع فقط.');
        }

        Notify::sendToId(
            'community.comment.reported',
            Company::class,
            (int) $community->company_id,
            [
                'reporter' => $reporter->name,
                'community' => $community->name,
                'reason_suffix' => $reason !== null ? " — السبب: {$reason}" : '',
            ],
            ['data' => [
                'comment_id' => $comment->id,
                'event_id' => $comment->event_id,
                'community_id' => $community->id,
                'comment_body' => mb_substr($comment->body, 0, 200),
                'comment_author_id' => $comment->employee_id,
                'reported_by' => $reporter->id,
            ]],
        );
    }

    private function isActiveMemberOrLeader(Community $community, Employee $employee): bool
    {
        $isMember = CommunityMember::query()
            ->where('community_id', $community->id)
            ->where('employee_id', $employee->id)
            ->where('status', CommunityMember::STATUS_ACTIVE)
            ->exists();

        return $isMember || $community->isLeader($employee);
    }
}
