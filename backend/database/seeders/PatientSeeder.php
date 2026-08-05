<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = [
            [
                'uhid' => 'UHID001',
                'name' => 'John Smith',
                'dob' => '1985-03-15',
                'gender' => 'Male',
                'phone' => '+1-555-0101',
                'email' => 'john.smith@example.com',
                'address' => '123 Main Street, New York, NY 10001',
                'blood_group' => 'O+',
                'guardian_name' => null,
                'guardian_phone' => null,
            ],
            [
                'uhid' => 'UHID002',
                'name' => 'Emily Johnson',
                'dob' => '1990-07-22',
                'gender' => 'Female',
                'phone' => '+1-555-0102',
                'email' => 'emily.johnson@example.com',
                'address' => '456 Oak Avenue, Los Angeles, CA 90001',
                'blood_group' => 'A+',
                'guardian_name' => null,
                'guardian_phone' => null,
            ],
            [
                'uhid' => 'UHID003',
                'name' => 'Michael Chen',
                'dob' => '1978-11-08',
                'gender' => 'Male',
                'phone' => '+1-555-0103',
                'email' => 'michael.chen@example.com',
                'address' => '789 Pine Road, Chicago, IL 60601',
                'blood_group' => 'B+',
                'guardian_name' => null,
                'guardian_phone' => null,
            ],
            [
                'uhid' => 'UHID004',
                'name' => 'Sarah Williams',
                'dob' => '1995-05-30',
                'gender' => 'Female',
                'phone' => '+1-555-0104',
                'email' => 'sarah.williams@example.com',
                'address' => '321 Elm Street, Houston, TX 77001',
                'blood_group' => 'AB+',
                'guardian_name' => null,
                'guardian_phone' => null,
            ],
            [
                'uhid' => 'UHID005',
                'name' => 'David Brown',
                'dob' => '1982-09-12',
                'gender' => 'Male',
                'phone' => '+1-555-0105',
                'email' => 'david.brown@example.com',
                'address' => '654 Maple Drive, Phoenix, AZ 85001',
                'blood_group' => 'O-',
                'guardian_name' => null,
                'guardian_phone' => null,
            ],
        ];

        foreach ($patients as $patientData) {
            Patient::create($patientData);
        }

        $this->command->info('5 patients seeded successfully!');
    }
}
