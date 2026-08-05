<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\BedTransfer;
use App\Models\Discharge;
use App\Models\IpdCharge;
use App\Models\IpdPayment;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class IpdController extends Controller
{
    // --- Bed Management ---
    public function indexBeds(Request $request)
    {
        $query = Bed::with(['ward', 'currentAdmission.patient']);

        if ($request->has('ward_id')) {
            $query->where('ward_id', $request->ward_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    // --- Admission ---
    public function admit(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'bed_id' => 'required|exists:beds,id',
            'diagnosis' => 'nullable|string',
            'initial_deposit' => 'nullable|numeric|min:0',
        ]);

        $bed = Bed::findOrFail($validated['bed_id']);
        if ($bed->status !== 'available') {
            return response()->json(['message' => 'Bed is not available'], 400);
        }

        return DB::transaction(function () use ($validated, $bed) {
            $admission = Admission::create([
                'admission_number' => 'ADM-' . date('Ymd') . '-' . mt_rand(1000, 9999),
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'bed_id' => $validated['bed_id'],
                'admission_date' => now(),
                'status' => 'admitted',
                'diagnosis' => $validated['diagnosis'] ?? null,
                'initial_deposit' => $validated['initial_deposit'] ?? 0,
            ]);

            $bed->update(['status' => 'occupied']);

            if (!empty($validated['initial_deposit']) && $validated['initial_deposit'] > 0) {
                IpdPayment::create([
                    'admission_id' => $admission->id,
                    'amount' => $validated['initial_deposit'],
                    'payment_method' => 'cash', // Default or from request
                    'payment_date' => now(),
                    'notes' => 'Initial Deposit',
                ]);
            }

            return response()->json($admission->load('bed.ward'));
        });
    }

    public function show(string $id)
    {
        return response()->json(Admission::with(['patient', 'doctor', 'bed.ward', 'charges', 'payments', 'vitals'])->findOrFail($id));
    }

    // --- Bed Transfer ---
    public function transferBed(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);
        if ($admission->status !== 'admitted') {
            return response()->json(['message' => 'Patient is not currently admitted'], 400);
        }

        $validated = $request->validate([
            'to_bed_id' => 'required|exists:beds,id',
            'reason' => 'nullable|string',
        ]);

        $newBed = Bed::findOrFail($validated['to_bed_id']);
        if ($newBed->status !== 'available') {
            return response()->json(['message' => 'Target bed is not available'], 400);
        }

        return DB::transaction(function () use ($admission, $newBed, $validated) {
            $oldBed = $admission->bed;

            // Record Transfer
            BedTransfer::create([
                'admission_id' => $admission->id,
                'from_bed_id' => $oldBed->id,
                'to_bed_id' => $newBed->id,
                'transfer_date' => now(),
                'reason' => $validated['reason'] ?? null,
                'transferred_by' => Auth::id() ?? 1, // Fallback for dev
            ]);

            // Update Beds
            $oldBed->update(['status' => 'available']);
            $newBed->update(['status' => 'occupied']);

            // Update Admission
            $admission->update(['bed_id' => $newBed->id]);

            return response()->json($admission->load('bed'));
        });
    }

    // --- Charges & Payments ---
    public function addCharge(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $validated = $request->validate([
            'charge_name' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'service_id' => 'nullable|exists:services,id',
        ]);

        $charge = $admission->charges()->create([
            'charge_name' => $validated['charge_name'],
            'amount' => $validated['amount'],
            'service_id' => $validated['service_id'] ?? null,
            'charge_date' => now(),
        ]);

        return response()->json($charge);
    }

    public function addPayment(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ]);

        $payment = $admission->payments()->create([
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'payment_date' => now(),
        ]);

        return response()->json($payment);
    }

    // --- Discharge ---
    public function discharge(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        if ($admission->status === 'discharged') {
            return response()->json(['message' => 'Patient already discharged'], 400);
        }

        $validated = $request->validate([
            'type' => 'required|in:regular,dama,transfer,death',
            'summary' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($admission, $validated) {
            // 1. Calculate and Add Bed Charges
            $days = max(1, now()->diffInDays($admission->admission_date));
            $bedChargeAmount = $admission->bed->daily_charge * $days;

            // Check if bed charge for today already exists? For simplicity, we just add "Final Settlement Bed Charge"
            // In a real system, a nightly job adds daily charges. Here we assume this covers the gap.
            $admission->charges()->firstOrCreate(
                [
                    'charge_name' => "Bed Charges ({$days} days)",
                    'charge_date' => now()->startOfDay(), // Avoid duplicates for same day if retrying
                ],
                [
                    'amount' => $bedChargeAmount,
                    'charge_date' => now(),
                    'note' => 'Auto-generated on discharge'
                ]
            );

            // 2. Refresh total charges and payments
            $totalCharges = $admission->charges()->sum('amount');
            $totalPaid = $admission->payments()->sum('amount');
            $due = $totalCharges - $totalPaid;

            if ($due > 0) {
                // Throw exception to trigger rollback
                throw new \Exception("Cannot discharge. Outstanding dues: {$due}");
            }

            // 3. Process Discharge
            Discharge::create([
                'admission_id' => $admission->id,
                'discharge_date' => now(),
                'type' => $validated['type'],
                'summary' => $validated['summary'] ?? null,
                'finalized_by' => Auth::id() ?? 1,
            ]);

            $admission->update([
                'status' => $validated['type'] === 'death' ? 'death' : 'discharged',
                'discharge_date' => now(),
            ]);

            $admission->bed->update(['status' => 'available']);

            return response()->json(['message' => 'Discharged successfully']);
        });
    }
}
