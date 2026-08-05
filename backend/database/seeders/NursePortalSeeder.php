<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Ward;
use App\Models\Bed;
use App\Models\Admission;
use App\Models\VitalSign;
use App\Models\NursingNote;
use App\Models\Discharge;
use Illuminate\Support\Str;

class NursePortalSeeder extends Seeder
{
    public function run(): void
    {
        $doctor = Doctor::first();
        $nurseUser = User::where('role', 'nurse')->first() ?? User::first();
        $patients = Patient::take(15)->get();
        $beds = Bed::all();

        if ($patients->isEmpty() || $beds->isEmpty() || !$doctor) {
            return;
        }

        $diagnoses = [
            'Hypertension Crisis', 'Post-Op Recovery', 'Acute Appendicitis',
            'Severe Pneumonia', 'Congestive Heart Failure', 'Diabetic Ketoacidosis',
            'Acute Pancreatitis', 'Stroke Observation', 'Fracture Femur Repair',
            'Asthma Severe Attack', 'Renal Colic / Kidney Stones', 'Gastroenteritis Severe'
        ];

        for ($i = 0; $i < min(12, count($patients)); $i++) {
            $patient = $patients[$i];
            $bed = $beds[$i % count($beds)];

            $adm = Admission::create([
                'admission_number' => 'ADM-2026-' . sprintf('%03d', $i + 1),
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'bed_id' => $bed->id,
                'admission_date' => now()->subDays($i + 1),
                'discharge_date' => $i >= 8 ? now()->subDays(1) : null,
                'status' => $i >= 8 ? 'discharged' : 'admitted',
                'diagnosis' => $diagnoses[$i % count($diagnoses)],
                'emergency_contact_name' => 'Guardian of ' . $patient->name,
                'emergency_contact_phone' => '+1-555-0199',
                'initial_deposit' => 5000.00,
            ]);

            // Add Vitals
            VitalSign::create([
                'admission_id' => $adm->id,
                'bp_systolic' => rand(110, 150),
                'bp_diastolic' => rand(70, 95),
                'pulse' => rand(65, 100),
                'temperature' => 98.6 + (rand(0, 20) / 10),
                'spo2' => rand(95, 100),
                'respiratory_rate' => rand(14, 22),
                'recorded_at' => now()->subHours($i * 3),
                'recorded_by' => $nurseUser->id,
            ]);

            // Add Nursing Notes
            NursingNote::create([
                'admission_id' => $adm->id,
                'noted_by' => $nurseUser->id,
                'noted_at' => now()->subHours($i * 3),
                'note' => 'Patient resting comfortably. IV fluids flowing properly. Vitals checked and recorded.',
            ]);

            // Add Discharges if status is discharged
            if ($i >= 8) {
                Discharge::create([
                    'admission_id' => $adm->id,
                    'discharge_date' => now()->subDays(1),
                    'type' => 'regular',
                    'summary' => 'Patient condition improved significantly. Discharged with home medication prescriptions.',
                    'instructions' => 'Take prescribed medicines regularly. Avoid heavy physical exertion.',
                    'finalized_by' => $nurseUser->id,
                ]);
            }
        }

        $this->command->info('Nurse Portal admissions, vitals, notes, and discharges seeded successfully!');
    }
}
