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
        'samsung',
        'whatsapp',
        'twitter',
        'facebook',
        'joypixels',
        'openmoji',
        'emojidex',
        'lg',
        'htc',
        'mozilla'
    ];

    public function show($emoji)
    {
        $encodedEmoji = urlencode($emoji);
        $style = request()->query('style', 'apple');
        $hash = md5(implode('.', [$encodedEmoji, $style]));

        $cacheFor = 60 * 60 * 24 * 7; // 7 days

        $image = Cache::remember($hash, $cacheFor, function () use ($encodedEmoji, $style) {
            function error($message, $status) {
                abort(
                    response($message, $status)
                        ->header('content-type', 'text/plain')
                );
            }

            $client = Http::timeout(3);

            if(! in_array($style, $this->allowedStyles)) {
                error('Invalid style. Valid styles are: ' . implode(', ', $this->allowedStyles), 400);
            }

            $response = $client->get('https://emojipedia.org/' . $encodedEmoji);
            if(! $response->ok()) {
                error('Emojipedia returned an error ' . $response->status(), $response->status());
            }

            $matches = Str::of($response->body())->matchAll("/<img.*(?:src|srcset)=\"(.*?{$style}.*?)\"/");

            if($matches->isEmpty()) {
                error('Emoji exists, but style couldn’t be found', 404);
            }

            $url = (string) Str::of($matches->first())->replace('2x', '')->trim();

            return base64_encode(
                $client->get($url)->body()
            );
        });

        return response(base64_decode($image))
            ->header('content-type', 'image/png');
    }
}
