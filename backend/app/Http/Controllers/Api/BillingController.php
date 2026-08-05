<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = Bill::with(['patient', 'visit']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visit_id' => 'required|exists:visits,id',
            'patient_id' => 'required|exists:patients,id',
        ]);

        // Check if bill already exists for visit
        $existing = Bill::where('visit_id', $validated['visit_id'])->first();
        if ($existing) {
            return response()->json($existing, 200);
        }

        $bill = Bill::create([
            'visit_id' => $validated['visit_id'],
            'patient_id' => $validated['patient_id'],
            'bill_number' => 'INV-' . strtoupper(Str::random(8)),
            'status' => 'draft',
        ]);

        return response()->json($bill, 201);
    }

    public function show($id)
    {
        return response()->json(Bill::with(['items', 'payments', 'patient', 'visit'])->findOrFail($id));
    }

    public function addItem(Request $request, $id)
    {
        $bill = Bill::findOrFail($id);

        if ($bill->status !== 'draft') {
            return response()->json(['message' => 'Cannot modify finalized bill'], 400);
        }

        $validated = $request->validate([
            'service_id' => 'nullable|exists:services,id',
            'item_name' => 'required|string',
            'unit_price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
        ]);

        $item = $bill->items()->create([
            'service_id' => $validated['service_id'],
            'item_name' => $validated['item_name'],
            'unit_price' => $validated['unit_price'],
            'quantity' => $validated['quantity'],
            'total_price' => $validated['unit_price'] * $validated['quantity'],
        ]);

        $this->updateBillTotals($bill);

        return response()->json($item, 201);
    }

    public function addPayment(Request $request, $id)
    {
        $bill = Bill::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'transaction_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validated['amount'] > $bill->due_amount) {
            return response()->json(['message' => 'Payment amount exceeds due amount'], 400);
        }

        $payment = $bill->payments()->create([
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $validated['transaction_reference'] ?? null,
            'payment_date' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        $bill->paid_amount += $validated['amount'];
        $bill->due_amount -= $validated['amount'];

        if ($bill->due_amount <= 0) {
            $bill->payment_status = 'paid';
        } elseif ($bill->paid_amount > 0) {
            $bill->payment_status = 'partial';
        }

        $bill->save();

        return response()->json($payment, 201);
    }

    public function finalize($id)
    {
        $bill = Bill::with('items.service.specimen')->findOrFail($id); // Eager load service info

        if ($bill->status === 'finalized') {
            return response()->json(['message' => 'Bill already finalized'], 400);
        }

        DB::transaction(function () use ($bill) {
            $bill->status = 'finalized';
            $bill->save();

            // Generate Orders based on Service Type
            foreach ($bill->items as $item) {
                if ($item->service->type === 'LAB') {
                    // Create Sample Collection Request
                    \App\Models\SampleCollection::create([
                        'visit_id' => $bill->visit_id,
                        'bill_item_id' => $item->id,
                        // Find linked test if possible, or just link service
                        'test_id' => \App\Models\Test::where('code', $item->service->code)->value('id'),
                        'specimen_sample_id' => $item->service->specimen_sample_id ?? null, // Assuming service links to specimen if added to model
                        'barcode' => 'LAB-' . mt_rand(100000, 999999),
                        'status' => 'pending',
                    ]);
                } elseif ($item->service->type === 'RADIOLOGY') {
                    // Create Radiology Study
                    \App\Models\RadiologyStudy::create([
                        'visit_id' => $bill->visit_id,
                        'bill_item_id' => $item->id,
                        'study_name' => $item->item_name,
                        'status' => 'ordered',
                    ]);
                }
            }
        });

        return response()->json($bill);
    }

    private function updateBillTotals(Bill $bill)
    {
        $total = $bill->items()->sum('total_price');
        $bill->total_amount = $total;
        $bill->due_amount = $total - $bill->paid_amount - $bill->discount_amount;
        $bill->save();
    }
}
