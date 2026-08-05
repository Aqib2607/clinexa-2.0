<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasUuids;
    protected $fillable = ['employee_id', 'date', 'check_in', 'check_out', 'status'];
    protected $casts = ['date' => 'date'];
}
