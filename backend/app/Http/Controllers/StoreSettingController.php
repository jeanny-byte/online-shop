<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreSettingController extends Controller
{
    public function index()
    {
        $settings = StoreSetting::first();
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = StoreSetting::first();
        
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_email' => 'nullable|email|max:255',
            'store_phone' => 'nullable|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'store_address' => 'nullable|string',
            'newsletter_enabled' => 'boolean',
            'newsletter_title' => 'nullable|string|max:255',
            'newsletter_description' => 'nullable|string',
            'currency' => 'string|max:10',
            'shipping_fee' => 'numeric|min:0',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($settings->logo_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $settings->logo_url));
            }
            $path = $request->file('logo')->store('settings', 'public');
            $validated['logo_url'] = Storage::url($path);
        }

        $settings->update($validated);

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings
        ]);
    }
}
