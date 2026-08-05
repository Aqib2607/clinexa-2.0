<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\AppointmentSlot;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::take(15)->get();
        $doctor = Doctor::first();
        $slots = AppointmentSlot::take(15)->get();

        if ($patients->isEmpty() || !$doctor) {
            return;
        }

        $symptomsList = [
            'Persistent headache and dizziness',
            'Chest pain and shortness of breath',
            'High blood pressure symptoms',
            'Regular checkup & consultation',
            'Severe joint pain and swelling',
            'Abdominal discomfort & nausea',
            'Fever and persistent cough',
            'Skin rash & allergic reaction',
            'Ear pain and hearing difficulty',
            'Blurry vision & eye irritation',
            'Lower back pain after heavy lifting',
            'Chronic fatigue and weakness',
            'Diabetes routine follow-up',
            'Thyroid medication adjustment',
            'Post-op routine evaluation',
        ];

        $statuses = ['confirmed', 'confirmed', 'completed', 'completed', 'pending', 'cancelled'];
        $paymentStatuses = ['paid', 'paid', 'pending', 'refunded'];

        for ($i = 0; $i < count($patients); $i++) {
            Appointment::create([
                'appointment_number' => 'APT-2026-' . sprintf('%03d', $i + 1),
                'patient_id' => $patients[$i]->id,
                'doctor_id' => $doctor->id,
                'slot_id' => isset($slots[$i]) ? $slots[$i]->id : null,
                'appointment_date' => now()->addDays(($i % 5) - 2)->format('Y-m-d'),
                'status' => $statuses[$i % count($statuses)],
                'payment_status' => $paymentStatuses[$i % count($paymentStatuses)],
                'symptoms' => $symptomsList[$i % count($symptomsList)],
                'diagnosis' => $i % 2 === 0 ? 'Evaluated & prescribed treatment' : null,
            ]);
        }

        $this->command->info(count($patients) . ' appointments seeded successfully!');
    }
}
