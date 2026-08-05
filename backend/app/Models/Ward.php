<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ward extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'type',
        'description',
        'is_active',
        // 'floor_number' // Removed as not in schema
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }
}
