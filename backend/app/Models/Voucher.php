<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use HasUuids, SoftDeletes;
    protected $fillable = ['voucher_no', 'date', 'type', 'narration', 'reference', 'is_posted', 'created_by', 'cost_center_id'];
    protected $casts = ['date' => 'date', 'is_posted' => 'boolean'];

    public function entries()
    {
        return $this->hasMany(VoucherEntry::class);
    }
}
