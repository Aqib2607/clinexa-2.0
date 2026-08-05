<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CafeteriaItem;
use App\Models\CafeteriaSale;
use App\Models\CafeteriaSaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CafeteriaController extends Controller
{
    public function getItems()
    {
        return response()->json(CafeteriaItem::where('is_available', true)->get());
    }

    public function storeSale(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,card,employee_credit',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:cafeteria_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $saleItems = [];

            foreach ($validated['items'] as $itemData) {
                $item = CafeteriaItem::findOrFail($itemData['item_id']);
                $lineTotal = $item->price * $itemData['quantity'];
                $totalAmount += $lineTotal;

                $saleItems[] = [
                    'item_id' => $item->id,
                    'quantity' => $itemData['quantity'],
                    'price' => $item->price,
                    'total' => $lineTotal
                ];
            }

            $sale = CafeteriaSale::create([
                'bill_no' => 'CAF-' . time(),
                'sale_date' => now(),
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'created_by' => Auth::id() ?? 1,
            ]);

            foreach ($saleItems as $saleItem) {
                CafeteriaSaleItem::create([
                    'sale_id' => $sale->id,
                    ...$saleItem
                ]);
            }

            return response()->json($sale->load('items'));
        });
    }
}
