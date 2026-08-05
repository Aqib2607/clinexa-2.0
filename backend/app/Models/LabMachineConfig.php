<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LabMachineConfig extends Model
{
    use HasUuids;

    protected $fillable = [
        'machine_name',
        'ip_address',
        'port',
        'protocol', // ASTM, HL7
        'connection_settings', // JSON
        'is_active'
    ];

    protected $casts = [
        'connection_settings' => 'array',
        'is_active' => 'boolean'
    ];

    public function logs()
    {
        return $this->hasMany(LabMachineLog::class, 'machine_id');
    }
}
