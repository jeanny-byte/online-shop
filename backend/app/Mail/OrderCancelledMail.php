<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public ?StoreSetting $storeSettings;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing(['items.product', 'driver']);
        $this->storeSettings = StoreSetting::first();
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $storeName = $this->storeSettings->store_name ?? config('app.name', 'Nelysah');
        $storeEmail = $this->storeSettings->store_email ?? config('mail.from.address', 'contact@nelysah.com');

        return new Envelope(
            from: new Address($storeEmail, $storeName),
            subject: "Order Cancelled #{$this->order->tracking_code} - {$storeName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.cancelled',
            with: [
                'order' => $this->order,
                'storeSettings' => $this->storeSettings,
            ]
        );
    }
}
