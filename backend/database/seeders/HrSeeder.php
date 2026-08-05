<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Employee;
use App\Models\User;

class HrSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create(['name' => 'HR Admin', 'email' => 'hr_admin@hospital.com']);
        $employees = Employee::all();

        if ($employees->isEmpty()) {
            $this->call(EmployeeSeeder::class);
            $employees = Employee::all();
        }

        // 1. Employee Shifts (10 shifts)
        $shifts = [
            ['name' => 'Morning Shift A', 'start' => '07:00:00', 'end' => '15:00:00'],
            ['name' => 'Day Shift B', 'start' => '09:00:00', 'end' => '17:00:00'],
            ['name' => 'Evening Shift C', 'start' => '15:00:00', 'end' => '23:00:00'],
            ['name' => 'Night Shift D', 'start' => '23:00:00', 'end' => '07:00:00'],
            ['name' => 'General Admin Shift', 'start' => '09:30:00', 'end' => '18:00:00'],
            ['name' => 'OT Morning Shift', 'start' => '06:00:00', 'end' => '14:00:00'],
            ['name' => 'OT Afternoon Shift', 'start' => '14:00:00', 'end' => '22:00:00'],
            ['name' => 'Emergency ICU Shift 1', 'start' => '08:00:00', 'end' => '16:00:00'],
            ['name' => 'Emergency ICU Shift 2', 'start' => '16:00:00', 'end' => '00:00:00'],
            ['name' => 'Emergency ICU Shift 3', 'start' => '00:00:00', 'end' => '08:00:00'],
        ];

        $shiftIds = [];
        foreach ($shifts as $s) {
            $id = Str::uuid()->toString();
            $shiftIds[] = $id;
            DB::table('employee_shifts')->insert([
                'id' => $id,
                'name' => $s['name'],
                'start_time' => $s['start'],
                'end_time' => $s['end'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Assign shifts to employees
        foreach ($employees as $idx => $emp) {
            $emp->update(['shift_id' => $shiftIds[$idx % count($shiftIds)]]);
        }

        // 2. Attendances (20 attendance records)
        foreach ($employees as $idx => $emp) {
            for ($d = 1; $d <= 2; $d++) {
                DB::table('attendances')->insert([
                    'id' => Str::uuid()->toString(),
                    'employee_id' => $emp->id,
                    'date' => now()->subDays($d)->toDateString(),
                    'check_in' => '08:55:00',
                    'check_out' => '17:05:00',
                    'status' => 'present',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 3. Leave Requests (12 leave requests)
        foreach ($employees->take(12) as $idx => $emp) {
            DB::table('leave_requests')->insert([
                'id' => Str::uuid()->toString(),
                'employee_id' => $emp->id,
                'start_date' => now()->addDays($idx + 1)->toDateString(),
                'end_date' => now()->addDays($idx + 3)->toDateString(),
                'reason' => 'Personal leave / medical emergency',
                'status' => $idx % 2 === 0 ? 'approved' : 'pending',
                'approved_by' => $idx % 2 === 0 ? $admin->id : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Payrolls (12 payroll records)
        foreach ($employees->take(12) as $idx => $emp) {
            $basic = $emp->basic_salary > 0 ? $emp->basic_salary : 45000.00;
            $allowances = 3000.00;
            $deductions = 1500.00;
            $net = $basic + $allowances - $deductions;

            DB::table('payrolls')->insert([
                'id' => Str::uuid()->toString(),
                'employee_id' => $emp->id,
                'month' => 1,
                'year' => 2026,
                'basic_salary' => $basic,
                'total_allowances' => $allowances,
                'total_deductions' => $deductions,
                'net_salary' => $net,
                'status' => 'paid',
                'generated_at' => now()->subDays(10),
                'generated_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('HR tables seeded successfully!');
    }
}
