<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VoucherEntry extends Model
{
    use HasUuids;
    protected $fillable = ['voucher_id', 'coa_id', 'debit', 'credit'];
    protected $casts = ['debit' => 'decimal:2', 'credit' => 'decimal:2'];

    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class, 'coa_id');
    }
}
