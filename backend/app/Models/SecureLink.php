<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SecureLink extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_id',
        'resource_type',
        'resource_id',
        'token',
        'expires_at',
        'access_count'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'access_count' => 'integer'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
