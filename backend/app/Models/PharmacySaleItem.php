<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PharmacySaleItem extends Model
{
    protected $fillable = [
        'pharmacy_sale_id',
        'pharmacy_item_id',
        'pharmacy_stock_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(PharmacySale::class, 'pharmacy_sale_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(PharmacyItem::class, 'pharmacy_item_id');
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(PharmacyStock::class);
    }
}
