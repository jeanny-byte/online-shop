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
        'brands',
        'featured',
        'benefits',
        'ingredients',
        'how_to_use',
        'stock_quantity',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'price' => 'decimal:2',
        'images' => 'array',
        'stock_quantity' => 'integer',
    ];
}
