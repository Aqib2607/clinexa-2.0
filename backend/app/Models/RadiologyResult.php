<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RadiologyResult extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'radiology_study_id',
        'radiology_template_id',
        'findings',
        'impression',
        'radiologist_id',
        'finalized_at',
    ];

    public function study(): BelongsTo
    {
        return $this->belongsTo(RadiologyStudy::class, 'radiology_study_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(RadiologyTemplate::class, 'radiology_template_id');
    }

    public function radiologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'radiologist_id');
    }

    public function addendums(): HasMany
    {
        return $this->hasMany(RadiologyAddendum::class);
    }
}
