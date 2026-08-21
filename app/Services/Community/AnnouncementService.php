<?php

namespace App\Services\Community;

use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\Employee;
use App\Services\ActivityLogService;
use App\Services\Authorization\AuthorizationService;
use App\Support\Notify;

/**
 * H §6: announcements are text + link only (no images, no attachments),
 * posted by a leader or coordinator ONLY. The author may edit or delete
 * within 15 minutes. No general chat and no DMs exist anywhere.
 */
class AnnouncementService
{
    public function __construct(private AuthorizationService $authorization) {}

    public function post(Community $community, Employee $author, string $body, ?string $linkUrl = null): CommunityAnnouncement
    {
        $actingUser = CommunityActor::forEmployee($author);

        if ($actingUser === null || ! $this->authorization->can($actingUser, 'announcement.post', 'community', $community->id)) {
            abort(403, 'الإعلانات من قائد المجتمع أو المنسّق فقط.');
        }

        $announcement = CommunityAnnouncement::create([
            'community_id' => $community->id,
            'employee_id' => $author->id,
            'body' => $body,
            'link_url' => $linkUrl,
        ]);

        foreach ($community->members as $member) {
            if ($member->id === $author->id) {
                continue;
            }

            Notify::send(
                'community.announcement',
                $member,
                ['community' => $community->name, 'excerpt' => mb_substr($body, 0, 100)],
                ['data' => ['community_id' => $community->id]],
            );
        }

        return $announcement;
    }

    /**
     * Author-only edit inside the 15-minute window.
     */
    public function edit(CommunityAnnouncement $announcement, Employee $author, string $body, ?string $linkUrl = null): CommunityAnnouncement
    {
        if (! $announcement->isModifiableBy($author)) {
            abort(403, 'يمكن تعديل الإعلان خلال 15 دقيقة من نشره ومن صاحبه فقط.');
        }

        $announcement->update([
            'body' => $body,
            'link_url' => $linkUrl,
            'edited_at' => now(),
        ]);

        return $announcement;
    }

    /**
     * Author-only delete inside the 15-minute window.
     */
    public function delete(CommunityAnnouncement $announcement, Employee $author): void
    {
        if (! $announcement->isModifiableBy($author)) {
            abort(403, 'يمكن حذف الإعلان خلال 15 دقيقة من نشره ومن صاحبه فقط.');
        }

        $community = $announcement->community;

        $announcement->delete();

        if ($community !== null) {
            ActivityLogService::log(
                $community->company_id,
                $community,
                'community_announcement_deleted',
                "حذف {$author->name} إعلاناً من مجتمع «{$community->name}»",
                ['announcement_id' => $announcement->id],
            );
        }
    }
}
