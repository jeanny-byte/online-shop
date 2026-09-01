@extends('emails.layouts.master', [
  'title' => $subject ?? ($storeSettings->store_name ?? 'Newsletter Broadcast'),
  'previewText' => $previewText ?? 'Exclusive beauty updates and highlights from ' . ($storeSettings->store_name ?? 'Nelysah') . '.',
  'unsubscribeEmail' => $subscriber->email ?? null,
  'theme' => 'pink-brown'
])

@section('content')
@php
  $storeName = $storeSettings->store_name ?? 'Nelysah';
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
  $targetUrl = $ctaUrl ?? ($appUrl . '/shop');
  $btnText = $ctaText ?? 'Explore Collection';
@endphp

<!-- Category / Theme Pill -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 16px;">
      <span style="display: inline-block; background-color: #fdf2f8; color: #be185d; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; padding: 5px 16px; border-radius: 9999px; border: 1px solid #fbcfe8;">
        ✦ Special Edition ✦
      </span>
    </td>
  </tr>
</table>

<!-- Optional Hero Banner Image -->
@if(!empty($bannerUrl))
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 26px;">
  <tr>
    <td align="center">
      <img src="{{ $bannerUrl }}" alt="{{ $subject }}" style="width: 100%; max-width: 528px; border-radius: 14px; display: block; border: 2px solid #ebdcd0; box-shadow: 0 4px 16px rgba(140, 90, 53, 0.08);" />
    </td>
  </tr>
</table>
@endif

<!-- Headline & Subtitle -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding-bottom: 10px; text-align: center;">
      <h1 style="margin: 0; font-family: 'Georgia', 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #8c5a35; line-height: 1.3;">
        {{ $subject }}
      </h1>
    </td>
  </tr>
  @if(!empty($subtitle))
  <tr>
    <td style="padding-bottom: 22px; color: #db2777; font-size: 15px; font-weight: 600; text-align: center; letter-spacing: 0.02em;">
      {{ $subtitle }}
    </td>
  </tr>
  @endif
</table>

<!-- Divider Line (Warm Light Brown) -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
  <tr>
    <td align="center">
      <div style="width: 64px; height: 3px; background-color: #ebdcd0; border-radius: 2px;"></div>
    </td>
  </tr>
</table>

<!-- Rich Campaign Body (Rendered inside a clean White Card with subtle Light Brown frame) -->
<div style="background-color: #faf5f0; border: 1px solid #ebdcd0; border-radius: 14px; padding: 26px 24px; font-size: 15px; line-height: 1.75; color: #5a473b; margin-bottom: 30px;">
  {!! $campaignContent !!}
</div>

<!-- CTA Button (Vibrant Rose Pink & Light Brown with White Text) -->
@if(!empty($targetUrl))
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
  <tr>
    <td align="center">
      <a href="{{ $targetUrl }}" target="_blank" style="background: linear-gradient(135deg, #8c5a3c 0%, #b86580 50%, #db4c86 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; padding: 15px 40px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 18px rgba(219, 39, 119, 0.25);">
        {{ $btnText }} &rarr;
      </a>
    </td>
  </tr>
</table>
@endif
@endsection
