<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FixImageUrlsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:fix-urls {--dry-run : Only display what would be changed without updating the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Normalize hardcoded localhost/127.0.0.1 image URLs to relative storage paths in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $this->info($dryRun ? 'Running in DRY-RUN mode (no changes will be written)...' : 'Normalizing stored image URLs...');

        $updatedCount = 0;

        // 1. Products: image and images
        if (Schema::hasTable('products')) {
            $products = DB::table('products')->get();
            foreach ($products as $prod) {
                $dirty = false;
                $newImage = $this->cleanUrl($prod->image);
                if ($newImage !== $prod->image) {
                    $dirty = true;
                }

                $newImages = $prod->images;
                if ($prod->images) {
                    $decoded = is_string($prod->images) ? json_decode($prod->images, true) : $prod->images;
                    if (is_array($decoded)) {
                        $cleanedArray = array_map([$this, 'cleanUrl'], $decoded);
                        if ($cleanedArray !== $decoded) {
                            $newImages = json_encode(array_values($cleanedArray));
                            $dirty = true;
                        }
                    }
                }

                if ($dirty) {
                    $this->line("Product #{$prod->id} ({$prod->name}): cleaned image URLs");
                    if (!$dryRun) {
                        DB::table('products')->where('id', $prod->id)->update([
                            'image' => $newImage,
                            'images' => $newImages,
                        ]);
                    }
                    $updatedCount++;
                }
            }
        }

        // 2. Categories: image
        if (Schema::hasTable('categories')) {
            $categories = DB::table('categories')->get();
            foreach ($categories as $cat) {
                $newImage = $this->cleanUrl($cat->image);
                if ($newImage !== $cat->image) {
                    $this->line("Category #{$cat->id} ({$cat->name}): cleaned image URL");
                    if (!$dryRun) {
                        DB::table('categories')->where('id', $cat->id)->update(['image' => $newImage]);
                    }
                    $updatedCount++;
                }
            }
        }

        // 3. Blog Posts: image
        if (Schema::hasTable('blog_posts')) {
            $posts = DB::table('blog_posts')->get();
            foreach ($posts as $post) {
                $newImage = $this->cleanUrl($post->image);
                if ($newImage !== $post->image) {
                    $this->line("BlogPost #{$post->id} ({$post->title}): cleaned image URL");
                    if (!$dryRun) {
                        DB::table('blog_posts')->where('id', $post->id)->update(['image' => $newImage]);
                    }
                    $updatedCount++;
                }
            }
        }

        // 4. Store Settings: logo_url
        if (Schema::hasTable('store_settings')) {
            $settings = DB::table('store_settings')->get();
            foreach ($settings as $setting) {
                $newLogo = $this->cleanUrl($setting->logo_url);
                if ($newLogo !== $setting->logo_url) {
                    $this->line("StoreSetting #{$setting->id}: cleaned logo URL");
                    if (!$dryRun) {
                        DB::table('store_settings')->where('id', $setting->id)->update(['logo_url' => $newLogo]);
                    }
                    $updatedCount++;
                }
            }
        }

        // 5. Testimonials: image
        if (Schema::hasTable('testimonials')) {
            $testimonials = DB::table('testimonials')->get();
            foreach ($testimonials as $testimonial) {
                $newImage = $this->cleanUrl($testimonial->image);
                if ($newImage !== $testimonial->image) {
                    $this->line("Testimonial #{$testimonial->id}: cleaned image URL");
                    if (!$dryRun) {
                        DB::table('testimonials')->where('id', $testimonial->id)->update(['image' => $newImage]);
                    }
                    $updatedCount++;
                }
            }
        }

        // 6. Users: avatar_url
        if (Schema::hasTable('users')) {
            $users = DB::table('users')->get();
            foreach ($users as $user) {
                $newAvatar = $this->cleanUrl($user->avatar_url);
                if ($newAvatar !== $user->avatar_url) {
                    $this->line("User #{$user->id} ({$user->email}): cleaned avatar URL");
                    if (!$dryRun) {
                        DB::table('users')->where('id', $user->id)->update(['avatar_url' => $newAvatar]);
                    }
                    $updatedCount++;
                }
            }
        }

        $this->info("Completed! Total database records normalized: {$updatedCount}");

        if (!$dryRun) {
            $this->info("Ensuring physical files are mirrored to public/storage...");
            $mirroredCount = \App\Services\StorageService::syncDirectory();
            $this->info("Total physical storage files mirrored: {$mirroredCount}");
        }

        return Command::SUCCESS;
    }

    /**
     * Clean a single URL value to a clean relative /storage/... path if it references local storage.
     */
    public function cleanUrl(?string $url): ?string
    {
        if (!$url || trim($url) === '') {
            return $url;
        }

        $trimmed = trim($url);

        // Keep base64 / blob
        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'blob:')) {
            return $trimmed;
        }

        // Check if pointing to localhost/127.0.0.1 or contains /storage/
        if (str_contains($trimmed, '/storage/')) {
            $idx = strpos($trimmed, '/storage/');
            return substr($trimmed, $idx);
        }

        return $trimmed;
    }
}
