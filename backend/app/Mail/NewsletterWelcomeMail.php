<?php

namespace App\Mail;

use App\Models\NewsletterSubscriber;
use App\Models\StoreSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public NewsletterSubscriber $subscriber;
    public ?StoreSetting $storeSettings;

    /**
     * Create a new message instance.
     */
    public function __construct(NewsletterSubscriber $subscriber)
    {
        $this->subscriber = $subscriber;
        $this->storeSettings = StoreSetting::first();
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $storeName = $this->storeSettings->store_name ?? config('app.name', 'Nelysah');
        $storeEmail = $this->storeSettings->store_email ?? config('mail.from.address', 'contact@nelysah.com');
        $title = $this->storeSettings->newsletter_title ?: 'Welcome to the Royal Family';

        return new Envelope(
            from: new Address($storeEmail, $storeName),
            subject: "{$title} - {$storeName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter.welcome',
            with: [
                'subscriber' => $this->subscriber,
                'storeSettings' => $this->storeSettings,
            ]
        );
    }
}
