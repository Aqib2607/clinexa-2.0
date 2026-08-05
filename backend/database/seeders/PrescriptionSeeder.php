<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prescription;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;

class PrescriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get completed appointments
        $appointments = Appointment::where('status', 'completed')->limit(5)->get();
        $doctor = Doctor::first();

        if ($appointments->count() < 1) {
            $this->command->error('No completed appointments found! Please run AppointmentSeeder first and ensure some appointments are completed.');
            return;
        }

        if (!$doctor) {
            $this->command->error('No doctors found! Please seed doctors first.');
            return;
        }

        $prescriptions = [
            [
                'appointment_id' => $appointments[0]->id ?? null,
                'patient_id' => $appointments[0]->patient_id ?? Patient::first()->id,
                'doctor_id' => $doctor->id,
                'diagnosis' => 'Hypertension',
                'medications' => [
                    [
                        'name' => 'Amlodipine',
                        'dosage' => '5mg',
                        'frequency' => 'Once daily',
                        'duration' => '30 days',
                    ],
                    [
                        'name' => 'Hydrochlorothiazide',
                        'dosage' => '12.5mg',
                        'frequency' => 'Once daily',
                        'duration' => '30 days',
                    ],
                ],
                'notes' => 'Monitor blood pressure regularly. Follow up in 2 weeks.',
                'vitals' => [
                    'blood_pressure' => '145/95 mmHg',
                    'heart_rate' => '78 bpm',
                    'temperature' => '98.6°F',
                    'weight' => '75 kg',
                ],
                'advice' => 'Reduce salt intake, exercise regularly, avoid stress',
                'follow_up_date' => now()->addWeeks(2)->format('Y-m-d'),
            ],
            [
                'appointment_id' => null,
                'patient_id' => Patient::skip(1)->first()->id ?? Patient::first()->id,
                'doctor_id' => $doctor->id,
                'diagnosis' => 'Type 2 Diabetes',
                'medications' => [
                    [
                        'name' => 'Metformin',
                        'dosage' => '500mg',
                        'frequency' => 'Twice daily',
                        'duration' => '60 days',
                    ],
                ],
                'notes' => 'Check blood sugar levels regularly.',
                'vitals' => [
                    'blood_pressure' => '130/85 mmHg',
                    'blood_sugar' => '180 mg/dL',
                    'weight' => '82 kg',
                ],
                'advice' => 'Low sugar diet, regular exercise, monitor glucose levels',
                'follow_up_date' => now()->addMonths(1)->format('Y-m-d'),
            ],
            [
                'appointment_id' => null,
                'patient_id' => Patient::skip(2)->first()->id ?? Patient::first()->id,
                'doctor_id' => $doctor->id,
                'diagnosis' => 'Acute Bronchitis',
                'medications' => [
                    [
                        'name' => 'Amoxicillin',
                        'dosage' => '500mg',
                        'frequency' => 'Three times daily',
                        'duration' => '7 days',
                    ],
                    [
                        'name' => 'Cough Syrup',
                        'dosage' => '10ml',
                        'frequency' => 'As needed',
                        'duration' => '7 days',
                    ],
                ],
                'notes' => 'Complete the full course of antibiotics.',
                'vitals' => [
                    'temperature' => '100.4°F',
                    'oxygen_saturation' => '96%',
                ],
                'advice' => 'Rest, stay hydrated, avoid smoking',
                'follow_up_date' => now()->addWeeks(1)->format('Y-m-d'),
            ],
            [
                'appointment_id' => null,
                'patient_id' => Patient::skip(3)->first()->id ?? Patient::first()->id,
                'doctor_id' => $doctor->id,
                'diagnosis' => 'Migraine',
                'medications' => [
                    [
                        'name' => 'Sumatriptan',
                        'dosage' => '50mg',
                        'frequency' => 'As needed',
                        'duration' => '30 days',
                    ],
                ],
                'notes' => 'Take medication at onset of symptoms.',
                'vitals' => [
                    'blood_pressure' => '120/80 mmHg',
                ],
                'advice' => 'Identify triggers, maintain regular sleep schedule, reduce stress',
                'follow_up_date' => now()->addMonths(1)->format('Y-m-d'),
            ],
            [
                'appointment_id' => null,
                'patient_id' => Patient::skip(4)->first()->id ?? Patient::first()->id,
                'doctor_id' => $doctor->id,
                'diagnosis' => 'Vitamin D Deficiency',
                'medications' => [
                    [
                        'name' => 'Vitamin D3',
                        'dosage' => '60,000 IU',
                        'frequency' => 'Once weekly',
                        'duration' => '8 weeks',
                    ],
                ],
                'notes' => 'Retest vitamin D levels after 2 months.',
                'vitals' => [
                    'weight' => '68 kg',
                ],
                'advice' => 'Get adequate sunlight exposure, include vitamin D rich foods in diet',
                'follow_up_date' => now()->addMonths(2)->format('Y-m-d'),
            ],
        ];

        foreach ($prescriptions as $prescriptionData) {
            Prescription::create($prescriptionData);
        }

        $this->command->info('5 prescriptions seeded successfully!');
    }
}
