<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;

class PrescriptionSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::take(15)->get();
        $doctor = Doctor::first();
        $appointments = Appointment::all();

        if ($patients->isEmpty() || !$doctor) {
            return;
        }

        $diagnoses = [
            'Essential Hypertension', 'Type 2 Diabetes Mellitus', 'Acute Bronchitis',
            'Migraine Headache', 'Vitamin D Deficiency', 'Generalized Anxiety Disorder',
            'Osteoarthritis Knee', 'Gastroesophageal Reflux Disease (GERD)', 'Asthma Exacerbation',
            'Allergic Rhinitis', 'Urinary Tract Infection', 'Hyperlipidemia',
            'Hypothyroidism', 'Iron Deficiency Anemia', 'Eczema / Dermatitis'
        ];

        for ($i = 0; $i < count($patients); $i++) {
            $prescription = Prescription::create([
                'appointment_id' => isset($appointments[$i]) ? $appointments[$i]->id : null,
                'patient_id' => $patients[$i]->id,
                'doctor_id' => $doctor->id,
                'diagnosis' => $diagnoses[$i % count($diagnoses)],
                'medications' => [
                    [
                        'name' => 'Medication ' . ($i + 1),
                        'dosage' => '500mg',
                        'frequency' => 'Twice daily',
                        'duration' => '7 days',
                    ]
                ],
                'notes' => 'Take after meals. Drink plenty of water.',
                'vitals' => [
                    'blood_pressure' => '120/80 mmHg',
                    'heart_rate' => '72 bpm',
                    'temperature' => '98.6°F',
                ],
                'advice' => 'Adequate rest and proper diet',
                'follow_up_date' => now()->addWeeks(2)->format('Y-m-d'),
            ]);

            PrescriptionItem::create([
                'prescription_id' => $prescription->id,
                'medicine_name' => 'Medication ' . ($i + 1),
                'dosage' => '1-0-1 (500mg)',
                'duration' => '7 days',
                'instruction' => 'After food',
                'type' => 'Tablet',
            ]);
        }

        $this->command->info(count($patients) . ' prescriptions seeded successfully!');
    }
}
