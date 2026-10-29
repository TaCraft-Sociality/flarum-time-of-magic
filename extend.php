<?php

use Flarum\Extend;

$prefix = 'stezkoy-time-of-magic';

$attributeName = function (string $key): string {
    return 'timeOfMagic' . str_replace(' ', '', ucwords(str_replace('_', ' ', $key)));
};

$boolKeys = [
    'allow_user_disable',
    'snow',
];

$effectKeys = [
    'snow',
    'leaves',
    'rain',
    'petals',
    'confetti',
    'hearts',
    'clovers',
    'eggs',
    'lanterns',
    'fireflies',
    'fog',
    'starfield',
];

$jsonKeys = ['schedules', 'custom_up', 'custom_down'];

$plainKeys = [];

$defaultMap = [
    'schedules' => '[]',
    'custom_up' => '[]',
    'custom_down' => '[]',
    'allow_user_disable' => true,
];


$settings = (new Extend\Settings);

foreach (array_merge($boolKeys, $effectKeys) as $key) {
    $settings->serializeToForum($attributeName($key), "$prefix.$key", 'boolval');
}

foreach ($plainKeys as $key) {
    $settings->serializeToForum($attributeName($key), "$prefix.$key");
}

foreach ($effectKeys as $effect) {
    $settings->serializeToForum($attributeName("{$effect}_density"), "$prefix.{$effect}_density");
}

foreach ($jsonKeys as $key) {
    $settings->serializeToForum($attributeName($key), "$prefix.$key", function ($value) {
        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);

        return is_array($decoded) ? $decoded : [];
    });
}

foreach (array_merge($boolKeys, $effectKeys, $plainKeys, $jsonKeys) as $key) {
    $default = $defaultMap[$key] ?? false;

    if (in_array($key, $effectKeys, true)) {
        $settings->default("$prefix.{$key}", $default);
        $settings->default("$prefix.{$key}_density", 'medium');
    } else {
        $settings->default("$prefix.$key", $default);
    }
}

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    $settings,

    (new Extend\User)
        ->registerPreference('disableEffects', 'boolval', false),

    (new Extend\Locales(__DIR__.'/locale')),
];