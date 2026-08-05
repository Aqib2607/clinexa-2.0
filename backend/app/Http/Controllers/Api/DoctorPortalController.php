<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DoctorAppointmentRequest;
use App\Http\Requests\DoctorPrescriptionRequest;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\PatientNote;
use App\Models\Patient;
use App\Models\DoctorSchedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DoctorPortalController extends Controller
{
    /**
     * Get all appointments for the authenticated doctor
     */
    public function getAppointments(Request $request)
    {
        $user = Auth::user();
        \Illuminate\Support\Facades\Log::info('DoctorPortalController: getAppointments', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'has_doctor_relation' => $user->doctor ? 'yes' : 'no'
        ]);

        $doctor = $user->doctor;

        if (!$doctor) {
            \Illuminate\Support\Facades\Log::warning('DoctorPortalController: Doctor profile not found for user ' . $user->id);
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $query = Appointment::where('doctor_id', $doctor->id)
            ->with(['patient']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by patient
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('appointment_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('appointment_date', '<=', $request->date_to);
        }

        return response()->json($query->orderBy('appointment_date', 'desc')->paginate(15));
    }

    /**
     * Create a new appointment
     */
    public function createAppointment(DoctorAppointmentRequest $request)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        // Generate unique appointment number
        $appointmentNumber = 'APT' . date('Ymd') . str_pad(Appointment::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        $appointment = Appointment::create([
            'appointment_number' => $appointmentNumber,
            'doctor_id' => $doctor->id,
            'patient_id' => $request->patient_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'duration' => $request->duration ?? 30,
            'reason' => $request->reason,
            'notes' => $request->notes,
            'status' => $request->status ?? 'pending',
        ]);

        return response()->json($appointment->load('patient'), 201);
    }

    /**
     * Update an appointment
     */
    public function updateAppointment(DoctorAppointmentRequest $request, $id)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }
        $appointment = Appointment::where('doctor_id', $doctor->id)->findOrFail($id);

        $appointment->update($request->validated());

        return response()->json($appointment->load('patient'));
    }

    /**
     * Cancel an appointment
     */
    public function cancelAppointment($id)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }
        $appointment = Appointment::where('doctor_id', $doctor->id)->findOrFail($id);

        $appointment->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Appointment cancelled successfully']);
    }

    /**
     * Get all prescriptions created by the authenticated doctor
     */
    public function getPrescriptions(Request $request)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $query = Prescription::where('doctor_id', $doctor->id)
            ->with(['patient']);

        // Filter by patient
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(15));
    }

    /**
     * Create a new prescription
     */
    public function createPrescription(DoctorPrescriptionRequest $request)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $prescription = Prescription::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $request->patient_id,
            'diagnosis' => $request->diagnosis,
            'medications' => json_encode($request->medications),
            'notes' => $request->notes,
            'follow_up_date' => $request->follow_up_date,
        ]);

        return response()->json($prescription->load('patient'), 201);
    }

    /**
     * Update a prescription
     */
    public function updatePrescription(DoctorPrescriptionRequest $request, $id)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }
        $prescription = Prescription::where('doctor_id', $doctor->id)->findOrFail($id);

        $prescription->update([
            'diagnosis' => $request->diagnosis,
            'medications' => json_encode($request->medications),
            'notes' => $request->notes,
            'follow_up_date' => $request->follow_up_date,
        ]);

        return response()->json($prescription->load('patient'));
    }

    /**
     * Delete a prescription (soft delete)
     */
    public function deletePrescription($id)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }
        $prescription = Prescription::where('doctor_id', $doctor->id)->findOrFail($id);

        $prescription->delete();

        return response()->json(['message' => 'Prescription deleted successfully']);
    }

    /**
     * Get patients assigned to the authenticated doctor
     */
    public function getPatients(Request $request)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        // Get patients who have appointments with this doctor
        $query = Patient::whereHas('appointments', function ($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        });

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Get patient notes
     */
    public function getPatientNotes($patientId)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $notes = PatientNote::where('doctor_id', $doctor->id)
            ->where('patient_id', $patientId)
            ->orderBy('visit_date', 'desc')
            ->get();

        return response()->json($notes);
    }

    /**
     * Create a patient note
     */
    public function createPatientNote(Request $request, $patientId)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $validated = $request->validate([
            'visit_date' => 'required|date',
            'chief_complaint' => 'nullable|string',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'notes' => 'nullable|string',
            'follow_up_instructions' => 'nullable|string',
            'next_visit_date' => 'nullable|date',
        ]);

        $note = PatientNote::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patientId,
            ...$validated,
        ]);

        return response()->json($note, 201);
    }

    /**
     * Update a patient note
     */
    public function updatePatientNote(Request $request, $patientId, $noteId)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $note = PatientNote::where('doctor_id', $doctor->id)
            ->where('patient_id', $patientId)
            ->findOrFail($noteId);

        $validated = $request->validate([
            'visit_date' => 'date',
            'chief_complaint' => 'nullable|string',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'notes' => 'nullable|string',
            'follow_up_instructions' => 'nullable|string',
            'next_visit_date' => 'nullable|date',
        ]);

        $note->update($validated);

        return response()->json($note);
    }

    /**
     * Get doctor's schedule
     */
    public function getSchedule()
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $schedule = DoctorSchedule::where('doctor_id', $doctor->id)
            ->orderByRaw("FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
            ->get();

        return response()->json($schedule);
    }

    /**
     * Create or update schedule
     */
    public function updateSchedule(Request $request)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $validated = $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
            'schedules.*.is_available' => 'boolean',
            'schedules.*.slot_duration' => 'integer|min:15|max:120',
            'schedules.*.notes' => 'nullable|string',
        ]);

        // Delete existing schedules
        DoctorSchedule::where('doctor_id', $doctor->id)->delete();

        // Create new schedules
        $schedules = [];
        foreach ($validated['schedules'] as $scheduleData) {
            $schedules[] = DoctorSchedule::create([
                'doctor_id' => $doctor->id,
                ...$scheduleData,
            ]);
        }

        return response()->json($schedules, 201);
    }

    /**
     * Block a time slot
     */
    public function blockTimeSlot(Request $request)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $validated = $request->validate([
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'notes' => 'nullable|string',
        ]);

        $schedule = DoctorSchedule::create([
            'doctor_id' => $doctor->id,
            'is_available' => false,
            ...$validated,
        ]);

        return response()->json($schedule, 201);
    }

    /**
     * Delete a schedule slot
     */
    public function deleteScheduleSlot($id)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }
        $schedule = DoctorSchedule::where('doctor_id', $doctor->id)->findOrFail($id);
        $schedule->delete();

        return response()->json(['message' => 'Schedule slot deleted successfully']);
    }

    /**
     * Delete an appointment slot (only if it belongs to the doctor and is available)
     */
    public function deleteAppointmentSlot($id)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $slot = \App\Models\AppointmentSlot::where('doctor_id', $doctor->id)
                                          ->where('id', $id)
                                          ->where('status', 'available')
                                          ->first();

        if (!$slot) {
            return response()->json(['message' => 'Slot not found or cannot be deleted'], 404);
        }

        $slot->delete();

        return response()->json(['message' => 'Appointment slot deleted successfully']);
    }

    /**
     * Replace all appointment slots for the doctor based on new schedule configuration
     */
    public function replaceAppointmentSlots(Request $request)
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 403);
        }

        $validated = $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i',
            'schedules.*.is_available' => 'required|boolean',
            'schedules.*.slot_duration' => 'required|integer|min:15|max:120',
            'week_start' => 'required|date',
            'week_end' => 'required|date|after_or_equal:week_start',
        ]);

        $weekStart = \Carbon\Carbon::parse($validated['week_start'])->startOfDay();
        $weekEnd = \Carbon\Carbon::parse($validated['week_end'])->endOfDay();

        // Log the received schedules for debugging
        \Illuminate\Support\Facades\Log::info('Received schedules:', $validated['schedules']);

        // Delete all future appointment slots for this doctor (only those not yet booked)
        \App\Models\AppointmentSlot::where('doctor_id', $doctor->id)
            ->where('date', '>=', now()->format('Y-m-d'))
            ->where('status', 'available')
            ->delete();

        // Also update schedule rules
        DoctorSchedule::where('doctor_id', $doctor->id)->delete();

        $createdSchedules = [];
        $totalSlotsGenerated = 0;

        // Create new schedules and generate slots
        foreach ($validated['schedules'] as $scheduleData) {
            \Illuminate\Support\Facades\Log::info("Processing schedule for {$scheduleData['day_of_week']}: is_available = " . ($scheduleData['is_available'] ? 'true' : 'false'));
            // Save schedule rule
            $schedule = DoctorSchedule::create([
                'doctor_id' => $doctor->id,
                'day_of_week' => $scheduleData['day_of_week'],
                'start_time' => $scheduleData['start_time'],
                'end_time' => $scheduleData['end_time'],
                'is_available' => $scheduleData['is_available'],
                'slot_duration' => $scheduleData['slot_duration'],
            ]);
            $createdSchedules[] = $schedule;

            // Generate slots if day is available
            if ($scheduleData['is_available']) {
                // Use the provided week range for slot generation
                $currentDate = $weekStart->copy();
                
                // Generate slots only for dates within the specified week
                while ($currentDate->lte($weekEnd)) {
                    // Check if this date matches the day of week
                    if ($currentDate->format('l') === $scheduleData['day_of_week']) {
                        $timeStart = explode(':', $scheduleData['start_time']);
                        $timeEnd = explode(':', $scheduleData['end_time']);
                        $currentSlotStart = $currentDate->copy()->setTime((int)$timeStart[0], (int)$timeStart[1], 0);
                        $dayEndTime = $currentDate->copy()->setTime((int)$timeEnd[0], (int)$timeEnd[1], 0);
                        $duration = (int)$scheduleData['slot_duration'];

                        while ($currentSlotStart->lt($dayEndTime)) {
                            $currentSlotEnd = $currentSlotStart->copy()->addMinutes($duration);

                            if ($currentSlotEnd->gt($dayEndTime)) {
                                break;
                            }

                            // Create slot
                            \App\Models\AppointmentSlot::create([
                                'doctor_id' => $doctor->id,
                                'date' => $currentDate->format('Y-m-d'),
                                'day_of_week' => $scheduleData['day_of_week'],
                                'start_time' => $currentSlotStart->format('H:i:s'),
                                'end_time' => $currentSlotEnd->format('H:i:s'),
                                'capacity' => 1,
                                'status' => 'available',
                            ]);
                            $totalSlotsGenerated++;

                            $currentSlotStart->addMinutes($duration);
                        }
                    }
                    
                    $currentDate->addDay();
                }
            }
        }

        \Illuminate\Support\Facades\Log::info("Total slots generated: {$totalSlotsGenerated} for week {$validated['week_start']} to {$validated['week_end']}");
        
        return response()->json([
            'message' => 'Schedule updated successfully for the specified week',
            'slots_generated' => $totalSlotsGenerated,
            'schedules' => $createdSchedules,
            'week_start' => $validated['week_start'],
            'week_end' => $validated['week_end'],
        ], 201);
    }

    public function getProfile()
    {
        $user = Auth::user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $doctor->load('department');

        return response()->json([
            'user' => $user,
            'doctor' => $doctor,
        ]);
    }

    /**
     * Update doctor profile
     */
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'sometimes|string|max:255',
            'license_number' => 'sometimes|string|max:255',
            'qualification' => 'sometimes|string|max:255',
            'consultation_fee' => 'sometimes|numeric|min:0',
            'experience_years' => 'sometimes|integer|min:0',
            'bio' => 'nullable|string',
            'current_password' => 'required_with:new_password|string',
            'new_password' => 'sometimes|string|min:8|confirmed',
        ]);

        // Update User
        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }

        // Password change
        if (isset($validated['current_password']) && isset($validated['new_password'])) {
            if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['new_password']);
        }

        $user->save();

        // Update Doctor
        if (isset($validated['specialization'])) {
            $doctor->specialization = $validated['specialization'];
        }
        if (isset($validated['license_number'])) {
            $doctor->license_number = $validated['license_number'];
        }
        if (isset($validated['qualification'])) {
            $doctor->qualification = $validated['qualification'];
        }
        if (isset($validated['consultation_fee'])) {
            $doctor->consultation_fee = $validated['consultation_fee'];
        }
        if (isset($validated['experience_years'])) {
            $doctor->experience_years = $validated['experience_years'];
        }
        if (isset($validated['bio'])) {
            $doctor->bio = $validated['bio'];
        }

        $doctor->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
            'doctor' => $doctor,
        ]);
    }
}
