@extends('emails.layouts.master', [
  'title' => ($storeSettings->newsletter_title ?? 'Welcome to the Royal Family') . ' - ' . ($storeSettings->store_name ?? 'Nelysah'),
  'previewText' => 'Welcome to the VIP Family! Enjoy exclusive beauty rituals, secret offers, and radiant skincare perks.',
  'unsubscribeEmail' => $subscriber->email,
  'theme' => 'pink-brown'
])

@section('content')
@php
  $storeName = $storeSettings->store_name ?? 'Nelysah';
  $newsletterTitle = $storeSettings->newsletter_title ?: 'Welcome to the Royal Family';
  $newsletterDescription = $storeSettings->newsletter_description ?: 'You have entered a sanctuary of radiant beauty, natural botanical formulations, and luxurious self-care rituals.';
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
@endphp

<!-- Status Badge & Greeting -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 18px;">
      <span style="display: inline-block; background-color: #fdf2f8; color: #be185d; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; padding: 6px 18px; border-radius: 9999px; border: 1px solid #fbcfe8; box-shadow: 0 2px 6px rgba(219, 39, 119, 0.08);">
        ✦ VIP Member Access ✦
      </span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 10px;">
      <h1 style="margin: 0; font-family: 'Georgia', 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #8c5a35; line-height: 1.3;">
        {{ $newsletterTitle }}
      </h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 26px; color: #786455; font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.6;">
      {{ $newsletterDescription }}
    </td>
  </tr>
</table>

<!-- Hero VIP Card (Soft Pink & Light Brown Framing) -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf5f0; border-radius: 16px; border: 1px solid #ebdcd0; margin-bottom: 28px; padding: 22px 20px;">
  <tr>
    <td align="center">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #be185d; font-weight: 700; display: block; margin-bottom: 6px;">
        A Special Gift For You
      </span>
      <h3 style="margin: 0 0 8px 0; font-family: 'Georgia', serif; font-size: 20px; color: #8c5a35; font-weight: 700;">
        Enjoy 10% Off Your First Ritual
      </h3>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #6d5849; line-height: 1.5;">
        Use your welcome voucher code at checkout to unlock your savings:
      </p>
      <div style="background-color: #ffffff; display: inline-block; padding: 10px 24px; border-radius: 10px; border: 2px dashed #f472b6; color: #be185d; font-weight: 800; font-size: 18px; letter-spacing: 0.12em; font-family: monospace; box-shadow: 0 2px 8px rgba(219, 39, 119, 0.08);">
        GLOWVIP10
      </div>
    </td>
  </tr>
</table>

<!-- VIP Benefits 3-Card Grid (White cards with Pink & Light Brown accents) -->
<h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #8c5a35; font-weight: 700; text-align: center;">
  Your Exclusive Member Privileges
</h3>

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
  <!-- Perk 1: Pink Highlight -->
  <tr>
    <td style="padding-bottom: 12px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #fce7f3; padding: 16px; box-shadow: 0 2px 10px rgba(219, 39, 119, 0.04);">
        <tr>
          <td width="44" valign="middle" align="center">
            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #fdf2f8; color: #db2777; font-size: 16px; text-align: center; line-height: 36px; font-weight: bold; border: 1px solid #fbcfe8;">
              ★
            </div>
          </td>
          <td valign="middle" style="padding-left: 14px; font-size: 14px; line-height: 1.4;">
            <strong style="color: #8c5a35; font-size: 15px; display: block; margin-bottom: 2px;">Early Access to New Drops</strong>
            <span style="color: #786455; font-size: 13px;">Be first in line for seasonal skincare launches, organic elixirs, and limited editions.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Perk 2: Light Brown Highlight -->
  <tr>
    <td style="padding-bottom: 12px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #ebdcd0; padding: 16px; box-shadow: 0 2px 10px rgba(140, 90, 53, 0.04);">
        <tr>
          <td width="44" valign="middle" align="center">
            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #faf5f0; color: #9a6744; font-size: 16px; text-align: center; line-height: 36px; font-weight: bold; border: 1px solid #ebdcd0;">
              %
            </div>
          </td>
          <td valign="middle" style="padding-left: 14px; font-size: 14px; line-height: 1.4;">
            <strong style="color: #8c5a35; font-size: 15px; display: block; margin-bottom: 2px;">Member-Only Secret Sales</strong>
            <span style="color: #786455; font-size: 13px;">Receive surprise flash sale invites, complimentary deluxe samples, and rewards.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Perk 3: Soft Pink & Brown Harmony -->
  <tr>
    <td>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #fce7f3; padding: 16px; box-shadow: 0 2px 10px rgba(219, 39, 119, 0.04);">
        <tr>
          <td width="44" valign="middle" align="center">
            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #fdf2f8; color: #db2777; font-size: 16px; text-align: center; line-height: 36px; font-weight: bold; border: 1px solid #fbcfe8;">
              ♥
            </div>
          </td>
          <td valign="middle" style="padding-left: 14px; font-size: 14px; line-height: 1.4;">
            <strong style="color: #8c5a35; font-size: 15px; display: block; margin-bottom: 2px;">Tailored Beauty &amp; Skin Rituals</strong>
            <span style="color: #786455; font-size: 13px;">Expert guidance and holistic regimen recommendations for your unique skin needs.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Call to Action Banner (Pink & Light Brown Warm Gradient + White Button) -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #8c5a3c 0%, #b86580 50%, #db4c86 100%); border-radius: 16px; text-align: center; color: #ffffff; padding: 34px 24px; box-shadow: 0 8px 24px rgba(219, 39, 119, 0.18);">
  <tr>
    <td>
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; color: #ffe4e6; font-weight: 700; display: block; margin-bottom: 8px;">
        Curated Skincare Treasures
      </span>
      <h2 style="margin: 0 0 10px 0; font-family: 'Georgia', serif; font-size: 23px; color: #ffffff; font-weight: 700;">
        Ready to enhance your natural radiance?
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #fdf2f8; max-width: 420px; margin-left: auto; margin-right: auto; line-height: 1.5;">
        Discover our nourishing serums, botanical creams, and glow-boosting essentials.
      </p>
      <a href="{{ $appUrl }}/shop" target="_blank" style="background-color: #ffffff; color: #9d174d; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; padding: 14px 38px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);">
        Explore The Boutique &rarr;
      </a>
    </td>
  </tr>
</table>
@endsection
