@extends('emails.layouts.master', [
  'title' => 'Order Cancelled - #' . $order->tracking_code,
  'previewText' => 'Your order #' . $order->tracking_code . ' has been cancelled.'
])

@section('content')
@php
  $currency = $storeSettings->currency ?? 'GHS';
  $storeEmail = $storeSettings->store_email ?? 'contact@nelysah.com';
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
@endphp

<!-- Status Badge & Greeting -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 20px;">
      <span style="display: inline-block; background-color: #fef2f2; color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 16px; border-radius: 9999px; border: 1px solid #fecaca;">
        Order Cancelled
      </span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 8px;">
      <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; font-weight: 700; color: #1c1917; line-height: 1.3;">
        Order Notice #{{ $order->tracking_code }}
      </h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 28px; color: #78716c; font-size: 15px;">
      Hello <strong style="color: #1c1917;">{{ $order->customer_name }}</strong>, your order <strong>#{{ $order->tracking_code }}</strong> has been cancelled.
    </td>
  </tr>
</table>

<!-- Info Box -->
<div style="background-color: #faf9f6; border-radius: 12px; border: 1px solid #ede9e3; padding: 20px; margin-bottom: 28px; font-size: 14px; line-height: 1.6; color: #57534e;">
  <p style="margin: 0 0 12px 0;">
    If you did not request this cancellation or have already paid via Paystack / Card / Mobile Money, our customer care team is available to assist with immediate resolution or refund processing.
  </p>
  <p style="margin: 0;">
    Total order value: <strong>{{ $currency }} {{ number_format($order->order_total, 2) }}</strong><br />
    Payment Status: <strong style="text-transform: capitalize;">{{ $order->payment_status }}</strong>
  </p>
</div>

<!-- Support CTA Button -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 16px;">
      <a href="mailto:{{ $storeEmail }}?subject=Order%20Cancellation%20Support%20{{ $order->tracking_code }}" style="background-color: #1c1917; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block;">
        Contact Customer Support &rarr;
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="{{ $appUrl }}/shop" style="color: #c98a2c; text-decoration: underline; font-size: 14px;">
        Browse Store &amp; Continue Shopping
      </a>
    </td>
  </tr>
</table>
@endsection
