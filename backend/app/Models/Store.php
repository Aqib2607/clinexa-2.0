<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasUuids;
    protected $fillable = ['name', 'code', 'location', 'is_main_store', 'is_active'];
    protected $casts = ['is_main_store' => 'boolean', 'is_active' => 'boolean'];
}
