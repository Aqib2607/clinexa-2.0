<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasUuids;
    protected $fillable = [
        'employee_id',
        'month',
        'year',
        'basic_salary',
        'total_allowances',
        'total_deductions',
        'net_salary',
        'status',
        'generated_at',
        'generated_by'
    ];
    protected $casts = [
        'generated_at' => 'datetime',
        'basic_salary' => 'decimal:2',
        'net_salary' => 'decimal:2'
    ];
}
