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
            if(! in_array($style, $this->allowedStyles)) {
                abort(400, 'Invalid style. Valid styles are: ' . implode(', ', $this->allowedStyles));
            }

            $response = Http::get('https://emojipedia.org/' . $encodedEmoji);
            if(! $response->ok()) {
                abort($resonse->status());
            }

            $matches = Str::of($response->body())->matchAll("/<img.*(?:src|srcset)=\"(.*?{$style}.*?)\"/");

            if($matches->isEmpty()) {
                abort(404);
            }

            $url = (string) Str::of($matches->first())->replace('2x', '')->trim();

            return Http::get($url)->body();
        });

        return response($image)
            ->header('content-type', 'image/png');
    }
}
