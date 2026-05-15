<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::define('admin', function ($user) {
            return $user->is_admin === true || $user->role === 'admin';
        });

        \Illuminate\Support\Facades\Gate::define('driver', function ($user) {
            return $user->is_driver === true || $user->role === 'driver';
        });

        \Illuminate\Support\Facades\Gate::define('staff', function ($user) {
            return $user->is_admin || $user->is_driver || in_array($user->role, ['admin', 'driver']);
        });
    }
}
