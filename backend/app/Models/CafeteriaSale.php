<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CafeteriaSale extends Model
{
    use HasUuids;
    protected $fillable = ['bill_no', 'sale_date', 'total_amount', 'payment_method', 'created_by'];
    protected $casts = ['sale_date' => 'datetime', 'total_amount' => 'decimal:2'];

    public function items()
    {
        return $this->hasMany(CafeteriaSaleItem::class, 'sale_id');
    }
}
