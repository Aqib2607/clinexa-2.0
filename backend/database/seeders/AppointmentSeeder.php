<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\AppointmentSlot;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required data
        $patients = Patient::limit(5)->get();
        $doctor = Doctor::first();
        $slots = AppointmentSlot::limit(5)->get();

        if ($patients->count() < 5) {
            $this->command->error('Not enough patients! Please run PatientSeeder first.');
            return;
        }

        if (!$doctor) {
            $this->command->error('No doctors found! Please seed doctors first.');
            return;
        }

        if ($slots->count() < 5) {
            $this->command->error('Not enough slots! Please run AppointmentSlotSeeder first.');
            return;
        }

        $appointments = [
            [
                'appointment_number' => 'APT-001',
                'patient_id' => $patients[0]->id,
                'doctor_id' => $doctor->id,
                'slot_id' => $slots[0]->id ?? null,
                'appointment_date' => now()->addDays(1)->format('Y-m-d'),
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'symptoms' => 'Persistent headache and dizziness',
                'diagnosis' => null,
            ],
            [
                'appointment_number' => 'APT-002',
                'patient_id' => $patients[1]->id,
                'doctor_id' => $doctor->id,
                'slot_id' => $slots[1]->id ?? null,
                'appointment_date' => now()->addDays(1)->format('Y-m-d'),
                'status' => 'confirmed',
                'payment_status' => 'pending',
                'symptoms' => 'Chest pain and shortness of breath',
                'diagnosis' => null,
            ],
            [
                'appointment_number' => 'APT-003',
                'patient_id' => $patients[2]->id,
                'doctor_id' => $doctor->id,
                'slot_id' => $slots[2]->id ?? null,
                'appointment_date' => now()->subDays(2)->format('Y-m-d'),
                'status' => 'completed',
                'payment_status' => 'paid',
                'symptoms' => 'High blood pressure symptoms',
                'diagnosis' => 'Hypertension',
            ],
            [
                'appointment_number' => 'APT-004',
                'patient_id' => $patients[3]->id,
                'doctor_id' => $doctor->id,
                'slot_id' => $slots[3]->id ?? null,
                'appointment_date' => now()->addDays(3)->format('Y-m-d'),
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'symptoms' => 'Regular checkup',
                'diagnosis' => null,
            ],
            [
                'appointment_number' => 'APT-005',
                'patient_id' => $patients[4]->id,
                'doctor_id' => $doctor->id,
                'slot_id' => $slots[4]->id ?? null,
                'appointment_date' => now()->subDays(5)->format('Y-m-d'),
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'symptoms' => 'Cancelled by patient',
                'diagnosis' => null,
            ],
        ];

        foreach ($appointments as $appointmentData) {
            Appointment::create($appointmentData);
        }

        $this->command->info('5 appointments seeded successfully!');
    }
}
