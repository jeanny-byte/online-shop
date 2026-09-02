<?php
 
use App\Http\Controllers\StoreSettingController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Stream uploaded public storage files and logo directly with CORS headers
Route::options('/settings/logo', function () {
    return response('', 200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers' => '*',
    ]);
});
Route::get('/settings/logo', [StoreSettingController::class, 'logo']);

Route::options('/storage/{path}', function () {
    return response('', 200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers' => '*',
    ]);
})->where('path', '.*');
Route::get('/storage/{path}', [StoreSettingController::class, 'streamStorageFile'])->where('path', '.*');

