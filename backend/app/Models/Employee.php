<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasUuids, SoftDeletes;
    protected $fillable = [
        'user_id',
        'department_id',
        'employee_code',
        'designation',
        'join_date',
        'dob',
        'gender',
        'phone',
        'address',
        'basic_salary',
        'bank_name',
        'bank_account_no',
        'is_active',
        'shift_id'
    ];
    protected $casts = [
        'join_date' => 'date',
        'dob' => 'date',
        'basic_salary' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(EmployeeShift::class);
    }
}
