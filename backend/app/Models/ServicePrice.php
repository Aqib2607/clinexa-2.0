<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePrice extends Model
{
    protected $fillable = [
        'service_id',
        'price',
        'effective_from',
        'effective_to',
        'is_current',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
