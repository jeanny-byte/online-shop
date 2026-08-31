<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Admin Account
        User::updateOrCreate(
            ['email' => 'admin@nelysah.com'],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'password' => Hash::make('Admin1122!'),
                'is_admin' => true,
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'password' => Hash::make('Admin1122!'),
                'is_admin' => true,
                'role' => 'admin',
            ]
        );

        // Default Starter Categories
        $defaultCategories = [
            [
                'name' => 'Cleansers',
                'description' => 'Gentle, effective cleansers for all skin types',
                'image' => 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753782909/nelysah_uploads/1753782908569-r1.jpg.jpg',
            ],
            [
                'name' => 'Serums',
                'description' => 'Targeted treatments for specific skin concerns',
                'image' => 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753783234/nelysah_uploads/1753783233815-cc5.jpg.jpg',
            ],
            [
                'name' => 'Moisturizers',
                'description' => 'Hydrating formulas for day and night',
                'image' => 'https://res.cloudinary.com/dy8crgoev/image/upload/v1753783234/nelysah_uploads/1753783233818-cc1.jpg.jpg',
            ],
            [
                'name' => 'Sunscreen',
                'description' => 'Broad-spectrum daily UV defense',
                'image' => 'https://images.unsplash.com/photo-1525286116112-b59af11adad1?q=80&w=1780&auto=format&fit=crop',
            ],
            [
                'name' => 'Body Care',
                'description' => 'Nourishing body lotions and oils',
                'image' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70e758?q=80&w=1470&auto=format&fit=crop',
            ],
        ];

        foreach ($defaultCategories as $cat) {
            Category::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'image' => $cat['image'],
                ]
            );
        }
    }
}
