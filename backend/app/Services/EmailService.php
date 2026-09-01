<?php

namespace App\Services;

use App\Mail\NewsletterCampaignMail;
use App\Mail\NewsletterWelcomeMail;
use App\Mail\OrderCancelledMail;
use App\Mail\OrderPlacedMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Mail\PaymentReceivedMail;
use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Send order confirmation email to customer and optionally notify admin.
     */
    public function sendOrderPlacedNotification(Order $order): bool
    {
        try {
            $customerEmail = trim($order->customer_email ?? '');
            
            // Check if customer email is valid
            if (!empty($customerEmail) && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                Mail::to($customerEmail)->send(new OrderPlacedMail($order));
                Log::info("Order confirmation email sent to {$customerEmail} for order #{$order->tracking_code}");
            }

            // Also notify store admin if store_email is configured
            $storeSettings = StoreSetting::first();
            $storeEmail = $storeSettings->store_email ?? null;
            if (!empty($storeEmail) && filter_var($storeEmail, FILTER_VALIDATE_EMAIL) && $storeEmail !== $customerEmail) {
                Mail::to($storeEmail)->send(new OrderPlacedMail($order));
                Log::info("Admin order notification email sent to {$storeEmail} for order #{$order->tracking_code}");
            }

            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send order confirmation email for order #{$order->tracking_code}: " . $e->getMessage(), [
                'exception' => $e
            ]);
            return false;
        }
    }

    /**
     * Send payment receipt email to customer.
     */
    public function sendPaymentReceivedNotification(Order $order): bool
    {
        try {
            $customerEmail = trim($order->customer_email ?? '');
            
            if (!empty($customerEmail) && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                Mail::to($customerEmail)->send(new PaymentReceivedMail($order));
                Log::info("Payment receipt email sent to {$customerEmail} for order #{$order->tracking_code}");
                return true;
            }
            return false;
        } catch (\Throwable $e) {
            Log::error("Failed to send payment receipt email for order #{$order->tracking_code}: " . $e->getMessage(), [
                'exception' => $e
            ]);
            return false;
        }
    }

    /**
     * Send order status update email to customer.
     */
    public function sendOrderStatusUpdatedNotification(Order $order): bool
    {
        try {
            $customerEmail = trim($order->customer_email ?? '');
            if (empty($customerEmail) || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                return false;
            }

            if (strtolower($order->order_status) === 'cancelled') {
                Mail::to($customerEmail)->send(new OrderCancelledMail($order));
                Log::info("Order cancellation email sent to {$customerEmail} for order #{$order->tracking_code}");
            } else {
                Mail::to($customerEmail)->send(new OrderStatusUpdatedMail($order));
                Log::info("Order status update ({$order->order_status}) email sent to {$customerEmail} for order #{$order->tracking_code}");
            }

            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send order status update email for order #{$order->tracking_code}: " . $e->getMessage(), [
                'exception' => $e
            ]);
            return false;
        }
    }

    /**
     * Send newsletter welcome email to new subscriber.
     */
    public function sendNewsletterWelcome(NewsletterSubscriber $subscriber): bool
    {
        try {
            $email = trim($subscriber->email ?? '');
            if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Mail::to($email)->send(new NewsletterWelcomeMail($subscriber));
                Log::info("Newsletter welcome email sent to {$email}");
                return true;
            }
            return false;
        } catch (\Throwable $e) {
            Log::error("Failed to send newsletter welcome email to {$subscriber->email}: " . $e->getMessage(), [
                'exception' => $e
            ]);
            return false;
        }
    }

    /**
     * Send newsletter campaign broadcast to all active subscribers.
     */
    public function sendNewsletterBroadcast(
        string $subject,
        string $content,
        ?string $subtitle = null,
        ?string $bannerUrl = null,
        ?string $ctaText = null,
        ?string $ctaUrl = null,
        ?array $recipientEmails = null
    ): array {
        $sentCount = 0;
        $failedCount = 0;

        try {
            $query = NewsletterSubscriber::where('status', 'active');
            if (!empty($recipientEmails)) {
                $query->whereIn('email', $recipientEmails);
            }

            $subscribers = $query->get();

            foreach ($subscribers as $subscriber) {
                try {
                    Mail::to($subscriber->email)->send(
                        new NewsletterCampaignMail(
                            $subject,
                            $content,
                            $subtitle,
                            $bannerUrl,
                            $ctaText,
                            $ctaUrl,
                            $subscriber
                        )
                    );
                    $sentCount++;
                } catch (\Throwable $e) {
                    $failedCount++;
                    Log::error("Failed to send campaign to {$subscriber->email}: " . $e->getMessage());
                }
            }

            Log::info("Newsletter campaign '{$subject}' broadcast complete. Sent: {$sentCount}, Failed: {$failedCount}");
            return ['sent' => $sentCount, 'failed' => $failedCount, 'total' => count($subscribers)];
        } catch (\Throwable $e) {
            Log::error("Campaign broadcast failed: " . $e->getMessage());
            return ['sent' => $sentCount, 'failed' => $failedCount, 'error' => $e->getMessage()];
        }
    }
}
