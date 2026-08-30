<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
    }
}
