<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RadiologyTemplate extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'content',
        'modality',
        'is_active',
    ];
}
