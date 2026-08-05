<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SampleCollection extends Model
{
    use HasUuids;

    protected $fillable = [
        'visit_id',
        'bill_item_id',
        'test_id',
        'specimen_sample_id',
        'barcode',
        'collected_at',
        'collected_by',
        'status',
        'rejection_reason',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function billItem(): BelongsTo
    {
        return $this->belongsTo(BillItem::class);
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function specimen(): BelongsTo
    {
        return $this->belongsTo(SpecimenSample::class, 'specimen_sample_id');
    }
}
