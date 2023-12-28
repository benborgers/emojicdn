<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class EmojiController extends Controller
{
    private $allowedStyles = [
        'apple',
        'google',
        'microsoft',
        'microsoft-3D-fluent',
        'microsoft-teams',
        'samsung',
        'whatsapp',
        'twitter',
        'facebook',
        'messenger',
        'joypixels',
        'openmoji',
        'emojidex',
        'lg',
        'htc',
        'mozilla'
    ];

    // Epoch timestamp.
    // Emojis that were cached after this time are considered "fresh".
    // This time can be moved up to force update old cached emojis.
    public $cacheFreshAfter = 1701388800;
    
    public function show($emoji)
    {
        $encodedEmoji = urlencode($emoji);
        $style = request()->query('style', 'apple');
        $hash = md5(implode('.', [$encodedEmoji, $style]));

        $cachedValue = cache()->get($hash);

        // We can use the cached value if it exists,
        // and it was downloaded more recently than the freshness cutoff.

        if($cachedValue && $cachedValue['timestamp'] > $this->cacheFreshAfter) {
            return response(base64_decode($cachedValue['image']))
                ->header('content-type', 'image/png');
        }

        // If we can't use the cached value:

        function error($message, $status) {
            abort(
                response($message, $status)
                    ->header('content-type', 'text/plain')
            );
        }

        $client = Http::timeout(10);

        if(! in_array($style, $this->allowedStyles)) {
            error('Invalid style. Valid styles are: ' . implode(', ', $this->allowedStyles), 400);
        }

        $response = $client->get('https://emojipedia.org/' . $encodedEmoji);
        if(! $response->ok()) {
            error('Emojipedia returned an error ' . $response->status(), $response->status());
        }

        // Facebook and Messenger emojis are stored in the same 'facebook' directory but
        // different subdirectories. This helps to distinguish them by renaming $style.
        if($style == 'facebook') {
            $style = 'facebook\/230';
        } elseif($style == 'messenger') {
            $style = 'facebook\/65';
        }

        $matches = Str::of($response->body())
            ->matchAll("/<img.*(?:src|srcset)=\"(.*?{$style}.*?)\"/")
            // Emojipedia has some footer images like "/static/img/footer/logo_apple_appstore.svg".
            ->filter(fn ($string) => !Str::of($string)->contains('static'));

        if($matches->isEmpty()) {
            error('Emoji exists, but style couldn’t be found', 404);
        }

        $url = (string) Str::of($matches->first())->replace('2x', '')->trim();

        $emojiImage = $client->get($url)->body();

        $base64Image = base64_encode($emojiImage);

        cache()->put($hash, [
            'timestamp' => now()->timestamp,
            'image' => $base64Image
        ]);

        return response($emojiImage)
            ->header('content-type', 'image/png');
    }
}
