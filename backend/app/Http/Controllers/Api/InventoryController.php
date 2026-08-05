<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ItemBatch;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\StockTransaction;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    // --- Master Data ---
    public function getStores()
    {
        return response()->json(Store::where('is_active', true)->get());
    }

    public function getStock(Request $request)
    {
        $query = ItemBatch::with(['item', 'store'])
            ->select('item_id', 'store_id', DB::raw('SUM(quantity) as total_quantity'))
            ->where('quantity', '>', 0)
            ->groupBy('item_id', 'store_id');

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        return response()->json($query->paginate(20));
    }

    public function createSupplier(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);
        return response()->json(\App\Models\Supplier::create($validated));
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'parent_id' => 'nullable|exists:item_categories,id',
        ]);
        return response()->json(\App\Models\ItemCategory::create($validated));
    }

    public function createItem(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:items,code',
            'type' => 'required|string', // medicine, consumable
            'unit' => 'required|string',
            'category_id' => 'nullable|exists:item_categories,id',
        ]);

        return response()->json(Item::create($validated));
    }

    // --- Stock Operations ---
    public function receiveStock(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'item_id' => 'required|exists:items,id',
            'batch_no' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'required|numeric',
            'sale_price' => 'required|numeric',
            'expiry_date' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($validated) {
            // Create or Update Batch
            $batch = ItemBatch::firstOrCreate(
                [
                    'item_id' => $validated['item_id'],
                    'store_id' => $validated['store_id'], // Batches are store-specific essentially
                    'batch_no' => $validated['batch_no']
                ],
                [
                    'quantity' => 0,
                    'expiry_date' => $validated['expiry_date'],
                    'purchase_price' => $validated['purchase_price'],
                    'sale_price' => $validated['sale_price'],
                ]
            );

            // Update Stock
            $batch->increment('quantity', $validated['quantity']);

            // Log Transaction
            StockTransaction::create([
                'item_batch_id' => $batch->id,
                'type' => 'in',
                'quantity' => $validated['quantity'],
                'reference_type' => 'GRN', // Goods Received Note
                'transaction_date' => now(),
                'performed_by' => Auth::id() ?? 1,
                'notes' => 'Stock Received'
            ]);

            return response()->json($batch);
        });
    }

    // --- Requisitions ---
    public function createRequisition(Request $request)
    {
        $validated = $request->validate([
            'from_store_id' => 'required|exists:stores,id', // Asking store
            'to_store_id' => 'required|exists:stores,id',   // Issuing store
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $req = Requisition::create([
                'requisition_no' => 'REQ-' . time(),
                'from_store_id' => $validated['from_store_id'],
                'to_store_id' => $validated['to_store_id'],
                'requested_by' => Auth::id() ?? 1,
                'requested_at' => now(),
            ]);

            foreach ($validated['items'] as $item) {
                RequisitionItem::create([
                    'requisition_id' => $req->id,
                    'item_id' => $item['item_id'],
                    'requested_quantity' => $item['quantity'],
                ]);
            }

            return response()->json($req->load('items'));
        });
    }

    public function fulfillRequisition(Request $request, $id)
    {
        // Simple Fulfillment Logic: Deduct from 'to_store' and Add to 'from_store'
        // In real world, this is a 2-step process (Issue -> Receive).
        // Simplified here: Immediate Transfer.

        $req = Requisition::with('items')->findOrFail($id);
        if ($req->status !== 'pending') return response()->json(['message' => 'Invalid status'], 400);

        return DB::transaction(function () use ($req) {
            foreach ($req->items as $reqItem) {
                // FIFO Logic to find batches in Issuing Store
                $batches = ItemBatch::where('store_id', $req->to_store_id)
                    ->where('item_id', $reqItem->item_id)
                    ->where('quantity', '>', 0)
                    ->orderBy('expiry_date', 'asc')
                    ->get();

                $qtyNeeded = $reqItem->requested_quantity;

                foreach ($batches as $batch) {
                    if ($qtyNeeded <= 0) break;

                    $deduct = min($batch->quantity, $qtyNeeded);

                    // Deduct from Source
                    $batch->decrement('quantity', $deduct);
                    StockTransaction::create([
                        'item_batch_id' => $batch->id,
                        'type' => 'out',
                        'quantity' => $deduct,
                        'reference_type' => 'Requisition',
                        'reference_id' => $req->id,
                        'transaction_date' => now(),
                        'performed_by' => Auth::id() ?? 1
                    ]);

                    // Add to Destination
                    // Create/Update batch in destination store
                    $destBatch = ItemBatch::firstOrCreate(
                        ['item_id' => $batch->item_id, 'store_id' => $req->from_store_id, 'batch_no' => $batch->batch_no],
                        ['expiry_date' => $batch->expiry_date, 'purchase_price' => $batch->purchase_price, 'sale_price' => $batch->sale_price, 'quantity' => 0]
                    );
                    $destBatch->increment('quantity', $deduct);

                    StockTransaction::create([
                        'item_batch_id' => $destBatch->id,
                        'type' => 'in',
                        'quantity' => $deduct,
                        'reference_type' => 'Requisition',
                        'reference_id' => $req->id,
                        'transaction_date' => now(),
                        'performed_by' => Auth::id() ?? 1
                    ]);

                    $qtyNeeded -= $deduct;
                }

                $reqItem->update(['issued_quantity' => $reqItem->requested_quantity - $qtyNeeded]);
            }

            $req->update(['status' => 'issued', 'approved_by' => Auth::id() ?? 1, 'approved_at' => now()]);

            return response()->json($req);
        });
    }

    // --- IPD Pharmacy ---
    public function issueToAdmission(Request $request)
    {
        $validated = $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'store_id' => 'required|exists:stores,id',
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $issues = [];

            foreach ($validated['items'] as $itemReq) {
                // FIFO Batch Selection
                $batches = ItemBatch::where('store_id', $validated['store_id'])
                    ->where('item_id', $itemReq['item_id'])
                    ->where('quantity', '>', 0)
                    ->orderBy('expiry_date', 'asc')
                    ->get();

                $qtyNeeded = $itemReq['quantity'];

                foreach ($batches as $batch) {
                    if ($qtyNeeded <= 0) break;

                    $deduct = min($batch->quantity, $qtyNeeded);
                    $batch->decrement('quantity', $deduct);

                    // Create Issue Record
                    $issue = \App\Models\IpdPharmacyIssue::create([
                        'admission_id' => $validated['admission_id'],
                        'item_batch_id' => $batch->id,
                        'quantity' => $deduct,
                        'issued_at' => now(),
                        'issued_by' => Auth::id() ?? 1
                    ]);
                    $issues[] = $issue;

                    // Log Stock Transaction
                    StockTransaction::create([
                        'item_batch_id' => $batch->id,
                        'type' => 'out',
                        'quantity' => $deduct,
                        'reference_type' => 'IPD-Issue',
                        'reference_id' => $issue->id,
                        'transaction_date' => now(),
                        'performed_by' => Auth::id() ?? 1,
                        'notes' => 'Issued to Admission ' . $validated['admission_id']
                    ]);

                    // Create Charge on Admission (Financial Integration)
                    // Create Charge on Admission (Financial Integration)
                    \App\Models\IpdCharge::create([
                        'admission_id' => $validated['admission_id'],
                        'service_id' => null, // Pharmacy items don't map to service_id directly in this schema
                        'charge_name' => 'Pharmacy: ' . $batch->item->name,
                        'amount' => $batch->sale_price * $deduct,
                        'charge_date' => now(),
                        'note' => 'Pharmacy Issue' // Schema has 'note', not 'notes'
                    ]);

                    $qtyNeeded -= $deduct;
                }

                if ($qtyNeeded > 0) {
                    throw new \Exception("Insufficient stock for item ID: " . $itemReq['item_id']);
                }
            }

            return response()->json(['message' => 'Items issued', 'issues' => $issues]);
        });
    }
}
