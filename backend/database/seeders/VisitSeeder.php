<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visit;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;

class VisitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Visit::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $patients = Patient::limit(5)->get();
        $doctor = Doctor::first();
        $appointments = Appointment::where('status', 'completed')->limit(5)->get();

        if ($patients->count() < 5) {
            $this->command->error('Not enough patients! Please run PatientSeeder first.');
            return;
        }

        if (!$doctor) {
            $this->command->error('No doctors found! Please seed doctors first.');
            return;
        }

        $visits = [
            [
                'patient_id' => $patients[0]->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => $appointments[0]->id ?? null,
                'visit_date' => now()->subDays(2)->format('Y-m-d'),
                'type' => 'NEW',
                'status' => 'completed',
            ],
            [
                'patient_id' => $patients[1]->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => null,
                'visit_date' => now()->subDays(5)->format('Y-m-d'),
                'type' => 'NEW',
                'status' => 'completed',
            ],
            [
                'patient_id' => $patients[2]->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => null,
                'visit_date' => now()->subDays(10)->format('Y-m-d'),
                'type' => 'EMERGENCY',
                'status' => 'completed',
            ],
            [
                'patient_id' => $patients[3]->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => null,
                'visit_date' => now()->format('Y-m-d'),
                'type' => 'NEW',
                'status' => 'active',
            ],
            [
                'patient_id' => $patients[4]->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => null,
                'visit_date' => now()->subDays(15)->format('Y-m-d'),
                'type' => 'FOLLOW_UP',
                'status' => 'completed',
            ],
        ];

        foreach ($visits as $visitData) {
            Visit::create($visitData);
        }

        $this->command->info('5 visits seeded successfully!');
    }
}
