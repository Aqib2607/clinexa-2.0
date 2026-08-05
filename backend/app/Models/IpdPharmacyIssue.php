<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class IpdPharmacyIssue extends Model
{
    use HasUuids;
    protected $fillable = ['admission_id', 'item_batch_id', 'quantity', 'issued_at', 'issued_by'];
    protected $casts = ['issued_at' => 'datetime'];

    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }

    public function batch()
    {
        return $this->belongsTo(ItemBatch::class, 'item_batch_id');
    }
}
