<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PatientNote;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\User;

class PatientNoteSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        PatientNote::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $doctor = Doctor::first();
        $doctorUserId = $doctor?->user_id ?? User::first()->id;
        $patientUsers = User::where('role', 'patient')->get();

        if ($patientUsers->isEmpty()) {
            $patientUsers = User::take(15)->get();
        }

        $complaints = [
            'Persistent headache for 3 days', 'Chest pain and shortness of breath',
            'Fever and cough for 5 days', 'Annual wellness checkup',
            'Type 2 Diabetes follow-up', 'Severe abdominal pain',
            'Knee pain during movement', 'Skin allergy and redness',
            'Back pain after heavy work', 'Dizziness and low appetite',
            'Ear blockage and ringing sound', 'Blurry vision in left eye',
            'Throat infection and difficulty swallowing', 'Palpitations and anxiety',
            'High BP routine evaluation'
        ];

        for ($i = 0; $i < 15; $i++) {
            $pUser = $patientUsers[$i % $patientUsers->count()];
            PatientNote::create([
                'patient_id' => $pUser->id,
                'doctor_id' => $doctorUserId,
                'visit_date' => now()->subDays($i + 1)->format('Y-m-d'),
                'chief_complaint' => $complaints[$i],
                'symptoms' => 'Symptoms reported during clinical evaluation #' . ($i + 1),
                'diagnosis' => 'Evaluated Condition #' . ($i + 1),
                'treatment_plan' => 'Prescribed standard clinical regimen and follow-up',
                'notes' => 'Patient advised proper rest and hydration.',
                'follow_up_instructions' => 'Follow up in 2 weeks',
                'next_visit_date' => now()->addWeeks(2)->format('Y-m-d'),
            ]);
        }

        $this->command->info('15 patient notes seeded successfully!');
    }
}
