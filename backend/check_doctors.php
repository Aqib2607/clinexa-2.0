<?php

use App\Models\User;
use App\Models\Doctor;

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

echo "Checking Doctor Users...\n";

$users = User::where('role', 'doctor')->get();

if ($users->isEmpty()) {
    echo "No users with role 'doctor' found.\n";
} else {
    foreach ($users as $user) {
        $doctor = Doctor::where('user_id', $user->id)->first();
        echo "User [ID: {$user->id}, Name: {$user->name}, Email: {$user->email}]";
        if ($doctor) {
            echo " -> Has Doctor Profile [ID: {$doctor->id}]\n";
        } else {
            echo " -> MISSING DOCTOR PROFILE (Cause of 403)\n";
        }
    }
}

echo "\nChecking Users who might be doctors but have wrong role...\n";
$doctors = Doctor::with('user')->get();
foreach ($doctors as $doctor) {
    if (!$doctor->user) {
        echo "Doctor Profile [ID: {$doctor->id}] has invalid user_id {$doctor->user_id}\n";
    } elseif ($doctor->user->role !== 'doctor') {
        echo "Doctor Profile [ID: {$doctor->id}] linked to User [{$doctor->user->name}] with role '{$doctor->user->role}' (Should be 'doctor'?)\n";
    }
}
