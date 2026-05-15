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
}
