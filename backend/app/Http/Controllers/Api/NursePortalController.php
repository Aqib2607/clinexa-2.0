<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\VitalSign;
use App\Models\NursingNote;
use App\Models\User;
use App\Models\Employee;
use App\Models\Doctor;
use App\Models\Bed;
use App\Models\Patient;
use App\Models\NurseTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NursePortalController extends Controller
{
    /**
     * Get nurse dashboard summary data
     */
    public function getDashboardData(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->with('shift')->first();

        $admissions = Admission::with(['patient', 'bed.ward', 'doctor.user'])
            ->where('status', 'admitted')
            ->get();

        $totalPatients = $admissions->count();

        $fourHoursAgo = now()->subHours(4);
        $pendingVitals = $admissions->filter(function ($admission) use ($fourHoursAgo) {
            $lastVital = VitalSign::where('admission_id', $admission->id)
                ->orderBy('recorded_at', 'desc')
                ->first();
            return !$lastVital || $lastVital->recorded_at < $fourHoursAgo;
        })->count();

        $tasksCompleted = NurseTask::whereDate('completed_at', today())->count();
        $tasksPending = NurseTask::where('completed', false)->count();
        $tasksTotal = $tasksCompleted + $tasksPending + $pendingVitals;

        $recentVitals = VitalSign::with(['admission.patient'])
            ->orderBy('recorded_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($vital) {
                return [
                    'id' => $vital->id,
                    'patient_name' => $vital->admission?->patient?->name ?? 'Unknown',
                    'admission_id' => $vital->admission_id,
                    'temperature' => $vital->temperature,
                    'spo2' => $vital->spo2,
                    'pulse' => $vital->pulse,
                    'recorded_at' => $vital->recorded_at,
                ];
            });

        $patients = $admissions->map(function ($admission) {
            $lastVital = VitalSign::where('admission_id', $admission->id)
                ->orderBy('recorded_at', 'desc')
                ->first();

            $status = 'stable';
            if ($lastVital) {
                if (($lastVital->bp_systolic && $lastVital->bp_systolic > 180) ||
                    ($lastVital->spo2 && $lastVital->spo2 < 90) ||
                    ($lastVital->temperature && $lastVital->temperature > 103)) {
                    $status = 'critical';
                }
            }

            return [
                'id' => $admission->id,
                'patient_name' => $admission->patient?->name ?? 'Unknown',
                'ward' => $admission->bed?->ward?->name ?? 'N/A',
                'bed_number' => $admission->bed?->number ?? 'N/A',
                'diagnosis' => $admission->diagnosis,
                'status' => $status,
                'last_vital_at' => $lastVital?->recorded_at,
            ];
        });

        return response()->json([
            'stats' => [
                'total_patients' => $totalPatients,
                'pending_vitals' => $pendingVitals,
                'tasks_completed' => $tasksCompleted,
                'tasks_total' => $tasksTotal,
            ],
            'recent_vitals' => $recentVitals,
            'patients' => $patients,
            'shift' => $employee?->shift ? [
                'name' => $employee->shift->name,
                'start_time' => $employee->shift->start_time,
                'end_time' => $employee->shift->end_time,
            ] : null,
        ]);
    }

    /**
     * Get recent vital signs recordings
     */
    public function getRecentVitals(Request $request)
    {
        $query = VitalSign::with(['admission.patient', 'admission.bed.ward'])
            ->orderBy('recorded_at', 'desc');

        if ($request->has('admission_id')) {
            $query->where('admission_id', $request->admission_id);
        }

        $vitals = $query->paginate(20);

        $vitals->getCollection()->transform(function ($vital) {
            return [
                'id' => $vital->id,
                'admission_id' => $vital->admission_id,
                'patient_name' => $vital->admission?->patient?->name ?? 'Unknown',
                'ward' => $vital->admission?->bed?->ward?->name ?? 'N/A',
                'bed_number' => $vital->admission?->bed?->number ?? 'N/A',
                'blood_pressure' => ($vital->bp_systolic && $vital->bp_diastolic)
                    ? "{$vital->bp_systolic}/{$vital->bp_diastolic}" : null,
                'heart_rate' => $vital->pulse,
                'temperature' => $vital->temperature,
                'respiratory_rate' => $vital->respiratory_rate,
                'oxygen_saturation' => $vital->spo2,
                'recorded_at' => $vital->recorded_at,
                'recorded_by' => $vital->recorded_by,
                'time_ago' => $vital->recorded_at ? $vital->recorded_at->diffForHumans() : null,
            ];
        });

        return response()->json($vitals);
    }

    /**
     * List admitted patients for nurse views
     */
    public function getPatients(Request $request)
    {
        $admissions = Admission::with(['patient', 'bed.ward'])
            ->where('status', 'admitted')
            ->orderByDesc('admission_date')
            ->get();

        $patients = $admissions->map(function ($admission) {
            return [
                'id' => $admission->id,
                'name' => $admission->patient?->name ?? 'Unknown',
                'uhid' => $admission->patient?->uhid ?? null,
                'ward' => $admission->bed?->ward?->name ?? 'N/A',
                'bed_number' => $admission->bed?->number ?? 'N/A',
                'diagnosis' => $admission->diagnosis ?? 'Under observation',
                'admission_date' => $admission->admission_date,
            ];
        });

        return response()->json($patients);
    }

    /**
     * Get tasks for the nurse (stored + auto-generated vitals)
     */
    public function getTasks(Request $request)
    {
        $storedTasks = NurseTask::with(['admission.patient', 'admission.bed.ward'])
            ->orderBy('due_at', 'asc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => (string) $task->id,
                    'title' => $task->title,
                    'patient_name' => $task->admission?->patient?->name ?? 'Unknown',
                    'ward' => $task->admission?->bed?->ward?->name ?? 'N/A',
                    'priority' => $task->priority ?? 'medium',
                    'due_time' => $task->due_at ? $task->due_at->format('H:i') : now()->format('H:i'),
                    'completed' => (bool) $task->completed,
                    'type' => $task->type ?? 'general',
                    'admission_id' => $task->admission_id,
                    'notes' => $task->description,
                ];
            })
            ->toArray();

        $admissions = Admission::with(['patient', 'bed.ward'])
            ->where('status', 'admitted')
            ->get();

        $fourHoursAgo = now()->subHours(4);
        $autoTasks = [];

        $storedVitalsAdmissionIds = collect($storedTasks)
            ->filter(fn ($t) => $t['type'] === 'vitals' && !$t['completed'] && $t['admission_id'])
            ->pluck('admission_id')
            ->all();

        foreach ($admissions as $admission) {
            $lastVital = VitalSign::where('admission_id', $admission->id)
                ->orderBy('recorded_at', 'desc')
                ->first();

            $needsVitals = !$lastVital || $lastVital->recorded_at < $fourHoursAgo;
            $alreadyHasTask = in_array($admission->id, $storedVitalsAdmissionIds, true);

            if ($needsVitals && !$alreadyHasTask) {
                $autoTasks[] = [
                    'id' => 'vital-' . $admission->id,
                    'title' => 'Record vital signs',
                    'patient_name' => $admission->patient?->name ?? 'Unknown',
                    'ward' => $admission->bed?->ward?->name ?? 'N/A',
                    'priority' => (!$lastVital || $lastVital->recorded_at < now()->subHours(6)) ? 'high' : 'medium',
                    'due_time' => now()->format('H:i'),
                    'completed' => false,
                    'type' => 'vitals',
                    'admission_id' => $admission->id,
                    'notes' => $lastVital ? 'Last recorded: ' . $lastVital->recorded_at->diffForHumans() : 'Never recorded',
                ];
            }
        }

        $tasks = array_merge($autoTasks, $storedTasks);
        usort($tasks, function ($a, $b) {
            $priorityOrder = ['high' => 0, 'medium' => 1, 'low' => 2];
            return ($priorityOrder[$a['priority']] ?? 2) <=> ($priorityOrder[$b['priority']] ?? 2);
        });

        return response()->json($tasks);
    }

    /**
     * Get specific patient details (admission)
     */
    public function getPatientDetails($id)
    {
        $admission = Admission::with(['patient', 'bed.ward', 'doctor.user'])
            ->where('id', $id)
            ->firstOrFail();

        $lastVital = VitalSign::where('admission_id', $admission->id)
            ->orderBy('recorded_at', 'desc')
            ->first();

        $status = 'stable';
        if ($lastVital) {
            if (($lastVital->bp_systolic && $lastVital->bp_systolic > 180) ||
                ($lastVital->spo2 && $lastVital->spo2 < 90) ||
                ($lastVital->temperature && $lastVital->temperature > 103)) {
                $status = 'critical';
            }
        }

        $vitalsHistory = VitalSign::where('admission_id', $admission->id)
            ->orderBy('recorded_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($vital) {
                return [
                    'id' => $vital->id,
                    'bp' => ($vital->bp_systolic && $vital->bp_diastolic) ? "{$vital->bp_systolic}/{$vital->bp_diastolic}" : 'N/A',
                    'temperature' => $vital->temperature,
                    'pulse' => $vital->pulse,
                    'spo2' => $vital->spo2,
                    'respiratory_rate' => $vital->respiratory_rate,
                    'recorded_at' => $vital->recorded_at,
                    'recorded_by_name' => $vital->recordedBy?->name ?? 'Unknown',
                ];
            });

        return response()->json([
            'id' => $admission->id,
            'patient_id' => $admission->patient_id,
            'name' => $admission->patient?->name ?? 'Unknown',
            'uhid' => $admission->patient?->uhid ?? 'N/A',
            'age' => $admission->patient?->dob ? (int) now()->diffInYears($admission->patient->dob) : null,
            'gender' => $admission->patient?->gender ?? 'N/A',
            'blood_group' => $admission->patient?->blood_group ?? 'N/A',
            'ward' => $admission->bed?->ward?->name ?? 'N/A',
            'bed_number' => $admission->bed?->number ?? 'N/A',
            'condition' => $admission->diagnosis ?? 'Under observation',
            'status' => $status,
            'doctor' => $admission->doctor?->user?->name ?? 'N/A',
            'admission_date' => $admission->admission_date,
            'vitals_history' => $vitalsHistory,
        ]);
    }

    /**
     * Mark a task as completed
     */
    public function completeTask(Request $request, $id)
    {
        // Auto-generated tasks (e.g., vital-xxx) are not stored in DB
        if (str_starts_with($id, 'vital-')) {
            return response()->json(['message' => 'Auto-generated task acknowledged']);
        }

        $task = NurseTask::find($id);
        if ($task) {
            $task->completed = true;
            $task->completed_by = $request->user()->id;
            $task->completed_at = now();
            $task->save();
            return response()->json(['message' => 'Task marked as completed']);
        }

        return response()->json(['message' => 'Task not found'], 404);
    }

    /**
     * Get nurse profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->with('shift', 'department')->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'employee' => $employee ? [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'designation' => $employee->designation,
                'department' => $employee->department?->name ?? 'N/A',
                'dob' => $employee->dob ? $employee->dob->format('Y-m-d') : null,
                'gender' => $employee->gender,
                'address' => $employee->address,
                'join_date' => $employee->join_date ? $employee->join_date->format('Y-m-d') : null,
                'shift' => $employee->shift ? [
                    'name' => $employee->shift->name,
                    'start_time' => $employee->shift->start_time,
                    'end_time' => $employee->shift->end_time,
                ] : null,
            ] : null,
        ]);
    }

    /**
     * Update nurse profile (limited fields only)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'designation' => 'sometimes|string|max:255',
            'dob' => 'sometimes|date',
            'gender' => 'sometimes|string|max:50',
            'address' => 'sometimes|string',
            'current_password' => 'required_with:new_password|string',
            'new_password' => 'sometimes|string|min:8|confirmed',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }

        if (isset($validated['current_password']) && isset($validated['new_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->save();

        if ($employee) {
            if (isset($validated['designation'])) {
                $employee->designation = $validated['designation'];
            }
            if (isset($validated['dob'])) {
                $employee->dob = $validated['dob'];
            }
            if (isset($validated['gender'])) {
                $employee->gender = $validated['gender'];
            }
            if (isset($validated['address'])) {
                $employee->address = $validated['address'];
            }
            $employee->save();
        }

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    }

    /**
     * Get options for admission form (doctors, available beds)
     */
    public function getAdmissionOptions()
    {
        $doctors = Doctor::with('user:id,name')->where('is_active', true)->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->user->name ?? 'Unknown Doctor',
                    'specialization' => $doc->specialization,
                ];
            });

        $beds = Bed::where('status', 'available')
            ->with('ward:id,name,type')
            ->get()
            ->map(function ($bed) {
                return [
                    'id' => $bed->id,
                    'name' => $bed->number,
                    'ward' => $bed->ward->name ?? 'Unknown Ward',
                    'type' => $bed->type,
                    'ward_id' => $bed->ward_id,
                ];
            });

        return response()->json([
            'doctors' => $doctors,
            'beds' => $beds,
        ]);
    }

    /**
     * Admit a patient (existing or new)
     */
    public function admitPatient(Request $request)
    {
        $validated = $request->validate([
            'patient_type' => 'required|in:existing,new',
            'patient_id' => 'required_if:patient_type,existing|exists:patients,id',
            'name' => 'required_if:patient_type,new|string|max:255',
            'phone' => 'required_if:patient_type,new|string|max:20',
            'dob' => 'required_if:patient_type,new|date',
            'gender' => 'required_if:patient_type,new|in:Male,Female,Other',
            'emergency_contact' => 'nullable|string',
            'emergency_phone' => 'nullable|string',
            'doctor_id' => 'required|exists:doctors,id',
            'bed_id' => 'required|exists:beds,id',
            'diagnosis' => 'required|string',
            'deposit' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            if ($request->patient_type === 'new') {
                $patient = Patient::create([
                    'uhid' => 'P-' . strtoupper(Str::random(8)),
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'dob' => $validated['dob'],
                    'gender' => $validated['gender'],
                    'guardian_name' => $validated['emergency_contact'] ?? null,
                    'guardian_phone' => $validated['emergency_phone'] ?? null,
                ]);
                $patientId = $patient->id;
            } else {
                $patientId = $validated['patient_id'];
            }

            $bed = Bed::find($validated['bed_id']);
            if ($bed->status !== 'available') {
                throw new \Exception('Selected bed is no longer available.');
            }

            $admission = Admission::create([
                'admission_number' => 'ADM-' . strtoupper(Str::random(8)),
                'patient_id' => $patientId,
                'doctor_id' => $validated['doctor_id'],
                'bed_id' => $validated['bed_id'],
                'admission_date' => now(),
                'status' => 'admitted',
                'diagnosis' => $validated['diagnosis'],
                'emergency_contact_name' => $validated['emergency_contact'] ?? null,
                'emergency_contact_phone' => $validated['emergency_phone'] ?? null,
                'initial_deposit' => $validated['deposit'] ?? 0,
            ]);

            $bed->update(['status' => 'occupied']);

            DB::commit();

            return response()->json([
                'message' => 'Patient admitted successfully',
                'admission_id' => $admission->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Admission failed: ' . $e->getMessage()], 500);
        }
    }
}

