<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PharmacyItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'generic_name',
        'brand_name',
        'unit',
        'reorder_level',
        'is_active',
    ];

    public function stocks(): HasMany
    {
        return $this->hasMany(PharmacyStock::class);
    }
}
