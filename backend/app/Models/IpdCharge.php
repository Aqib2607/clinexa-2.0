<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IpdCharge extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'admission_id',
        'service_id',
        'charge_name',
        'amount',
        'charge_date',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'charge_date' => 'datetime',
    ];

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
