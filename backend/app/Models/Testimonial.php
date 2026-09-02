<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'quote',
        'rating',
        'image',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    /**
     * Dynamically resolve testimonial avatar/image URL.
     */
    public function getImageAttribute($value)
    {
        return \App\Traits\ResolvesImageUrls::resolveImageUrl($value);
    }
}
