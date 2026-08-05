<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AssetDepreciation extends Model
{
    use HasUuids;
    protected $fillable = ['asset_id', 'amount', 'date', 'voucher_id'];
    protected $casts = ['amount' => 'decimal:2', 'date' => 'date'];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
