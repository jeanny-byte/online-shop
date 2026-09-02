<?php

namespace App\Traits;

trait ResolvesImageUrls
{
    /**
     * Dynamically resolve any image or asset URL to ensure it resolves accurately
     * across local development, AWS EC2, S3, reverse proxies, and production domains.
     *
     * Handles:
     * - Stale 'localhost' or '127.0.0.1' database records -> resolves to active request host or APP_URL
     * - Relative paths like '/storage/...' or 'product-images/...' -> resolves to full valid URL
     * - External URLs (e.g. AWS S3, Cloudinary, Unsplash) -> preserved as-is with HTTPS enforcement
     * - Base64 data URLs & blobs -> returned untouched
     * - Mixed Content prevention: enforces https in production or behind SSL termination (ALB/CloudFront)
     */
    public static function resolveImageUrl(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $trimmed = trim($url);
        if ($trimmed === '') {
            return null;
        }

        // Return base64 data URLs and object blobs as-is
        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'blob:')) {
            return $trimmed;
        }

        $isProduction = config('app.env') === 'production';
        $isSecureRequest = request()->secure()
            || request()->header('x-forwarded-proto') === 'https'
            || str_starts_with((string)config('app.url'), 'https://');

        // Check if it's already an external absolute URL (e.g. Cloudinary, AWS S3, Unsplash)
        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            // If it's NOT pointing to a local host, treat as external CDN / storage
            if (!str_contains($trimmed, 'localhost') && !str_contains($trimmed, '127.0.0.1')) {
                if (($isProduction || $isSecureRequest) && str_starts_with($trimmed, 'http://')) {
                    return preg_replace('/^http:\/\//', 'https://', $trimmed);
                }
                return $trimmed;
            }
        }

        // Extract relative storage path from full localhost URL or relative path
        $relativePath = $trimmed;
        if (str_contains($relativePath, '/storage/')) {
            $relativePath = substr($relativePath, strpos($relativePath, '/storage/'));
        } elseif (!str_starts_with($relativePath, 'http://') && !str_starts_with($relativePath, 'https://')) {
            $clean = ltrim($relativePath, '/');
            $relativePath = str_starts_with($clean, 'storage/') ? '/' . $clean : '/storage/' . $clean;
        }

        // Generate full URL based on the active incoming HTTP request host
        // url() automatically uses the current host/port from the request or falls back to APP_URL
        $fullUrl = url($relativePath);

        // Enforce HTTPS if browsing securely, behind AWS ALB / CloudFront, or in production
        if ($isProduction || $isSecureRequest) {
            $fullUrl = preg_replace('/^http:\/\//', 'https://', $fullUrl);
        }

        return $fullUrl;
    }
}
