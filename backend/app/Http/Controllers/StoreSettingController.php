<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreSettingController extends Controller
{
    /**
     * Get store settings. Creates default settings if none exist.
     */
    public function index()
    {
        $settings = StoreSetting::firstOrCreate(
            ['id' => 1],
            [
                'store_name' => 'Nelysah Cosmetics',
                'store_email' => 'contact@nelysah.com',
                'store_phone' => '+233 55 724 6424',
                'whatsapp_number' => '233557246424',
                'store_address' => 'Accra, Ghana',
                'currency' => 'GHS',
                'shipping_fee' => 30.00,
                'newsletter_enabled' => true,
                'newsletter_title' => 'Join the Royal Family',
                'newsletter_description' => 'Subscribe for exclusive offers, skincare advice and new arrivals.',
            ]
        );

        return response()->json($settings);
    }

    /**
     * Update store settings (Admin only).
     */
    public function update(Request $request)
    {
        $settings = StoreSetting::firstOrCreate(['id' => 1]);
        
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_email' => 'nullable|email|max:255',
            'store_phone' => 'nullable|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
            'store_address' => 'nullable|string',
            'newsletter_enabled' => 'nullable|boolean',
            'newsletter_title' => 'nullable|string|max:255',
            'newsletter_description' => 'nullable|string',
            'currency' => 'nullable|string|max:10',
            'shipping_fee' => 'nullable|numeric|min:0',
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:20480',
            'logo_base64' => 'nullable|string',
        ]);

        // Clean & sanitize WhatsApp number
        if (!empty($validated['whatsapp_number'])) {
            $digitsOnly = preg_replace('/[^\d]/', '', $validated['whatsapp_number']);
            // If starts with 0 and is 10 digits (Ghana local format 055XXXXXXX), convert to 23355XXXXXXX
            if (str_starts_with($digitsOnly, '0') && strlen($digitsOnly) === 10) {
                $digitsOnly = '233' . substr($digitsOnly, 1);
            }
            $validated['whatsapp_number'] = $digitsOnly;
        }

        // Handle File Logo Upload
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            // Delete old logo if it exists in local storage
            if ($settings->logo_url && str_contains($settings->logo_url, '/storage/')) {
                $oldRel = substr($settings->logo_url, strpos($settings->logo_url, '/storage/') + 9);
                if (Storage::disk('public')->exists($oldRel)) {
                    Storage::disk('public')->delete($oldRel);
                }
            }

            $path = $request->file('logo')->store('settings', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        } 
        // Handle Base64 Logo Upload (fallback for proxy / payload resilience)
        elseif ($request->filled('logo_base64') && str_starts_with($request->input('logo_base64'), 'data:image')) {
            $base64Data = $request->input('logo_base64');
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $typeMatches)) {
                $imageType = strtolower($typeMatches[1]);
                $base64Content = substr($base64Data, strpos($base64Data, ',') + 1);
                $decoded = base64_decode($base64Content);

                if ($decoded !== false) {
                    if ($settings->logo_url && str_contains($settings->logo_url, '/storage/')) {
                        $oldRel = substr($settings->logo_url, strpos($settings->logo_url, '/storage/') + 9);
                        if (Storage::disk('public')->exists($oldRel)) {
                            Storage::disk('public')->delete($oldRel);
                        }
                    }

                    $ext = ($imageType === 'jpeg') ? 'jpg' : $imageType;
                    $fileName = 'settings/logo_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    Storage::disk('public')->put($fileName, $decoded);
                    $validated['logo_url'] = '/storage/' . $fileName;
                }
            }
        } elseif ($request->has('logo_url') && empty($request->input('logo_url'))) {
            // If logo was explicitly removed
            if ($settings->logo_url && str_contains($settings->logo_url, '/storage/')) {
                $oldRel = substr($settings->logo_url, strpos($settings->logo_url, '/storage/') + 9);
                if (Storage::disk('public')->exists($oldRel)) {
                    Storage::disk('public')->delete($oldRel);
                }
            }
            $validated['logo_url'] = null;
        }

        $settings->update($validated);

        return response()->json([
            'message' => 'Store settings updated successfully',
            'settings' => $settings
        ]);
    }
}
