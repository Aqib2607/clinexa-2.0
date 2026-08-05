<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'recipient_email',
        'subject',
        'body',
        'event_name',
        'status', // pending, sent, failed
        'sent_at',
        'error_message'
    ];

    protected $casts = [
        'sent_at' => 'datetime'
    ];
}
