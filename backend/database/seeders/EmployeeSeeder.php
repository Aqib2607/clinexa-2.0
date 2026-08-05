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
        $defaultDept = $departments->first()?->id;

        $employeesData = [
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP001',
                'designation' => 'Senior Staff Nurse',
                'dept_code' => 'CARD',
                'join_date' => '2020-03-15',
                'dob' => '1988-05-20',
                'gender' => 'female',
                'phone' => '+1-555-0101',
                'basic_salary' => 45000.00,
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP002',
                'designation' => 'Administrative Officer',
                'dept_code' => 'GENM',
                'join_date' => '2021-07-01',
                'dob' => '1992-11-10',
                'gender' => 'male',
                'phone' => '+1-555-0102',
                'basic_salary' => 38000.00,
            ],
            [
                'name' => 'Emily Rodriguez',
                'email' => 'emily.rodriguez@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP003',
                'designation' => 'Lab Technician',
                'dept_code' => 'NEUR',
                'join_date' => '2019-09-12',
                'dob' => '1990-03-25',
                'gender' => 'female',
                'phone' => '+1-555-0103',
                'basic_salary' => 42000.00,
            ],
            [
                'name' => 'David Kumar',
                'email' => 'david.kumar@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP004',
                'designation' => 'Support Staff',
                'dept_code' => 'PED',
                'join_date' => '2022-01-20',
                'dob' => '1995-08-14',
                'gender' => 'male',
                'phone' => '+1-555-0104',
                'basic_salary' => 32000.00,
            ],
            [
                'name' => 'Rachel Adams',
                'email' => 'rachel.adams@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP005',
                'designation' => 'ICU Staff Nurse',
                'dept_code' => 'CARD',
                'join_date' => '2021-02-10',
                'dob' => '1991-04-18',
                'gender' => 'female',
                'phone' => '+1-555-0105',
                'basic_salary' => 46000.00,
            ],
            [
                'name' => 'Robert Taylor',
                'email' => 'robert.taylor@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP006',
                'designation' => 'Pharmacist',
                'dept_code' => 'GENM',
                'join_date' => '2018-05-14',
                'dob' => '1986-09-30',
                'gender' => 'male',
                'phone' => '+1-555-0106',
                'basic_salary' => 48000.00,
            ],
            [
                'name' => 'Jessica White',
                'email' => 'jessica.white@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP007',
                'designation' => 'Radiology Technician',
                'dept_code' => 'ORTH',
                'join_date' => '2020-11-01',
                'dob' => '1993-12-05',
                'gender' => 'female',
                'phone' => '+1-555-0107',
                'basic_salary' => 43000.00,
            ],
            [
                'name' => 'Daniel Martin',
                'email' => 'daniel.martin@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP008',
                'designation' => 'Accountant',
                'dept_code' => 'GENM',
                'join_date' => '2019-03-22',
                'dob' => '1987-07-19',
                'gender' => 'male',
                'phone' => '+1-555-0108',
                'basic_salary' => 50000.00,
            ],
            [
                'name' => 'Sophia Clark',
                'email' => 'sophia.clark@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP009',
                'designation' => 'HR Manager',
                'dept_code' => 'GENM',
                'join_date' => '2017-08-15',
                'dob' => '1984-01-28',
                'gender' => 'female',
                'phone' => '+1-555-0109',
                'basic_salary' => 55000.00,
            ],
            [
                'name' => 'James Lewis',
                'email' => 'james.lewis@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP010',
                'designation' => 'OT Technician',
                'dept_code' => 'ORTH',
                'join_date' => '2022-04-05',
                'dob' => '1996-10-12',
                'gender' => 'male',
                'phone' => '+1-555-0110',
                'basic_salary' => 39000.00,
            ],
            [
                'name' => 'Olivia Walker',
                'email' => 'olivia.walker@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP011',
                'designation' => 'Pediatric Nurse',
                'dept_code' => 'PED',
                'join_date' => '2021-09-01',
                'dob' => '1994-02-14',
                'gender' => 'female',
                'phone' => '+1-555-0111',
                'basic_salary' => 44000.00,
            ],
            [
                'name' => 'William Hall',
                'email' => 'william.hall@hospital.com',
                'role' => 'nurse',
                'employee_code' => 'EMP012',
                'designation' => 'Inventory Manager',
                'dept_code' => 'GENM',
                'join_date' => '2020-06-18',
                'dob' => '1989-11-22',
                'gender' => 'male',
                'phone' => '+1-555-0112',
                'basic_salary' => 47000.00,
            ],
        ];

        foreach ($employeesData as $emp) {
            $user = User::firstOrCreate(
                ['email' => $emp['email']],
                [
                    'name' => $emp['name'],
                    'password' => Hash::make('password123'),
                    'phone' => $emp['phone'],
                    'role' => $emp['role'],
                    'email_verified_at' => now(),
                ]
            );

            $deptId = $departments->where('code', $emp['dept_code'])->first()?->id ?? $defaultDept;

            Employee::updateOrCreate(
                ['employee_code' => $emp['employee_code']],
                [
                    'user_id' => $user->id,
                    'department_id' => $deptId,
                    'designation' => $emp['designation'],
                    'join_date' => $emp['join_date'],
                    'dob' => $emp['dob'],
                    'gender' => $emp['gender'],
                    'phone' => $emp['phone'],
                    'address' => 'Springfield, IL 62701',
                    'basic_salary' => $emp['basic_salary'],
                    'bank_name' => 'First National Bank',
                    'bank_account_no' => '12345' . rand(10000, 99999),
                    'is_active' => true,
                ]
            );
        }

        $this->command->info(count($employeesData) . ' employees seeded successfully!');
    }
}
