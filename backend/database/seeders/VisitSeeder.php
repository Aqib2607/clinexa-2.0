<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visit;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;

class VisitSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Visit::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $patients = Patient::take(15)->get();
        $doctor = Doctor::first();
        $appointments = Appointment::all();

        if ($patients->isEmpty() || !$doctor) {
            return;
        }

        $types = ['NEW', 'FOLLOW_UP', 'EMERGENCY', 'NEW', 'FOLLOW_UP'];
        $statuses = ['completed', 'completed', 'completed', 'active'];

        for ($i = 0; $i < count($patients); $i++) {
            Visit::create([
                'patient_id' => $patients[$i]->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => isset($appointments[$i]) ? $appointments[$i]->id : null,
                'visit_date' => now()->subDays($i)->format('Y-m-d'),
                'type' => $types[$i % count($types)],
                'status' => $statuses[$i % count($statuses)],
            ]);
        }

        $this->command->info(count($patients) . ' visits seeded successfully!');
    }
}
