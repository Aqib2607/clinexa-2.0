<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = Department::all();
        
        // Employee 1: Senior Nurse
        $user1 = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'sarah.johnson@hospital.com',
            'password' => Hash::make('password123'),
            'phone' => '+1-555-0101',
            'role' => 'nurse',
            'email_verified_at' => now(),
        ]);

        Employee::create([
            'user_id' => $user1->id,
            'department_id' => $departments->where('code', 'CARD')->first()?->id ?? $departments->first()->id,
            'employee_code' => 'EMP001',
            'designation' => 'Senior Staff Nurse',
            'join_date' => '2020-03-15',
            'dob' => '1988-05-20',
            'gender' => 'female',
            'phone' => '+1-555-0101',
            'address' => '123 Maple Street, Springfield, IL 62701',
            'basic_salary' => 45000.00,
            'bank_name' => 'First National Bank',
            'bank_account_no' => '1234567890',
            'is_active' => true,
        ]);

        // Employee 2: Administrative Staff
        $user2 = User::create([
            'name' => 'Michael Chen',
            'email' => 'michael.chen@hospital.com',
            'password' => Hash::make('password123'),
            'phone' => '+1-555-0102',
            'role' => 'nurse', // Using nurse role for staff as per system roles
            'email_verified_at' => now(),
        ]);

        Employee::create([
            'user_id' => $user2->id,
            'department_id' => $departments->where('code', 'GENM')->first()?->id ?? $departments->first()->id,
            'employee_code' => 'EMP002',
            'designation' => 'Administrative Officer',
            'join_date' => '2021-07-01',
            'dob' => '1992-11-10',
            'gender' => 'male',
            'phone' => '+1-555-0102',
            'address' => '456 Oak Avenue, Springfield, IL 62702',
            'basic_salary' => 38000.00,
            'bank_name' => 'City Bank',
            'bank_account_no' => '2345678901',
            'is_active' => true,
        ]);

        // Employee 3: Lab Technician
        $user3 = User::create([
            'name' => 'Emily Rodriguez',
            'email' => 'emily.rodriguez@hospital.com',
            'password' => Hash::make('password123'),
            'phone' => '+1-555-0103',
            'role' => 'nurse',
            'email_verified_at' => now(),
        ]);

        Employee::create([
            'user_id' => $user3->id,
            'department_id' => $departments->where('code', 'NEUR')->first()?->id ?? $departments->first()->id,
            'employee_code' => 'EMP003',
            'designation' => 'Lab Technician',
            'join_date' => '2019-09-12',
            'dob' => '1990-03-25',
            'gender' => 'female',
            'phone' => '+1-555-0103',
            'address' => '789 Pine Road, Springfield, IL 62703',
            'basic_salary' => 42000.00,
            'bank_name' => 'First National Bank',
            'bank_account_no' => '3456789012',
            'is_active' => true,
        ]);

        // Employee 4: Support Staff
        $user4 = User::create([
            'name' => 'David Kumar',
            'email' => 'david.kumar@hospital.com',
            'password' => Hash::make('password123'),
            'phone' => '+1-555-0104',
            'role' => 'nurse',
            'email_verified_at' => now(),
        ]);

        Employee::create([
            'user_id' => $user4->id,
            'department_id' => $departments->where('code', 'PED')->first()?->id ?? $departments->first()->id,
            'employee_code' => 'EMP004',
            'designation' => 'Support Staff',
            'join_date' => '2022-01-20',
            'dob' => '1995-08-14',
            'gender' => 'male',
            'phone' => '+1-555-0104',
            'address' => '321 Elm Boulevard, Springfield, IL 62704',
            'basic_salary' => 32000.00,
            'bank_name' => 'Community Bank',
            'bank_account_no' => '4567890123',
            'is_active' => true,
        ]);
    }
}
