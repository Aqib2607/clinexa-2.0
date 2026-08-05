<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabResultItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'lab_result_id',
        'component_name',
        'value',
        'unit',
        'reference_range',
        'is_abnormal',
        'remarks',
    ];

    protected $casts = [
        'is_abnormal' => 'boolean',
    ];

    public function result(): BelongsTo
    {
        return $this->belongsTo(LabResult::class, 'lab_result_id');
    }
}
