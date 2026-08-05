<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasUuids;

    protected $fillable = [
        'code',
        'name',
        'type',
        'is_active',
    ];

    public function prices(): HasMany
    {
        return $this->hasMany(ServicePrice::class);
    }

    public function currentPrice()
    {
        return $this->hasOne(ServicePrice::class)->where('is_current', true);
    }
}
