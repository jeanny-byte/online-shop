<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class StorageService
{
    /**
     * Ensure that the public storage directory or symlink is healthy.
     * Detects and repairs broken symlinks (common on shared hosts / FTP deploys).
     */
    public static function ensureStorageLink(): void
    {
        $publicStorage = public_path('storage');

        // Check if public/storage is a broken symlink (link exists, but target cannot be found)
        if (is_link($publicStorage) && !file_exists($publicStorage)) {
            @unlink($publicStorage);
        }

        // If neither symlink nor directory exists, attempt artisan storage:link or create directory
        if (!file_exists($publicStorage)) {
            try {
                Artisan::call('storage:link');
            } catch (\Throwable $e) {
                // Ignore symlink permission errors on shared hosting
            }

            // If still missing (symlink disabled by host in php.ini), create physical directory
            if (!file_exists($publicStorage) && !is_link($publicStorage)) {
                @mkdir($publicStorage, 0775, true);
            }
        }
    }

    /**
     * Mirrors an uploaded file to public/storage and any surrounding web roots
     * so that the web server (Apache/Nginx) can serve it statically without invoking PHP.
     */
    public static function mirrorFile(string $relativePath): void
    {
        $cleanPath = ltrim(preg_replace('/^storage\//', '', $relativePath), '/');

        // Locate source file on storage disk
        $sourcePath = Storage::disk('public')->path($cleanPath);
        if (!file_exists($sourcePath) || is_dir($sourcePath)) {
            $sourcePath = storage_path('app/public/' . $cleanPath);
        }

        if (!file_exists($sourcePath) || is_dir($sourcePath)) {
            return;
        }

        $contents = @file_get_contents($sourcePath);
        if ($contents === false) {
            return;
        }

        // Potential static web roots in shared hosting (cPanel, Plesk) and standalone setups
        $destinations = [
            public_path('storage/' . $cleanPath),
            base_path('../public_html/storage/' . $cleanPath),
            base_path('../public_html/backend/public/storage/' . $cleanPath),
            base_path('../storage/' . $cleanPath),
        ];

        foreach ($destinations as $dest) {
            try {
                $dir = dirname($dest);
                if (!file_exists($dir)) {
                    @mkdir($dir, 0775, true);
                }
                if (!file_exists($dest) || filesize($dest) !== strlen($contents)) {
                    @file_put_contents($dest, $contents, LOCK_EX);
                    @chmod($dest, 0664);
                }
            } catch (\Throwable $e) {
                // Continue to next destination
            }
        }
    }

    /**
     * Resolves physical path on disk across varying hosting configurations
     * (Docker, AWS, cPanel public_html, local artisan serve).
     * If found and missing in public/storage, automatically self-heals by copying.
     */
    public static function resolvePhysicalPath(string $path): ?string
    {
        $rawPath = urldecode(ltrim($path, '/'));
        $cleanPath = preg_replace('/^storage\//', '', $rawPath);

        $candidates = [
            storage_path('app/public/' . $cleanPath),
            public_path('storage/' . $cleanPath),
            storage_path('app/' . $cleanPath),
            storage_path('app/private/' . $cleanPath),
            base_path('storage/app/public/' . $cleanPath),
            base_path('../public_html/storage/' . $cleanPath),
            base_path('../storage/app/public/' . $cleanPath),
            base_path('../backend/storage/app/public/' . $cleanPath),
            public_path($cleanPath),
            storage_path('app/public/' . $rawPath),
            public_path('storage/' . $rawPath),
            dirname(base_path()) . '/backend/storage/app/public/' . $cleanPath,
            dirname(base_path()) . '/storage/app/public/' . $cleanPath,
        ];

        $filePath = null;
        foreach ($candidates as $candidate) {
            if (file_exists($candidate) && !is_dir($candidate)) {
                $filePath = $candidate;
                break;
            }
        }

        // Self-healing: if found in storage but missing in public static directory, mirror it
        if ($filePath && !file_exists(public_path('storage/' . $cleanPath))) {
            self::mirrorFile($cleanPath);
        }

        return $filePath;
    }

    /**
     * Recursively syncs all files in storage/app/public into public/storage.
     * Useful for initial boot, migrations, and artisan commands.
     */
    public static function syncDirectory(string $subDirectory = ''): int
    {
        self::ensureStorageLink();

        $baseSource = storage_path('app/public' . ($subDirectory ? '/' . trim($subDirectory, '/') : ''));
        if (!file_exists($baseSource) || !is_dir($baseSource)) {
            return 0;
        }

        $count = 0;
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($baseSource, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            if ($item->isFile()) {
                $relative = substr($item->getPathname(), strlen(storage_path('app/public')) + 1);
                $relative = str_replace('\\', '/', $relative);
                self::mirrorFile($relative);
                $count++;
            }
        }

        return $count;
    }
}
