<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\LabResult;
use App\Models\LabResultItem;
use App\Models\SampleCollection;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LisController extends Controller
{
    // --- Sample Management ---

    public function indexSamples(Request $request)
    {
        $query = SampleCollection::with(['visit.patient', 'test', 'specimen']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('barcode')) {
            $query->where('barcode', $request->barcode);
        }

        return response()->json($query->paginate(20));
    }

    public function collectSample(Request $request, $id)
    {
        $sample = SampleCollection::findOrFail($id);

        if ($sample->status !== 'pending') {
            return response()->json(['message' => 'Sample already collected or processed'], 400);
        }

        $validated = $request->validate([
            'collected_at' => 'required|date',
        ]);

        $sample->update([
            'status' => 'collected',
            'collected_at' => $validated['collected_at'],
            'collected_by' => Auth::id() ?? 'System', // Replace with user ID
        ]);

        return response()->json($sample);
    }

    public function receiveSample(Request $request, $id)
    {
        $sample = SampleCollection::findOrFail($id);

        if ($sample->status !== 'collected') {
            return response()->json(['message' => 'Sample must be collected before receiving'], 400);
        }

        $sample->update(['status' => 'received']);

        // Auto-create LabResult entry pending result
        LabResult::firstOrCreate(
            ['sample_collection_id' => $sample->id],
            [
                'visit_id' => $sample->visit_id,
                'bill_item_id' => $sample->bill_item_id,
                'test_id' => $sample->test_id,
                'status' => 'pending',
                'id' => (string) \Illuminate\Support\Str::uuid(),
            ]
        );

        return response()->json($sample);
    }

    // --- Result Management ---

    public function indexResults(Request $request)
    {
        $query = LabResult::with(['visit.patient', 'test', 'sample']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function storeResult(Request $request, $id)
    {
        $result = LabResult::findOrFail($id);

        if ($result->status === 'finalized' || $result->status === 'dispatched') {
            return response()->json(['message' => 'Cannot modify finalized result'], 400);
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.component_name' => 'required|string',
            'items.*.value' => 'required|string',
            'items.*.unit' => 'nullable|string',
            'items.*.reference_range' => 'nullable|string',
            'items.*.is_abnormal' => 'boolean',
            'items.*.remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($result, $validated) {
            $result->items()->delete(); // Replace previous draft
            $result->items()->createMany($validated['items']);
            $result->update([
                'status' => 'entered',
                'technician_id' => Auth::id(),
            ]);
        });

        return response()->json($result->load('items'));
    }

    public function verifyResult($id)
    {
        $result = LabResult::findOrFail($id);

        if ($result->status !== 'entered') {
            return response()->json(['message' => 'Result must be entered before verification'], 400);
        }

        $result->update([
            'status' => 'verified',
            'pathologist_id' => Auth::id(),
        ]);

        return response()->json($result);
    }

    public function finalizeResult($id)
    {
        $result = LabResult::findOrFail($id);

        if ($result->status !== 'verified') {
            return response()->json(['message' => 'Result must be verified before finalization'], 400);
        }

        $result->update([
            'status' => 'finalized',
            'finalized_at' => now(),
        ]);

        return response()->json($result);
    }

    public function getReport($id)
    {
        $result = LabResult::with(['visit.patient', 'test', 'items', 'billItem.bill'])->findOrFail($id);

        // Payment Validation
        $bill = $result->billItem->bill;
        if ($bill->payment_status !== 'paid') {
            // Strict check: Report withheld if not fully paid? 
            // Requirement: "Deliver report (only if bill paid)"
            // We return a restricted view or error.
            return response()->json(['message' => 'Report withheld due to pending payment.', 'due_amount' => $bill->due_amount], 403);
        }

        return response()->json($result);
    }
}
