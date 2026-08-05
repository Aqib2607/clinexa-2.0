<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'mobile_number',
        'message_body',
        'event_name',
        'status', // pending, sent, failed
        'provider_response'
    ];
}
