<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>{{ $title ?? ($storeSettings->store_name ?? config('app.name', 'Nelysah')) }}</title>
  <style type="text/css">
    /* Base reset & client-specific styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d2a26; }
    
    /* Responsive styling */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 15px; line-height: 1.6; color: #2d2a26;">
  <!-- Preheader text (preview snippet in inbox) -->
  @if(isset($previewText))
  <div style="display: none; font-size: 1px; color: #f8f6f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    {{ $previewText }}
  </div>
  @endif

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f4; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 30px 10px 40px 10px;">
        <!-- Email Container (max 600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); border: 1px solid #ede9e3;">
          
          <!-- Header Component -->
          @include('emails.components.header', ['storeSettings' => $storeSettings ?? null])

          <!-- Main Body Content Slot -->
          <tr>
            <td class="fluid-padding" style="padding: 36px 36px 28px 36px;">
              @yield('content')
            </td>
          </tr>

          <!-- Footer Component -->
          @include('emails.components.footer', ['storeSettings' => $storeSettings ?? null])

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
