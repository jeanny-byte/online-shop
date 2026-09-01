@extends('emails.layouts.master', [
  'title' => 'Order Update: ' . $order->order_status . ' - #' . $order->tracking_code,
  'previewText' => 'Your order #' . $order->tracking_code . ' is now ' . $order->order_status . '.'
])

@section('content')
@php
  $currency = $storeSettings->currency ?? 'GHS';
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
  $trackingUrl = $appUrl . '/track-order?code=' . urlencode($order->tracking_code);
  
  $status = strtolower($order->order_status);
  $badgeColor = '#0284c7'; // default sky
  $badgeBg = '#f0f9ff';
  $badgeBorder = '#bae6fd';

  if ($status === 'processing') {
    $badgeColor = '#7c2d12';
    $badgeBg = '#ffedd5';
    $badgeBorder = '#fed7aa';
    $statusDescription = 'Your order is currently being inspected, carefully packaged, and prepared for dispatch.';
  } elseif ($status === 'shipped') {
    $badgeColor = '#431407';
    $badgeBg = '#fef3c7';
    $badgeBorder = '#fde68a';
    $statusDescription = 'Great news! Your package is on the way with our delivery courier. Please keep your phone reachable.';
  } elseif ($status === 'delivered') {
    $badgeColor = '#065f46';
    $badgeBg = '#ecfdf5';
    $badgeBorder = '#a7f3d0';
    $statusDescription = 'Your package has been successfully delivered. We hope you adore your new skincare products!';
  } else {
    $statusDescription = 'Your order status has been updated to ' . $order->order_status . '.';
  }
@endphp

<!-- Status Badge & Greeting -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 20px;">
      <span style="display: inline-block; background-color: {{ $badgeBg }}; color: {{ $badgeColor }}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 16px; border-radius: 9999px; border: 1px solid {{ $badgeBorder }};">
        Status: {{ $order->order_status }}
      </span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 8px;">
      <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; font-weight: 700; color: #1c1917; line-height: 1.3;">
        Order Update #{{ $order->tracking_code }}
      </h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 24px; color: #78716c; font-size: 15px; max-width: 480px; margin: 0 auto;">
      Hello <strong style="color: #1c1917;">{{ $order->customer_name }}</strong>, {{ $statusDescription }}
    </td>
  </tr>
</table>

<!-- Visual Progress Bar / Stepper -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; border-radius: 14px; border: 1px solid #ede9e3; margin-bottom: 28px; padding: 20px;">
  <tr>
    <td>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center; font-size: 12px;">
        <tr>
          @php
            $steps = [
              ['id' => 'pending', 'label' => 'Pending'],
              ['id' => 'processing', 'label' => 'Processing'],
              ['id' => 'shipped', 'label' => 'Shipped'],
              ['id' => 'delivered', 'label' => 'Delivered'],
            ];
            $currentFound = false;
            $currentIndex = 0;
            foreach($steps as $idx => $s) {
              if ($s['id'] === $status) {
                $currentIndex = $idx;
              }
            }
          @endphp

          @foreach($steps as $idx => $s)
            @php
              $isCompleted = $idx <= $currentIndex;
              $isCurrent = $idx === $currentIndex;
            @endphp
            <td width="25%" align="center" valign="top">
              <div style="width: 28px; height: 28px; border-radius: 50%; background-color: {{ $isCompleted ? '#1c1917' : '#e7e5e4' }}; color: {{ $isCompleted ? '#ffffff' : '#78716c' }}; font-weight: 700; line-height: 28px; margin: 0 auto 6px auto; font-size: 12px;">
                {{ $isCompleted ? '✓' : ($idx + 1) }}
              </div>
              <span style="font-weight: {{ $isCurrent ? '700' : '500' }}; color: {{ $isCurrent ? '#c98a2c' : ($isCompleted ? '#1c1917' : '#a8a29e') }}; display: block;">
                {{ $s['label'] }}
              </span>
            </td>
          @endforeach
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Delivery & Courier Info -->
@if($order->driver)
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdfaf6; border: 1px solid #fed7aa; border-radius: 12px; margin-bottom: 28px; padding: 18px 20px;">
  <tr>
    <td>
      <strong style="color: #9a3412; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
        Assigned Delivery Courier
      </strong>
      <p style="margin: 0; font-size: 14px; color: #1c1917; line-height: 1.5;">
        Driver: <strong>{{ $order->driver->name }}</strong><br />
        Contact: <a href="tel:{{ $order->driver->phone }}" style="color: #c98a2c; font-weight: 600; text-decoration: none;">{{ $order->driver->phone }}</a>
      </p>
    </td>
  </tr>
</table>
@endif

<!-- Quick Items Preview -->
<div style="border-top: 1px solid #ede9e3; padding-top: 20px; margin-bottom: 28px;">
  <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c; font-weight: 600; display: block; margin-bottom: 12px;">
    Order Summary ({{ count($order->items) }} {{ count($order->items) === 1 ? 'item' : 'items' }}) &bull; Total: {{ $currency }} {{ number_format($order->order_total, 2) }}
  </span>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    @foreach($order->items as $item)
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #44403c;">
        &bull; {{ $item->product->name ?? 'Product' }} &times; {{ $item->quantity }}
      </td>
      <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1c1917;">
        {{ $currency }} {{ number_format($item->price_per_item * $item->quantity, 2) }}
      </td>
    </tr>
    @endforeach
  </table>
</div>

<!-- CTA Button -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="{{ $trackingUrl }}" target="_blank" style="background-color: #1c1917; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block;">
        Track Live Delivery &rarr;
      </a>
    </td>
  </tr>
</table>
@endsection
