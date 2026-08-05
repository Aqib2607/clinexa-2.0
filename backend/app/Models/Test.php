<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Test extends Model
{
    use HasUuids;

    protected $fillable = [
        'code',
        'name',
        'test_panel_id',
        'specimen_sample_id',
        'method',
        'range_info', // JSON
        'price',
        'is_active',
    ];

    protected $casts = [
        'range_info' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function panel(): BelongsTo
    {
        return $this->belongsTo(TestPanel::class, 'test_panel_id');
    }

    public function specimen(): BelongsTo
    {
        return $this->belongsTo(SpecimenSample::class, 'specimen_sample_id');
    }
}
