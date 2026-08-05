<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RadiologyAddendum extends Model
{
    use HasUuids;

    protected $fillable = [
        'radiology_result_id',
        'note',
        'added_by',
    ];

    public function result(): BelongsTo
    {
        return $this->belongsTo(RadiologyResult::class, 'radiology_result_id');
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
