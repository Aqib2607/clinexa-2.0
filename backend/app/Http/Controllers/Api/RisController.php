<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RadiologyResult;
use App\Models\RadiologyStudy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RisController extends Controller
{
    public function indexStudies(Request $request)
    {
        $query = RadiologyStudy::with(['visit.patient', 'billItem']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function storeResult(Request $request, $id) // ID is Study ID
    {
        $study = RadiologyStudy::findOrFail($id);

        $validated = $request->validate([
            'findings' => 'required|string',
            'impression' => 'nullable|string',
            'radiologist_id' => 'nullable|exists:users,id',
            'radiology_template_id' => 'nullable|exists:radiology_templates,id',
        ]);

        $result = RadiologyResult::updateOrCreate(
            ['radiology_study_id' => $study->id],
            [
                'findings' => $validated['findings'],
                'impression' => $validated['impression'] ?? null,
                'radiologist_id' => $validated['radiologist_id'] ?? Auth::id(),
                'radiology_template_id' => $validated['radiology_template_id'] ?? null,
            ]
        );

        $study->update(['status' => 'reported']);

        return response()->json($result);
    }

    public function finalizeResult($id) // ID is Result ID
    {
        $result = RadiologyResult::findOrFail($id);

        $result->update([
            'finalized_at' => now(),
        ]);

        $result->study->update(['status' => 'verified']);

        return response()->json($result);
    }

    public function getReport($id)
    {
        $result = RadiologyResult::with(['study.visit.patient', 'study.billItem.bill'])->findOrFail($id);

        // Payment Validation
        $bill = $result->study->billItem->bill;
        if ($bill->payment_status !== 'paid') {
            return response()->json(['message' => 'Report withheld due to pending payment.', 'due_amount' => $bill->due_amount], 403);
        }

        return response()->json($result);
    }
}
