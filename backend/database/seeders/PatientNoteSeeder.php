<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PatientNote;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\User;

class PatientNoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        PatientNote::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $patients = Patient::limit(5)->get();
        $doctor = Doctor::first();

        if ($patients->count() < 5) {
            $this->command->error('Not enough patients! Please run PatientSeeder first.');
            return;
        }

        if (!$doctor) {
            $this->command->error('No doctors found! Please seed doctors first.');
            return;
        }

        // Get doctor's user ID
        $doctorUserId = $doctor->user_id;
        // Get patient user IDs (PatientNote uses user_id, not patient table id)
        $patientUsers = User::where('role', 'patient')->limit(5)->get();

        if ($patientUsers->count() < 5) {
            $this->command->warn('Not enough patient users. Creating notes with available patients.');
        }

        $notes = [
            [
                'patient_id' => $patientUsers[0]->id ?? $patientUsers->first()->id,
                'doctor_id' => $doctorUserId,
                'visit_date' => now()->subDays(2)->format('Y-m-d'),
                'chief_complaint' => 'Persistent headache for 3 days',
                'symptoms' => 'Throbbing headache, sensitivity to light, nausea',
                'diagnosis' => 'Migraine',
                'treatment_plan' => 'Prescribed Sumatriptan, rest in dark room',
                'notes' => 'Patient reports stress at work. Recommended stress management techniques.',
                'follow_up_instructions' => 'Return if symptoms worsen or persist beyond 48 hours',
                'next_visit_date' => now()->addWeeks(2)->format('Y-m-d'),
            ],
            [
                'patient_id' => $patientUsers[1]->id ?? $patientUsers->first()->id,
                'doctor_id' => $doctorUserId,
                'visit_date' => now()->subDays(5)->format('Y-m-d'),
                'chief_complaint' => 'Chest pain and shortness of breath',
                'symptoms' => 'Sharp chest pain, difficulty breathing, anxiety',
                'diagnosis' => 'Angina, requires cardiac evaluation',
                'treatment_plan' => 'ECG performed, referred to cardiologist',
                'notes' => 'Family history of heart disease. Advised lifestyle modifications.',
                'follow_up_instructions' => 'See cardiologist within 48 hours, avoid strenuous activity',
                'next_visit_date' => now()->addDays(3)->format('Y-m-d'),
            ],
            [
                'patient_id' => $patientUsers[2]->id ?? $patientUsers->first()->id,
                'doctor_id' => $doctorUserId,
                'visit_date' => now()->subDays(10)->format('Y-m-d'),
                'chief_complaint' => 'Fever and cough for 5 days',
                'symptoms' => 'High fever, productive cough, fatigue',
                'diagnosis' => 'Acute Bronchitis',
                'treatment_plan' => 'Antibiotics (Amoxicillin 500mg TID), cough syrup, rest',
                'notes' => 'Chest clear on auscultation. No signs of pneumonia.',
                'follow_up_instructions' => 'Complete full course of antibiotics. Return if fever persists.',
                'next_visit_date' => now()->addWeeks(1)->format('Y-m-d'),
            ],
            [
                'patient_id' => $patientUsers[3]->id ?? $patientUsers->first()->id,
                'doctor_id' => $doctorUserId,
                'visit_date' => now()->subDays(15)->format('Y-m-d'),
                'chief_complaint' => 'Annual wellness checkup',
                'symptoms' => 'None reported',
                'diagnosis' => 'Healthy, routine checkup',
                'treatment_plan' => 'Continue current health practices',
                'notes' => 'Blood pressure normal, weight stable, all vitals within normal limits.',
                'follow_up_instructions' => 'Schedule next annual checkup in 12 months',
                'next_visit_date' => now()->addYear()->format('Y-m-d'),
            ],
            [
                'patient_id' => $patientUsers[4]->id ?? $patientUsers->first()->id,
                'doctor_id' => $doctorUserId,
                'visit_date' => now()->subDays(20)->format('Y-m-d'),
                'chief_complaint' => 'Type 2 Diabetes follow-up',
                'symptoms' => 'Increased thirst, frequent urination',
                'diagnosis' => 'Type 2 Diabetes - uncontrolled',
                'treatment_plan' => 'Adjusted Metformin dosage to 1000mg BID, dietary counseling',
                'notes' => 'HbA1c elevated at 8.2%. Discussed importance of diet and exercise.',
                'follow_up_instructions' => 'Monitor blood sugar daily, follow diabetic diet strictly',
                'next_visit_date' => now()->addMonths(1)->format('Y-m-d'),
            ],
        ];

        foreach ($notes as $noteData) {
            PatientNote::create($noteData);
        }

        $this->command->info('5 patient notes seeded successfully!');
    }
}
