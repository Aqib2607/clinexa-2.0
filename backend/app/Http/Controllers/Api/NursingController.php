<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\NursingNote;
use App\Models\VitalSign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NursingController extends Controller
{
    public function indexWorklist(Request $request)
    {
        // Get currently admitted patients
        $query = Admission::with(['patient', 'bed.ward', 'doctor'])
            ->where('status', 'admitted');

        if ($request->has('ward_id')) {
            $query->whereHas('bed', function ($q) use ($request) {
                $q->where('ward_id', $request->ward_id);
            });
        }

        return response()->json($query->paginate(20));
    }

    public function storeVitals(Request $request, $admissionId)
    {
        $validated = $request->validate([
            'bp_systolic' => 'nullable|integer',
            'bp_diastolic' => 'nullable|integer',
            'pulse' => 'nullable|integer',
            'temperature' => 'nullable|numeric',
            'spo2' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
        ]);

        $vitals = VitalSign::create([
            'admission_id' => $admissionId,
            'recorded_at' => now(),
            'recorded_by' => Auth::id() ?? 1,
            ...$validated
        ]);

        return response()->json($vitals);
    }

    public function storeNote(Request $request, $admissionId)
    {
        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        $note = NursingNote::create([
            'admission_id' => $admissionId,
            'noted_at' => now(),
            'noted_by' => Auth::id() ?? 1,
            'note' => $validated['note'],
        ]);

        return response()->json($note);
    }
}
