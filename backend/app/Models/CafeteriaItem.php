<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CafeteriaItem extends Model
{
    use HasUuids;
    protected $fillable = ['name', 'code', 'category', 'price', 'is_available'];
    protected $casts = ['price' => 'decimal:2', 'is_available' => 'boolean'];
}
