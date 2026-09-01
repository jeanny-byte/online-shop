@php
  $storeName = $storeSettings->store_name ?? config('app.name', 'Nelysah');
  $storeEmail = $storeSettings->store_email ?? 'contact@nelysah.com';
  $storePhone = $storeSettings->store_phone ?? '+233 55 724 6424';
  $storeAddress = $storeSettings->store_address ?? 'Accra, Ghana';
  $whatsappNumber = $storeSettings->whatsapp_number ?? '233557246424';
  $cleanWhatsapp = preg_replace('/[^\d]/', '', $whatsappNumber);
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
  $isPinkBrown = ($theme ?? '') === 'pink-brown';
@endphp

<tr>
  <td style="background-color: {{ $isPinkBrown ? '#faf5f0' : '#faf9f6' }}; padding: 32px 36px 36px 36px; border-top: 1px solid {{ $isPinkBrown ? '#ebdcd0' : '#ede9e3' }}; text-align: center;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <!-- Need Help Support Box -->
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <table border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid {{ $isPinkBrown ? '#ebdcd0' : '#e7e3dc' }}; padding: 16px 20px;">
            <tr>
              <td align="center" style="font-size: 13px; color: {{ $isPinkBrown ? '#6d5849' : '#57534e' }}; line-height: 1.6;">
                <strong>Need assistance or have beauty questions?</strong><br />
                Email us at <a href="mailto:{{ $storeEmail }}" style="color: {{ $isPinkBrown ? '#be185d' : '#c98a2c' }}; text-decoration: none; font-weight: 600;">{{ $storeEmail }}</a>
                @if($storePhone)
                  &bull; Call <a href="tel:{{ $storePhone }}" style="color: {{ $isPinkBrown ? '#6d5849' : '#57534e' }}; text-decoration: none;">{{ $storePhone }}</a>
                @endif
                @if($cleanWhatsapp)
                  <br />
                  <a href="https://wa.me/{{ $cleanWhatsapp }}" target="_blank" style="color: #25D366; text-decoration: none; font-weight: 600; font-size: 12px; display: inline-block; margin-top: 6px;">
                    &bull; Chat with Us on WhatsApp &bull;
                  </a>
                @endif
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Address & Store Info -->
      <tr>
        <td align="center" style="font-size: 12px; color: {{ $isPinkBrown ? '#8c7665' : '#8c827a' }}; line-height: 1.6; padding-bottom: 12px;">
          <strong>{{ $storeName }}</strong><br />
          {{ $storeAddress }}
        </td>
      </tr>

      <!-- Quick Navigation Links -->
      <tr>
        <td align="center" style="font-size: 12px; color: {{ $isPinkBrown ? '#8c7665' : '#8c827a' }}; padding-bottom: 16px;">
          <a href="{{ $appUrl }}/shop" style="color: {{ $isPinkBrown ? '#8c5a35' : '#78716c' }}; text-decoration: none; margin: 0 8px; font-weight: 500;">Shop Collection</a> &bull;
          <a href="{{ $appUrl }}/track-order" style="color: {{ $isPinkBrown ? '#8c5a35' : '#78716c' }}; text-decoration: none; margin: 0 8px; font-weight: 500;">Track Orders</a> &bull;
          <a href="{{ $appUrl }}/faq" style="color: {{ $isPinkBrown ? '#8c5a35' : '#78716c' }}; text-decoration: none; margin: 0 8px; font-weight: 500;">FAQ</a> &bull;
          <a href="{{ $appUrl }}/contact" style="color: {{ $isPinkBrown ? '#8c5a35' : '#78716c' }}; text-decoration: none; margin: 0 8px; font-weight: 500;">Contact Us</a>
        </td>
      </tr>

      <!-- Unsubscribe Link for Newsletter (if applicable) -->
      @if(isset($unsubscribeEmail))
      <tr>
        <td align="center" style="font-size: 11px; color: {{ $isPinkBrown ? '#a89485' : '#a8a29e' }}; padding-bottom: 12px;">
          You received this email because you subscribed to VIP updates from {{ $storeName }}.<br />
          <a href="{{ $appUrl }}/api/newsletter/unsubscribe?email={{ urlencode($unsubscribeEmail) }}" style="color: {{ $isPinkBrown ? '#be185d' : '#a8a29e' }}; text-decoration: underline;">
            Unsubscribe from this mailing list
          </a>
        </td>
      </tr>
      @endif

      <!-- Copyright -->
      <tr>
        <td align="center" style="font-size: 11px; color: {{ $isPinkBrown ? '#bda899' : '#b7b1aa' }};">
          &copy; {{ date('Y') }} {{ $storeName }}. All rights reserved.
        </td>
      </tr>
    </table>
  </td>
</tr>
