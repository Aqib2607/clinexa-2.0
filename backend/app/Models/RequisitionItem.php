<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RequisitionItem extends Model
{
    use HasUuids;
    protected $fillable = ['requisition_id', 'item_id', 'requested_quantity', 'issued_quantity'];
}
