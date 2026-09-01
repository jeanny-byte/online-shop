<?php
 
use App\Http\Controllers\StoreSettingController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Stream uploaded public storage files and logo directly with CORS headers
Route::get('/settings/logo', [StoreSettingController::class, 'logo']);
Route::get('/storage/{path}', [StoreSettingController::class, 'streamStorageFile'])->where('path', '.*');
