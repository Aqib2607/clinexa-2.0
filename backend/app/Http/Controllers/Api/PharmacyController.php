<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PharmacyItem;
use App\Models\PharmacySale;
use App\Models\PharmacyStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyController extends Controller
{
    // Items Management
    public function indexItems(Request $request)
    {
        $query = PharmacyItem::with(['stocks' => function ($q) {
            $q->where('quantity', '>', 0)->orderBy('expiry_date');
        }]);

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('generic_name', 'like', "%{$request->search}%");
        }

        return response()->json($query->paginate(20));
    }

    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'generic_name' => 'nullable|string',
            'brand_name' => 'nullable|string',
            'unit' => 'required|string',
            'reorder_level' => 'integer',
        ]);

        $item = PharmacyItem::create($validated);
        return response()->json($item, 201);
    }

    // Stock Management
    public function addStock(Request $request)
    {
        $validated = $request->validate([
            'pharmacy_item_id' => 'required|exists:pharmacy_items,id',
            'batch_number' => 'required|string',
            'expiry_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
        ]);

        $stock = PharmacyStock::create($validated);
        return response()->json($stock, 201);
    }

    // POS / Sales
    public function storeSale(Request $request)
    {
        $validated = $request->validate([
            'visit_id' => 'nullable|exists:visits,id',
            'patient_id' => 'nullable|exists:patients,id',
            'customer_name' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.pharmacy_item_id' => 'required|exists:pharmacy_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'paid_amount' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $saleItems = [];

            foreach ($validated['items'] as $itemRequest) {
                $requestedQty = $itemRequest['quantity'];
                $itemId = $itemRequest['pharmacy_item_id'];

                // FEFO: Find stocks for this item, ordered by expiry
                $stocks = PharmacyStock::where('pharmacy_item_id', $itemId)
                    ->where('quantity', '>', 0)
                    ->orderBy('expiry_date')
                    ->lockForUpdate()
                    ->get();

                $remainingQty = $requestedQty;

                foreach ($stocks as $stock) {
                    if ($remainingQty <= 0) break;

                    $take = min($remainingQty, $stock->quantity);
                    $stock->quantity -= $take;
                    $stock->save();

                    $saleItems[] = [
                        'pharmacy_item_id' => $itemId,
                        'pharmacy_stock_id' => $stock->id,
                        'quantity' => $take,
                        'unit_price' => $stock->sale_price,
                        'total_price' => $take * $stock->sale_price,
                    ];

                    $totalAmount += ($take * $stock->sale_price);
                    $remainingQty -= $take;
                }

                if ($remainingQty > 0) {
                    throw new \Exception("Insufficient stock for item ID: $itemId");
                }
            }

            $sale = PharmacySale::create([
                'invoice_number' => 'PH-' . strtoupper(Str::random(8)),
                'visit_id' => $validated['visit_id'] ?? null,
                'patient_id' => $validated['patient_id'] ?? null,
                'customer_name' => $validated['customer_name'] ?? null,
                'total_amount' => $totalAmount,
                'paid_amount' => $validated['paid_amount'],
                'payment_method' => $validated['payment_method'],
                'sale_date' => now(),
            ]);

            $sale->items()->createMany($saleItems);

            DB::commit();
            return response()->json($sale->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
