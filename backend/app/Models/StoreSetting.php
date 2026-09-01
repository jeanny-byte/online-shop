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

        // If it points to storage, dynamically format with current request's scheme and host
        if (str_contains($value, '/storage/')) {
            $relativePath = substr($value, strpos($value, '/storage/'));
            return url($relativePath);
        }

        // If it's a relative path like "settings/logo.png"
        if (!str_starts_with($value, 'http://') && !str_starts_with($value, 'https://')) {
            return url('storage/' . ltrim($value, '/'));
        }

        return $value;
    }
}
