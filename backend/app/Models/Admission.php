<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admission extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'admission_number',
        'patient_id',
        'doctor_id',
        'bed_id',
        'admission_date',
        'discharge_date',
        'status',
        'diagnosis',
        'emergency_contact_name',
        'emergency_contact_phone',
        'initial_deposit',
    ];

    protected $casts = [
        'admission_date' => 'datetime',
        'discharge_date' => 'datetime',
        'initial_deposit' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(BedTransfer::class);
    }

    public function charges(): HasMany
    {
        return $this->hasMany(IpdCharge::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(IpdPayment::class);
    }

    public function vitalSigns(): HasMany
    {
        return $this->hasMany(VitalSign::class);
    }

    public function nursingNotes(): HasMany
    {
        return $this->hasMany(NursingNote::class);
    }

    public function otBookings(): HasMany
    {
        return $this->hasMany(OtBooking::class);
    }

    public function discharge(): HasOne
    {
        return $this->hasOne(Discharge::class);
    }
}
