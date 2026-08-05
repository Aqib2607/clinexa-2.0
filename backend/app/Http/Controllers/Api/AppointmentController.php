<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor.department', 'slot']);

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('date')) {
            $query->where('appointment_date', $request->date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'nullable|exists:patients,id',
            'name' => 'required_without:patient_id|string',
            'phone' => 'required_without:patient_id|string',
            'email' => 'nullable|email',
            'doctor_id' => 'required|exists:doctors,id',
            'slot_id' => 'nullable|exists:appointment_slots,id',
            'appointment_date' => 'required|date',
            'symptoms' => 'nullable|string',
        ]);

        // Handle Guest/New Patient
        if (empty($validated['patient_id'])) {
            $patient = \App\Models\Patient::firstOrCreate(
                ['phone' => $validated['phone']],
                [
                    'name' => $validated['name'],
                    'email' => $validated['email'] ?? null,
                    'uhid' => 'P-' . strtoupper(Str::random(8)), // Simple auto-generate
                    // Minimal required fields default
                    'dob' => now()->subYears(18)->format('Y-m-d'), // Placeholder/Default
                    'gender' => 'Other', // Placeholder
                    'address' => 'Provided via Online Booking'
                ]
            );
            $validated['patient_id'] = $patient->id;
        }

        // If slot is provided, check if available
        if (!empty($validated['slot_id'])) {
            $slot = AppointmentSlot::findOrFail($validated['slot_id']);
            if ($slot->status !== 'available') {
                return response()->json(['message' => 'Slot is not available'], 400);
            }
            // Mark slot as booked
            $slot->update(['status' => 'booked']);
        }

        $validated['appointment_number'] = 'APT-' . strtoupper(Str::random(8));
        $validated['status'] = 'pending';

        $appointment = Appointment::create($validated);
        return response()->json($appointment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $appointment = Appointment::with(['patient', 'doctor', 'slot'])->findOrFail($id);
        return response()->json($appointment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'in:pending,confirmed,completed,cancelled,no_show',
            'payment_status' => 'in:pending,paid,partially_paid,refunded',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
        ]);

        // If cancelling, free up the slot
        if (isset($validated['status']) && $validated['status'] === 'cancelled' && $appointment->status !== 'cancelled') {
            if ($appointment->slot_id) {
                AppointmentSlot::where('id', $appointment->slot_id)->update(['status' => 'available']);
            }
        }

        $appointment->update($validated);
        return response()->json($appointment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $appointment = Appointment::findOrFail($id);

        // Free slot if exists
        if ($appointment->slot_id) {
            AppointmentSlot::where('id', $appointment->slot_id)->update(['status' => 'available']);
        }

        $appointment->delete();
        return response()->json(['message' => 'Appointment deleted successfully']);
    }
}
