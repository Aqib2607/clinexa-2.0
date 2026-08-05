<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NurseTask extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'admission_id',
        'title',
        'description',
        'type',
        'priority',
        'due_at',
        'completed',
        'completed_at',
        'completed_by',
        'created_by',
        'metadata',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
