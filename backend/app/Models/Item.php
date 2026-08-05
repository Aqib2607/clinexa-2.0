<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasUuids, SoftDeletes;
    protected $fillable = ['name', 'code', 'type', 'category', 'unit', 'reorder_level', 'standard_price', 'is_active'];
    protected $casts = ['is_active' => 'boolean', 'standard_price' => 'decimal:2'];

    public function batches()
    {
        return $this->hasMany(ItemBatch::class);
    }
}
