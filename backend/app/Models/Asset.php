<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasUuids;
    protected $fillable = ['name', 'asset_code', 'coa_id', 'purchase_date', 'purchase_value', 'current_value', 'useful_life_years', 'location', 'status'];
    protected $casts = ['purchase_date' => 'date', 'purchase_value' => 'decimal:2', 'current_value' => 'decimal:2'];
}
