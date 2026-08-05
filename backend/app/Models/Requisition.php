<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    use HasUuids;
    protected $fillable = ['requisition_no', 'from_store_id', 'to_store_id', 'status', 'requested_by', 'requested_at', 'approved_by', 'approved_at'];
    protected $casts = ['requested_at' => 'datetime', 'approved_at' => 'datetime'];

    public function items()
    {
        return $this->hasMany(RequisitionItem::class);
    }
}
