<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_name',
        'store_email',
        'store_phone',
        'store_address',
        'logo_url',
        'whatsapp_number',
        'newsletter_enabled',
        'newsletter_title',
        'newsletter_description',
        'currency',
        'shipping_fee',
    ];

    protected $casts = [
        'newsletter_enabled' => 'boolean',
        'shipping_fee' => 'decimal:2',
    ];

    /**
     * Dynamically resolve logo URL to work seamlessly across both local and production environments.
     */
    public function getLogoUrlAttribute($value)
    {
        if (!$value) {
            return null;
        }

        // Return base64 data URLs as-is
        if (str_starts_with($value, 'data:')) {
            return $value;
        }

        $relativePath = $value;
        if (str_contains($value, '/storage/')) {
            $relativePath = substr($value, strpos($value, '/storage/'));
        } elseif (!str_starts_with($value, 'http://') && !str_starts_with($value, 'https://')) {
            $relativePath = '/storage/' . ltrim($value, '/');
        }

        // If it's already an external absolute URL (e.g. Cloudinary, AWS S3)
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            if (!str_contains($value, 'localhost') && !str_contains($value, '127.0.0.1')) {
                // Enforce HTTPS if request is secure or forwarded
                if (request()->secure() || request()->header('x-forwarded-proto') === 'https') {
                    return preg_replace('/^http:\/\//', 'https://', $value);
                }
                return $value;
            }
        }

        // Dynamically resolve URL using current request host and scheme
        $fullUrl = url($relativePath);
        if (request()->secure() || request()->header('x-forwarded-proto') === 'https') {
            $fullUrl = preg_replace('/^http:\/\//', 'https://', $fullUrl);
        }

        return $fullUrl;
    }
}
