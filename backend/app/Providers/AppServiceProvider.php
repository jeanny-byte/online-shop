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
        // Enforce HTTPS scheme in production or behind AWS ALB / CloudFront reverse proxy
        if (
            config('app.env') === 'production'
            || request()->header('x-forwarded-proto') === 'https'
            || str_starts_with((string)config('app.url'), 'https://')
        ) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Auto-ensure public storage directory or symlink exists and is healthy
        \App\Services\StorageService::ensureStorageLink();
        \App\Services\StorageService::syncDirectory('settings');

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
