<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ItemBatch extends Model
{
    use HasUuids;
    protected $fillable = ['item_id', 'store_id', 'batch_no', 'expiry_date', 'quantity', 'purchase_price', 'sale_price'];
    protected $casts = ['expiry_date' => 'date', 'purchase_price' => 'decimal:2', 'sale_price' => 'decimal:2'];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
