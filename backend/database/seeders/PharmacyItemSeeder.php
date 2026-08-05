<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PharmacyItem;
use App\Models\PharmacyStock;
use App\Models\PharmacySale;
use App\Models\PharmacySaleItem;
use App\Models\Patient;
use App\Models\User;

class PharmacyItemSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        PharmacySaleItem::truncate();
        PharmacySale::truncate();
        PharmacyStock::truncate();
        PharmacyItem::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $patients = Patient::take(15)->get();

        $items = [
            ['name' => 'Amoxicillin 500mg', 'generic_name' => 'Amoxicillin', 'brand_name' => 'Amoxil', 'unit' => 'capsule', 'reorder_level' => 100],
            ['name' => 'Metformin 500mg', 'generic_name' => 'Metformin Hydrochloride', 'brand_name' => 'Glucophage', 'unit' => 'tablet', 'reorder_level' => 200],
            ['name' => 'Amlodipine 5mg', 'generic_name' => 'Amlodipine Besylate', 'brand_name' => 'Norvasc', 'unit' => 'tablet', 'reorder_level' => 150],
            ['name' => 'Paracetamol 500mg', 'generic_name' => 'Acetaminophen', 'brand_name' => 'Tylenol', 'unit' => 'tablet', 'reorder_level' => 500],
            ['name' => 'Omeprazole 20mg', 'generic_name' => 'Omeprazole', 'brand_name' => 'Prilosec', 'unit' => 'capsule', 'reorder_level' => 100],
            ['name' => 'Atorvastatin 10mg', 'generic_name' => 'Atorvastatin Calcium', 'brand_name' => 'Lipitor', 'unit' => 'tablet', 'reorder_level' => 120],
            ['name' => 'Losartan 50mg', 'generic_name' => 'Losartan Potassium', 'brand_name' => 'Cozaar', 'unit' => 'tablet', 'reorder_level' => 100],
            ['name' => 'Azithromycin 250mg', 'generic_name' => 'Azithromycin', 'brand_name' => 'Zithromax', 'unit' => 'tablet', 'reorder_level' => 80],
            ['name' => 'Ibuprofen 400mg', 'generic_name' => 'Ibuprofen', 'brand_name' => 'Advil', 'unit' => 'tablet', 'reorder_level' => 250],
            ['name' => 'Ciprofloxacin 500mg', 'generic_name' => 'Ciprofloxacin', 'brand_name' => 'Cipro', 'unit' => 'tablet', 'reorder_level' => 90],
            ['name' => 'Cetirizine 10mg', 'generic_name' => 'Cetirizine Hydrochloride', 'brand_name' => 'Zyrtec', 'unit' => 'tablet', 'reorder_level' => 150],
            ['name' => 'Pantoprazole 40mg', 'generic_name' => 'Pantoprazole Sodium', 'brand_name' => 'Protonix', 'unit' => 'tablet', 'reorder_level' => 100],
            ['name' => 'Levothyroxine 50mcg', 'generic_name' => 'Levothyroxine Sodium', 'brand_name' => 'Synthroid', 'unit' => 'tablet', 'reorder_level' => 110],
            ['name' => 'Salbutamol Inhaler 100mcg', 'generic_name' => 'Albuterol', 'brand_name' => 'Ventolin', 'unit' => 'inhaler', 'reorder_level' => 40],
            ['name' => 'Dexamethasone 4mg', 'generic_name' => 'Dexamethasone', 'brand_name' => 'Decadron', 'unit' => 'tablet', 'reorder_level' => 70],
        ];

        $createdItems = [];
        $createdStocks = [];

        foreach ($items as $itemData) {
            $itemData['is_active'] = true;
            $pi = PharmacyItem::create($itemData);
            $createdItems[] = $pi;

            // Seed stock
            $stock = PharmacyStock::create([
                'pharmacy_item_id' => $pi->id,
                'batch_number' => 'PHARM-BATCH-' . rand(100, 999),
                'expiry_date' => now()->addMonths(rand(6, 24))->format('Y-m-d'),
                'quantity' => rand(200, 1000),
                'purchase_price' => rand(2, 20),
                'sale_price' => rand(5, 40),
            ]);
            $createdStocks[] = $stock;
        }

        // Seed Pharmacy Sales & Sale Items (12 sales)
        if ($patients->isNotEmpty()) {
            for ($i = 1; $i <= 12; $i++) {
                $item = $createdItems[$i % count($createdItems)];
                $stock = $createdStocks[$i % count($createdStocks)];
                $qty = rand(1, 4);
                $unitPrice = 15.00;
                $total = $unitPrice * $qty;

                $sale = PharmacySale::create([
                    'invoice_number' => 'INV-2026-' . sprintf('%03d', $i),
                    'patient_id' => $patients[$i % count($patients)]->id,
                    'customer_name' => $patients[$i % count($patients)]->name,
                    'total_amount' => $total,
                    'paid_amount' => $total,
                    'payment_method' => 'cash',
                    'sale_date' => now()->subDays($i),
                ]);

                PharmacySaleItem::create([
                    'pharmacy_sale_id' => $sale->id,
                    'pharmacy_item_id' => $item->id,
                    'pharmacy_stock_id' => $stock->id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total_price' => $total,
                ]);
            }
        }

        $this->command->info(count($items) . ' pharmacy items, stocks, and sales seeded successfully!');
    }
}
