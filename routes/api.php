<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\EmojiController;

Route::get('/{emoji}', [EmojiController::class, 'show'])
    ->middleware('cache.headers:public;max_age=0;s_maxage=86400');
