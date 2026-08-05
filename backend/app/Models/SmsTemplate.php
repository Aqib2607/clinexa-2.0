<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    use HasUuids;

    protected $fillable = [
        'event_name',
        'template_body',
        'variables', // JSON
        'is_active'
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean'
    ];
}
