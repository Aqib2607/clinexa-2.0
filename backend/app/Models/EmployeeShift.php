<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EmployeeShift extends Model
{
    use HasUuids;
    protected $fillable = ['name', 'start_time', 'end_time'];
}
