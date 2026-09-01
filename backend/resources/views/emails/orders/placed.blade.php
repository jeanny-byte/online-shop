@extends('emails.layouts.master', [
  'title' => 'Order Confirmation #' . $order->tracking_code,
  'previewText' => 'Thank you for your order #' . $order->tracking_code . '. We are preparing your luxury package!'
])

@section('content')
@php
  $currency = $storeSettings->currency ?? 'GHS';
  $appUrl = env('FRONTEND_URL', env('APP_URL', 'http://localhost:8080'));
  $trackingUrl = $appUrl . '/track-order?code=' . urlencode($order->tracking_code);
  
  $subtotal = 0;
  foreach($order->items as $item) {
    $subtotal += ($item->price_per_item * $item->quantity);
  }
  $shippingFee = max(0, (float)$order->order_total - $subtotal);
@endphp

<!-- Status Badge & Greeting -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 20px;">
      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 16px; border-radius: 9999px; border: 1px solid #a7f3d0;">
        ✓ Order Confirmed
      </span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 8px;">
      <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; font-weight: 700; color: #1c1917; line-height: 1.3;">
        Thank You for Your Order!
      </h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom: 28px; color: #78716c; font-size: 15px;">
      Hello <strong style="color: #1c1917;">{{ $order->customer_name }}</strong>, we’ve received your order and are preparing it with care.
    </td>
  </tr>
</table>

<!-- Order Highlights Banner -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; border-radius: 12px; border: 1px solid #ede9e3; margin-bottom: 28px;">
  <tr>
    <td style="padding: 18px 20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="50%" valign="top" style="font-size: 13px; color: #78716c; line-height: 1.5;">
            <span style="text-transform: uppercase; font-size: 11px; font-weight: 600; color: #a8a29e; letter-spacing: 0.05em;">Order Tracking ID</span><br />
            <strong style="font-size: 16px; color: #c98a2c; font-family: monospace;">{{ $order->tracking_code }}</strong>
          </td>
          <td width="50%" valign="top" align="right" style="font-size: 13px; color: #78716c; line-height: 1.5;">
            <span style="text-transform: uppercase; font-size: 11px; font-weight: 600; color: #a8a29e; letter-spacing: 0.05em;">Order Date</span><br />
            <strong style="font-size: 14px; color: #1c1917;">{{ $order->created_at->format('M d, Y') }}</strong>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Order Items List Table -->
<h3 style="margin: 0 0 14px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; color: #1c1917; font-weight: 700; border-bottom: 2px solid #f5f0ea; padding-bottom: 8px;">
  Items in Your Order
</h3>

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
  @foreach($order->items as $item)
  @php
    $productImage = $item->product->image ?? null;
    $productName = $item->product->name ?? 'Product Item';
    $itemTotal = $item->price_per_item * $item->quantity;
  @endphp
  <tr>
    <td style="padding: 14px 0; border-bottom: 1px solid #f5f0ea;" valign="middle">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          @if($productImage)
          <td width="64" valign="middle" style="padding-right: 14px;">
            <img src="{{ $productImage }}" alt="{{ $productName }}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid #e7e3dc; display: block;" />
          </td>
          @endif
          <td valign="middle" style="font-size: 14px; line-height: 1.4;">
            <strong style="color: #1c1917; display: block; margin-bottom: 4px;">{{ $productName }}</strong>
            <span style="color: #78716c; font-size: 13px;">Qty: {{ $item->quantity }} &times; {{ $currency }} {{ number_format($item->price_per_item, 2) }}</span>
          </td>
          <td width="90" align="right" valign="middle" style="font-size: 14px; font-weight: 700; color: #1c1917;">
            {{ $currency }} {{ number_format($itemTotal, 2) }}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  @endforeach
</table>

<!-- Price Breakdown & Totals -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
  <tr>
    <td width="50%" valign="top" style="padding-right: 12px;">
      <!-- Payment & Delivery Snapshot -->
      <div style="background-color: #faf9f6; border-radius: 10px; padding: 14px 16px; border: 1px solid #ede9e3; font-size: 13px; line-height: 1.5; color: #57534e;">
        <strong style="color: #1c1917; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Payment Info</strong>
        Method: <strong>{{ $order->payment_method }}</strong><br />
        Status: <span style="text-transform: capitalize; color: {{ strtolower($order->payment_status) === 'paid' ? '#059669' : '#d97706' }}; font-weight: 600;">{{ $order->payment_status }}</span>
      </div>
    </td>
    <td width="50%" valign="top">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.8;">
        <tr>
          <td style="color: #78716c;">Subtotal:</td>
          <td align="right" style="color: #1c1917; font-weight: 600;">{{ $currency }} {{ number_format($subtotal, 2) }}</td>
        </tr>
        <tr>
          <td style="color: #78716c;">Standard Delivery:</td>
          <td align="right" style="color: #1c1917; font-weight: 600;">{{ $currency }} {{ number_format($shippingFee, 2) }}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 8px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 2px solid #1c1917; padding-top: 8px;">
              <tr>
                <td style="font-size: 16px; font-weight: 700; color: #1c1917;">Total:</td>
                <td align="right" style="font-size: 18px; font-weight: 700; color: #c98a2c;">{{ $currency }} {{ number_format($order->order_total, 2) }}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Shipping Details Section -->
@if($order->shipping_address)
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; border-radius: 12px; border: 1px solid #ede9e3; margin-bottom: 32px; padding: 18px 20px;">
  <tr>
    <td>
      <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c;">Delivery Destination</h4>
      <p style="margin: 0; font-size: 14px; color: #1c1917; line-height: 1.5;">
        <strong>{{ $order->customer_name }}</strong><br />
        {{ $order->shipping_address }}<br />
        Phone: {{ $order->customer_phone }}
      </p>
    </td>
  </tr>
</table>
@endif

<!-- Call to Action Button -->
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding-bottom: 12px;">
      <a href="{{ $trackingUrl }}" target="_blank" style="background-color: #1c1917; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(28, 25, 23, 0.2);">
        Track Live Order Status &rarr;
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" style="font-size: 12px; color: #a8a29e;">
      Or visit: <a href="{{ $trackingUrl }}" style="color: #c98a2c; text-decoration: underline;">{{ $trackingUrl }}</a>
    </td>
  </tr>
</table>
@endsection
