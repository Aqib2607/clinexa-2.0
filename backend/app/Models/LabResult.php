<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LabResult extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'visit_id',
        'bill_item_id',
        'test_id',
        'sample_collection_id',
        'status',
        'technician_id',
        'pathologist_id',
        'finalized_at',
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

    public function sample(): BelongsTo
    {
        return $this->belongsTo(SampleCollection::class, 'sample_collection_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(LabResultItem::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function pathologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pathologist_id');
    }
}
