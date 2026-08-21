<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Resolves stored upload paths to browser-usable URLs.
 *
 * User uploads live on the default filesystem disk, which is private
 * (local "private" root in dev, private S3 bucket in production). They are
 * served exclusively through temporary signed URLs — 15 minutes by default
 * (config: filesystems.signed_url_minutes). No file is ever public.
 *
 * Legacy values (absolute "/storage/…" paths from the old public disk and
 * seeded static assets) are returned untouched so old data keeps rendering
 * until it is migrated to the private disk.
 */
class FileUrl
{
    public static function temporary(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        // Legacy absolute URLs / public-disk paths (e.g. "/storage/sports/padel.svg").
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
            return $path;
        }

        return Storage::temporaryUrl(
            $path,
            now()->addMinutes((int) config('filesystems.signed_url_minutes', 15)),
        );
    }
}
