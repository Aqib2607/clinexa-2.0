<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getDashboardStats()
    {
        // 1. Counts
        $totalUsers = User::count();
        $activeUsers = User::count(); // Assuming all users are active for now as is_active column doesn't exist
        $totalDoctors = Doctor::count();
        $totalStaff = Employee::count();
        $totalDepartments = Department::count();
        $totalAppointments = Appointment::count();

        // 2. Recent Activity (Simulated from latest creations)
        $latestUsers = User::latest()->take(3)->get()->map(function ($user) {
            return [
                'action' => 'User Created',
                'details' => "New user {$user->name} registered",
                'time' => $user->created_at->diffForHumans(),
                'timestamp' => $user->created_at
            ];
        });

        $latestAppointments = Appointment::latest()->take(2)->get()->map(function ($app) {
            return [
                'action' => 'New Appointment',
                'details' => "Appointment #{$app->id} scheduled",
                'time' => $app->created_at->diffForHumans(),
                'timestamp' => $app->created_at
            ];
        });

        // Merge and sort
        $recentActivity = $latestUsers->merge($latestAppointments)
            ->sortByDesc('timestamp')
            ->take(5)
            ->values();

        return response()->json([
            'stats' => [
                'active_users' => $activeUsers,
                'total_users' => $totalUsers,
                'total_doctors' => $totalDoctors,
                'total_departments' => $totalDepartments,
                'total_staff' => $totalStaff,
                'system_uptime' => '99.9%', // Hardcoded for now as getting real server uptime might be OS specific
                'security_alerts' => 0, // Placeholder
            ],
            'recent_activity' => $recentActivity
        ]);
    }

    public function getReports(Request $request)
    {
        $period = $request->query('period', 'this_month');
        // Date filtering logic can be added later based on $period

        // 1. Patient Demographics
        $totalPatients = \App\Models\Patient::count();
        $genderDistribution = \App\Models\Patient::selectRaw('gender, count(*) as count')
            ->groupBy('gender')
            ->pluck('count', 'gender');

        // 2. Financial Summary
        $totalRevenue = \App\Models\Bill::sum('paid_amount') + \App\Models\PharmacySale::sum('paid_amount');
        $outstanding = \App\Models\Bill::sum('due_amount');

        // 3. Appointment Stats
        $appointmentStats = \App\Models\Appointment::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // 4. Inventory Value
        $inventoryValue = \App\Models\PharmacyStock::sum(\Illuminate\Support\Facades\DB::raw('quantity * purchase_price'));

        return response()->json([
            'demographics' => [
                'total' => $totalPatients,
                'gender' => $genderDistribution
            ],
            'financials' => [
                'revenue' => $totalRevenue,
                'outstanding' => $outstanding
            ],
            'appointments' => $appointmentStats,
            'inventory' => [
                'total_value' => $inventoryValue,
                'items_count' => \App\Models\PharmacyStock::count()
            ]
        ]);
    }

    public function exportReportDetail(Request $request, $type)
    {
        $period = $request->query('period', 'this_month');

        $startDate = match ($period) {
            'today' => \Illuminate\Support\Carbon::today(),
            'this_week' => \Illuminate\Support\Carbon::now()->startOfWeek(),
            'this_month' => \Illuminate\Support\Carbon::now()->startOfMonth(),
            'last_month' => \Illuminate\Support\Carbon::now()->subMonth()->startOfMonth(),
            'this_year' => \Illuminate\Support\Carbon::now()->startOfYear(),
            default => \Illuminate\Support\Carbon::now()->startOfMonth(),
        };

        $endDate = match ($period) {
            'last_month' => \Illuminate\Support\Carbon::now()->subMonth()->endOfMonth(),
            default => \Illuminate\Support\Carbon::now()->endOfDay(),
        };

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"report_{$type}_{$period}.csv\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($type, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            if ($type === 'demographics') {
                fputcsv($file, ['ID', 'Name', 'Gender', 'Phone', 'Created At']);
                \App\Models\Patient::chunk(100, function ($patients) use ($file) {
                    foreach ($patients as $p) {
                        fputcsv($file, [$p->id, $p->name, $p->gender, $p->phone, $p->created_at]);
                    }
                });
            } elseif ($type === 'financials') {
                fputcsv($file, ['ID', 'Bill Number', 'Patient', 'Total Amount', 'Paid Amount', 'Due Amount', 'Status', 'Date']);
                \App\Models\Bill::whereBetween('created_at', [$startDate, $endDate])
                    ->chunk(100, function ($bills) use ($file) {
                        foreach ($bills as $b) {
                            fputcsv($file, [$b->id, $b->bill_number, $b->patient_id, $b->total_amount, $b->paid_amount, $b->due_amount, $b->status, $b->created_at]);
                        }
                    });
            } elseif ($type === 'appointments') {
                fputcsv($file, ['ID', 'Doctor', 'Patient', 'Date', 'Status', 'Symptoms']);
                \App\Models\Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                    ->chunk(100, function ($apps) use ($file) {
                        foreach ($apps as $a) {
                            fputcsv($file, [$a->id, $a->doctor_id, $a->patient_id, $a->appointment_date, $a->status, $a->symptoms]);
                        }
                    });
            } elseif ($type === 'inventory') {
                fputcsv($file, ['Item ID', 'Batch', 'Quantity', 'Purchase Price', 'Sale Price', 'Expiry']);
                \App\Models\PharmacyStock::chunk(100, function ($items) use ($file) {
                    foreach ($items as $i) {
                        fputcsv($file, [$i->pharmacy_item_id, $i->batch_number, $i->quantity, $i->purchase_price, $i->sale_price, $i->expiry_date]);
                    }
                });
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
