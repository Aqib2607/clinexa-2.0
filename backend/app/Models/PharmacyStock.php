<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PharmacyStock extends Model
{
    protected $fillable = [
        'pharmacy_item_id',
        'batch_number',
        'expiry_date',
        'quantity',
        'purchase_price',
        'sale_price',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(PharmacyItem::class, 'pharmacy_item_id');
    }
}
