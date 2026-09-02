<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
    ];

    /**
     * Dynamically resolve category image URL.
     */
    public function getImageAttribute($value)
    {
        return \App\Traits\ResolvesImageUrls::resolveImageUrl($value);
    }
}
