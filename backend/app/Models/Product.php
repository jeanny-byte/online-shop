<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'images',
        'category',
        'featured',
        'stock_quantity',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'price' => 'decimal:2',
        'images' => 'array',
        'stock_quantity' => 'integer',
    ];

    /**
     * Dynamically resolve primary product image URL for local & production AWS environments.
     */
    public function getImageAttribute($value)
    {
        if ($value) {
            return \App\Traits\ResolvesImageUrls::resolveImageUrl($value);
        }

        // Fallback to first image in images array if available
        $rawImages = $this->getRawOriginal('images');
        if ($rawImages) {
            $decoded = is_string($rawImages) ? json_decode($rawImages, true) : $rawImages;
            if (is_array($decoded) && count($decoded) > 0) {
                return \App\Traits\ResolvesImageUrls::resolveImageUrl($decoded[0]);
            }
        }

        return null;
    }

    /**
     * Dynamically resolve all product images URLs.
     */
    public function getImagesAttribute($value)
    {
        $images = is_string($value) ? json_decode($value, true) : $value;
        if (!is_array($images) || empty($images)) {
            $singleImage = $this->getRawOriginal('image');
            return $singleImage ? [\App\Traits\ResolvesImageUrls::resolveImageUrl($singleImage)] : [];
        }

        return array_values(array_map(function ($img) {
            return \App\Traits\ResolvesImageUrls::resolveImageUrl($img);
        }, $images));
    }
}
