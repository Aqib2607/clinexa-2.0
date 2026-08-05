<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class RadiologyStudy extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'visit_id',
        'bill_item_id',
        'study_name',
        'modality',
        'status',
        'image_path',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function billItem(): BelongsTo
    {
        return $this->belongsTo(BillItem::class);
    }

    public function result(): HasOne
    {
        return $this->hasOne(RadiologyResult::class);
    }
}
