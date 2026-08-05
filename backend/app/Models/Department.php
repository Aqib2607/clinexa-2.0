<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'overview',
        'services',
        'facilities',
        'image_url',
        'conditions_treated',
        'technologies',
        'why_choose_us',
    ];
    protected $casts = [
        'services'           => 'array',
        'facilities'         => 'array',
        'conditions_treated' => 'array',
        'technologies'       => 'array',
        'is_active'          => 'boolean',
    ];

    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }
}

