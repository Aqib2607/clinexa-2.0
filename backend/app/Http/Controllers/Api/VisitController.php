<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VisitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Visit::with(['patient', 'doctor', 'appointment']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->has('date')) {
            $query->whereDate('visit_date', $request->date);
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
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'type' => 'required|string|in:NEW,FOLLOW_UP,EMERGENCY',
            'visit_date' => 'required|date',
        ]);

        $visit = Visit::create($validated);

        // If linked to appointment, update appointment status?
        if ($visit->appointment_id) {
            $appointment = Appointment::find($visit->appointment_id);
            if ($appointment && $appointment->status === 'pending') {
                $appointment->update(['status' => 'confirmed']);
            }
        }

        return response()->json($visit, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $visit = Visit::with(['patient', 'doctor', 'appointment', 'bill.items', 'bill.payments'])->findOrFail($id);
        return response()->json($visit);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $visit = Visit::findOrFail($id);
        $visit->update($request->only(['status', 'type', 'visit_date']));
        return response()->json($visit);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $visit = Visit::findOrFail($id);
        $visit->delete();
        return response()->json(['message' => 'Visit deleted successfully']);
    }
}
