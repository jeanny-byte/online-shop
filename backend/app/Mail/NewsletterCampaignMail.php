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

class NewsletterCampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public ?NewsletterSubscriber $subscriber;
    public string $campaignSubject;
    public ?string $subtitle;
    public string $campaignContent;
    public ?string $bannerUrl;
    public ?string $ctaText;
    public ?string $ctaUrl;
    public ?StoreSetting $storeSettings;

    /**
     * Create a new message instance.
     */
    public function __construct(
        string $campaignSubject,
        string $campaignContent,
        ?string $subtitle = null,
        ?string $bannerUrl = null,
        ?string $ctaText = null,
        ?string $ctaUrl = null,
        ?NewsletterSubscriber $subscriber = null
    ) {
        $this->campaignSubject = $campaignSubject;
        $this->campaignContent = $campaignContent;
        $this->subtitle = $subtitle;
        $this->bannerUrl = $bannerUrl;
        $this->ctaText = $ctaText;
        $this->ctaUrl = $ctaUrl;
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

        return new Envelope(
            from: new Address($storeEmail, $storeName),
            subject: "{$this->campaignSubject} - {$storeName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter.campaign',
            with: [
                'subject' => $this->campaignSubject,
                'subtitle' => $this->subtitle,
                'campaignContent' => $this->campaignContent,
                'bannerUrl' => $this->bannerUrl,
                'ctaText' => $this->ctaText,
                'ctaUrl' => $this->ctaUrl,
                'subscriber' => $this->subscriber,
                'storeSettings' => $this->storeSettings,
            ]
        );
    }
}
