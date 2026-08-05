<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ChartOfAccount extends Model
{
    use HasUuids;
    protected $fillable = ['code', 'name', 'type', 'parent_id', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
}
