<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PharmacySale extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'visit_id',
        'patient_id',
        'customer_name',
        'total_amount',
        'paid_amount',
        'payment_method',
        'sale_date',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PharmacySaleItem::class);
    }
}
