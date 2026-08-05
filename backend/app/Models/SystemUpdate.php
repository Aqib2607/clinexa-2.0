<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemUpdate extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'message',
        'type', // maintenance, feature, alert
        'is_active',
        'scheduled_at',
        'created_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'scheduled_at' => 'datetime'
    ];

    /**
     * Get the user who created this update
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
