@extends('emails.layouts.master', [
  'title' => 'Payment Receipt - ' . $order->tracking_code,
  'previewText' => 'Your payment of ' . ($storeSettings->currency ?? 'GHS') . ' ' . number_format($order->order_total, 2) . ' was successfully received!'
])

@section('content')
@php
  $currency = $storeSettings->currency ?? 'GHS';
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
  $trackingUrl = $appUrl . '/track-order?code=' . urlencode($order->tracking_code);
@endphp

<!-- Status Badge & Greeting -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 20px;">
      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 16px; border-radius: 9999px; border: 1px solid #a7f3d0;">
        ✓ Payment Received
      </span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 8px;">
      <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; font-weight: 700; color: #1c1917; line-height: 1.3;">
        Official Payment Receipt
      </h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 28px; color: #78716c; font-size: 15px;">
      Hi <strong style="color: #1c1917;">{{ $order->customer_name }}</strong>, thank you! Your payment has been verified and applied to your order.
    </td>
  </tr>
</table>

<!-- Payment Amount Hero Card -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); border-radius: 16px; margin-bottom: 28px; text-align: center; color: #ffffff;">
  <tr>
    <td style="padding: 28px 24px;">
      <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #d4af37; font-weight: 600; display: block; margin-bottom: 6px;">
        Total Amount Paid
      </span>
      <h2 style="margin: 0; font-size: 34px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
        {{ $currency }} {{ number_format($order->order_total, 2) }}
      </h2>
      <span style="font-size: 13px; color: #d6d3d1; margin-top: 8px; display: inline-block;">
        Status: <strong style="color: #4ade80;">PAID &amp; CONFIRMED</strong>
      </span>
    </td>
  </tr>
</table>

<!-- Transaction Metadata Table -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; border-radius: 12px; border: 1px solid #ede9e3; margin-bottom: 28px; font-size: 14px;">
  <tr>
    <td style="padding: 20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="line-height: 2;">
        <tr>
          <td style="color: #78716c;">Transaction Reference:</td>
          <td align="right" style="color: #1c1917; font-weight: 600; font-family: monospace;">{{ $order->payment_reference ?? 'N/A' }}</td>
        </tr>
        <tr>
          <td style="color: #78716c;">Order Tracking Code:</td>
          <td align="right" style="color: #c98a2c; font-weight: 700; font-family: monospace;">{{ $order->tracking_code }}</td>
        </tr>
        <tr>
          <td style="color: #78716c;">Payment Method:</td>
          <td align="right" style="color: #1c1917; font-weight: 600;">{{ $order->payment_method }}</td>
        </tr>
        <tr>
          <td style="color: #78716c;">Date &amp; Time:</td>
          <td align="right" style="color: #1c1917; font-weight: 600;">{{ $order->paid_at ? $order->paid_at->format('M d, Y - h:i A') : now()->format('M d, Y - h:i A') }}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- What Happens Next Box -->
<div style="background-color: #fdfaf6; border-left: 4px solid #c98a2c; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 28px; font-size: 14px; color: #57534e; line-height: 1.6;">
  <strong style="color: #1c1917; display: block; margin-bottom: 4px;">What happens next?</strong>
  Your order is currently being packaged by our dispatch team. You will receive real-time updates as your items are prepared and dispatched for delivery.
</div>

<!-- Action Button -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="{{ $trackingUrl }}" target="_blank" style="background-color: #1c1917; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block;">
        View Order &amp; Track Status &rarr;
      </a>
    </td>
  </tr>
</table>
@endsection
