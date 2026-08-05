<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    use HasUuids;
    protected $fillable = ['item_batch_id', 'type', 'quantity', 'reference_type', 'reference_id', 'transaction_date', 'performed_by', 'notes'];
    protected $casts = ['transaction_date' => 'datetime'];

    public function batch()
    {
        return $this->belongsTo(ItemBatch::class, 'item_batch_id');
    }
}
