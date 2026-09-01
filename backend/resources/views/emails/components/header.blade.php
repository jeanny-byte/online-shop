@php
  $storeName = $storeSettings->store_name ?? config('app.name', 'Nelysah');
  $logoUrl = $storeSettings->logo_url ?? null;
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
  $isPinkBrown = ($theme ?? '') === 'pink-brown';
@endphp

<tr>
  <td align="center" style="background: {{ $isPinkBrown ? 'linear-gradient(135deg, #8c5a3c 0%, #b86580 50%, #db4c86 100%)' : 'linear-gradient(135deg, #1c1917 0%, #292524 100%)' }}; padding: 34px 24px; text-align: center; border-bottom: 3px solid {{ $isPinkBrown ? '#e8a598' : '#d4af37' }};">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="{{ $appUrl }}" target="_blank" style="text-decoration: none; display: inline-block;">
            @if($logoUrl)
              <img src="{{ $logoUrl }}" alt="{{ $storeName }}" style="max-height: 52px; max-width: 220px; display: block; margin: 0 auto;" />
            @else
              <span style="font-family: 'Georgia', 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 0.06em; text-transform: uppercase; display: block; text-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                {{ $storeName }}
              </span>
            @endif
          </a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 6px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: {{ $isPinkBrown ? '#ffe4e6' : '#d4af37' }}; font-weight: 600;">
            Luxury Beauty &bull; Skincare &bull; Wellness
          </span>
        </td>
      </tr>
    </table>
  </td>
</tr>
