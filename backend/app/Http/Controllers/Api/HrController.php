<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class HrController extends Controller
{
    // --- Employee ---
    public function getEmployees()
    {
        return response()->json(Employee::with(['user', 'shift'])->paginate(20));
    }

    public function createShift(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
        ]);
        return response()->json(\App\Models\EmployeeShift::create($validated));
    }

    public function createEmployee(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'employee_code' => 'required|unique:employees,employee_code',
            'designation' => 'required|string',
            'join_date' => 'required|date',
            'basic_salary' => 'required|numeric',
            'shift_id' => 'nullable|exists:employee_shifts,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt('password'), // Default password
            ]);

            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_code' => $validated['employee_code'],
                'designation' => $validated['designation'],
                'join_date' => $validated['join_date'],
                'basic_salary' => $validated['basic_salary'],
                'shift_id' => $validated['shift_id'] ?? null,
            ]);

            return response()->json($employee);
        });
    }

    public function applyLeave(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        return response()->json(\App\Models\LeaveRequest::create($validated));
    }

    // --- Attendance ---
    public function markAttendance(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,leave,holiday',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
        ]);

        $attendance = Attendance::updateOrCreate(
            ['employee_id' => $validated['employee_id'], 'date' => $validated['date']],
            $validated
        );

        return response()->json($attendance);
    }

    // --- Payroll ---
    public function generatePayroll(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
        ]);

        $employees = Employee::where('is_active', true)->get();
        $payrolls = [];

        foreach ($employees as $emp) {
            // Simplified calculation: Net = Basic (Allowances/Deductions can be added later)
            // In real world: Calculate based on attendance days

            $payroll = Payroll::create([
                'employee_id' => $emp->id,
                'month' => $validated['month'],
                'year' => $validated['year'],
                'basic_salary' => $emp->basic_salary,
                'total_allowances' => 0,
                'total_deductions' => 0,
                'net_salary' => $emp->basic_salary,
                'status' => 'draft',
                'generated_at' => now(),
                'generated_by' => Auth::id() ?? 1,
            ]);
            $payrolls[] = $payroll;
        }

        return response()->json(['message' => 'Payroll generated', 'count' => count($payrolls)]);
    }
    public function updateEmployee(Request $request, $id)
    {
        $employee = Employee::with('user')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $employee->user_id,
            'employee_code' => ['required', \Illuminate\Validation\Rule::unique('employees')->ignore($employee->id)],
            'designation' => 'required|string',
            'join_date' => 'required|date',
            'basic_salary' => 'required|numeric',
            'shift_id' => 'nullable|exists:employee_shifts,id',
            'is_active' => 'boolean'
        ]);

        return DB::transaction(function () use ($validated, $employee) {
            $employee->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $employee->update([
                'employee_code' => $validated['employee_code'],
                'designation' => $validated['designation'],
                'join_date' => $validated['join_date'],
                'basic_salary' => $validated['basic_salary'],
                'shift_id' => $validated['shift_id'] ?? null,
                'is_active' => $validated['is_active'] ?? $employee->is_active,
            ]);

            return response()->json($employee->load('user'));
        });
    }

    public function deleteEmployee($id)
    {
        $employee = Employee::findOrFail($id);

        DB::transaction(function () use ($employee) {
            $user = $employee->user;
            $employee->delete();
            if ($user) {
                $user->delete();
            }
        });

        return response()->json(['message' => 'Employee deleted successfully']);
    }
}
