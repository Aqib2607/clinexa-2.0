<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Prescription::with(['doctor', 'patient', 'items']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->has('appointment_id')) {
            $query->where('appointment_id', $request->appointment_id);
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
            'vitals' => 'nullable|array',
            'notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'advice' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.medicine_name' => 'required|string',
            'items.*.dosage' => 'nullable|string',
            'items.*.duration' => 'nullable|string',
            'items.*.instruction' => 'nullable|string',
            'items.*.type' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $prescription = Prescription::create([
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'appointment_id' => $validated['appointment_id'] ?? null,
                'vitals' => $validated['vitals'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'diagnosis' => $validated['diagnosis'] ?? null,
                'advice' => $validated['advice'] ?? null,
            ]);

            if (!empty($validated['items'])) {
                $prescription->items()->createMany($validated['items']);
            }

            DB::commit();

            // Mark appointment as completed if linked
            if ($prescription->appointment_id) {
                $appointment = \App\Models\Appointment::find($prescription->appointment_id);
                if ($appointment && $appointment->status !== 'completed') {
                    $appointment->update(['status' => 'completed']);
                }
            }

            return response()->json($prescription->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create prescription: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $prescription = Prescription::with(['doctor', 'patient', 'items', 'appointment'])->findOrFail($id);
        return response()->json($prescription);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // For simplicity in Phase 1, strictly updating fields. 
        // Logic for updating items is complex (sync vs delete/recreate), leaving for later refinement.
        $prescription = Prescription::findOrFail($id);

        $validated = $request->validate([
            'vitals' => 'nullable|array',
            'notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'advice' => 'nullable|string',
        ]);

        $prescription->update($validated);
        return response()->json($prescription);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $prescription = Prescription::findOrFail($id);
        $prescription->delete();
        return response()->json(['message' => 'Prescription deleted successfully']);
    }
}
