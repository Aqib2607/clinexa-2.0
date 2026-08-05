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
use App\Models\Department;
use Illuminate\Support\Str;

class NursePortalSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Department
        $cardiology = Department::firstOrCreate(
            ['name' => 'Cardiology'],
            ['code' => 'CARD', 'description' => 'Heart related issues']
        );

        // 2. Create Doctors
        $doctorUser = User::create([
            'name' => 'Dr. Sarah Smith',
            'email' => 'sarah.smith@example.com',
            'password' => bcrypt('password'),
            'role' => 'doctor',
            'phone' => '1234567890',
        ]);

        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'department_id' => $cardiology->id,
            'specialization' => 'Cardiologist',
            'license_number' => 'DOC-' . Str::random(8),
            'qualification' => 'MBBS, MD',
            'experience_years' => 10,
        ]);

        // 3. Create Wards & Beds
        $icu = Ward::firstOrCreate(
            ['name' => 'ICU'],
            ['type' => 'ICU', 'description' => 'Intensive Care Unit']
        );

        $bed1 = Bed::create([
            'ward_id' => $icu->id,
            'number' => 'ICU-01',
            'type' => 'ICU',
            'daily_charge' => 5000,
            'status' => 'occupied'
        ]);

        $bed2 = Bed::create([
            'ward_id' => $icu->id,
            'number' => 'ICU-02',
            'type' => 'ICU',
            'daily_charge' => 5000,
            'status' => 'occupied'
        ]);

        // 4. Create Patients
        $patient1 = Patient::create([
            'uhid' => 'P-' . date('Y') . '-001',
            'name' => 'John Doe',
            'dob' => '1980-05-15',
            'gender' => 'Male',
            'phone' => '9876543210',
            'blood_group' => 'O+',
            'address' => '123 Main St',
        ]);

        $patient2 = Patient::create([
            'uhid' => 'P-' . date('Y') . '-002',
            'name' => 'Jane Roe',
            'dob' => '1995-08-20',
            'gender' => 'Female',
            'phone' => '9876543211',
            'blood_group' => 'A+',
            'address' => '456 Oak St',
        ]);

        // 5. Admit Patients (Admissions)
        // Patient 1: Critical (High BP)
        $admission1 = Admission::create([
            'admission_number' => 'ADM-' . Str::random(8),
            'patient_id' => $patient1->id,
            'doctor_id' => $doctor->id,
            'bed_id' => $bed1->id,
            'admission_date' => now()->subDays(2),
            'status' => 'admitted',
            'diagnosis' => 'Hypertension Crisis',
            'emergency_contact_name' => 'Mary Doe',
            'emergency_contact_phone' => '1112223333',
        ]);

        // Patient 2: Stable
        $admission2 = Admission::create([
            'admission_number' => 'ADM-' . Str::random(8),
            'patient_id' => $patient2->id,
            'doctor_id' => $doctor->id,
            'bed_id' => $bed2->id,
            'admission_date' => now()->subDays(1),
            'status' => 'admitted',
            'diagnosis' => 'Post-op Recovery',
            'emergency_contact_name' => 'Richard Roe',
            'emergency_contact_phone' => '4445556666',
        ]);

        // 6. Add Vitals
        // Critical Vitals for Patient 1
        VitalSign::create([
            'admission_id' => $admission1->id,
            'bp_systolic' => 190, // Critical (>180)
            'bp_diastolic' => 100,
            'pulse' => 110,
            'temperature' => 99.5,
            'spo2' => 95,
            'respiratory_rate' => 20,
            'recorded_at' => now()->subMinutes(30),
            'recorded_by' => $doctorUser->id, // Assuming doc/nurse recorded it
        ]);

        // Stable Vitals for Patient 2
        VitalSign::create([
            'admission_id' => $admission2->id,
            'bp_systolic' => 120, // Stable
            'bp_diastolic' => 80,
            'pulse' => 72,
            'temperature' => 98.6,
            'spo2' => 99,
            'respiratory_rate' => 16,
            'recorded_at' => now()->subMinutes(60),
            'recorded_by' => $doctorUser->id,
        ]);
        
        // Add a pending vitals patient (no recent vitals)
        $wm = Ward::firstOrCreate(
            ['name' => 'General Ward'],
            ['type' => 'General', 'description' => 'General Ward']
        );
        $bed3 = Bed::create([
            'ward_id' => $wm->id,
            'number' => 'GEN-01',
            'type' => 'General',
            'daily_charge' => 1000,
            'status' => 'occupied'
        ]);
        $patient3 = Patient::create([
            'uhid' => 'P-' . date('Y') . '-003',
            'name' => 'Robert Doo',
            'dob' => '1950-01-01',
            'gender' => 'Male',
        ]);
        Admission::create([
            'admission_number' => 'ADM-' . Str::random(8),
            'patient_id' => $patient3->id,
            'doctor_id' => $doctor->id,
            'bed_id' => $bed3->id,
            'admission_date' => now()->subDays(5),
            'status' => 'admitted',
            'diagnosis' => 'Observation',
        ]);
    }
}
