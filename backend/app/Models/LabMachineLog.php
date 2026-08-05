<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LabMachineLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'machine_id',
        'raw_data',
        'direction', // IN, OUT
        'status', // received, processed, error
        'processing_error'
    ];

    public function machine()
    {
        return $this->belongsTo(LabMachineConfig::class, 'machine_id');
    }
}
