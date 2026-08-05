<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CafeteriaSaleItem extends Model
{
    use HasUuids;
    protected $fillable = ['sale_id', 'item_id', 'quantity', 'price', 'total'];
}
