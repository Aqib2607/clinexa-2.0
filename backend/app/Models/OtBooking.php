<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtBooking extends Model
{
    use HasUuids;

    protected $fillable = [
        'admission_id',
        'ot_room',
        'surgeon_id',
        'anesthesiologist_id',
        'scheduled_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function surgeon(): BelongsTo
    {
        return $this->belongsTo(User::class, 'surgeon_id');
    }

    public function anesthesiologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'anesthesiologist_id');
    }
}
