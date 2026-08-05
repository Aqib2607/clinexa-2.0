<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create(['name' => 'Admin User', 'email' => 'admin_inv@hospital.com']);

        // 1. Stores (10 stores)
        $stores = [
            ['name' => 'Central Medical Store', 'code' => 'STR-MAIN', 'location' => 'Block A, Ground Floor', 'is_main_store' => true],
            ['name' => 'Emergency Pharmacy Store', 'code' => 'STR-EMG', 'location' => 'Emergency Dept', 'is_main_store' => false],
            ['name' => 'OPD Pharmacy Store', 'code' => 'STR-OPD', 'location' => 'OPD Building 1st Floor', 'is_main_store' => false],
            ['name' => 'IPD Pharmacy Store', 'code' => 'STR-IPD', 'location' => 'IPD Ward 2nd Floor', 'is_main_store' => false],
            ['name' => 'Surgical Equipment Store', 'code' => 'STR-SURG', 'location' => 'OT Complex 3rd Floor', 'is_main_store' => false],
            ['name' => 'Laboratory Reagent Store', 'code' => 'STR-LAB', 'location' => 'Diagnostic Center 1st Floor', 'is_main_store' => false],
            ['name' => 'General Consumables Store', 'code' => 'STR-GEN', 'location' => 'Basement Store Room', 'is_main_store' => false],
            ['name' => 'Radiology & Imaging Store', 'code' => 'STR-RAD', 'location' => 'Radiology Wing', 'is_main_store' => false],
            ['name' => 'Pediatric Ward Sub-store', 'code' => 'STR-PED', 'location' => 'Pediatric Ward 4th Floor', 'is_main_store' => false],
            ['name' => 'ICU Medical Supplies Store', 'code' => 'STR-ICU', 'location' => 'Critical Care Unit 2nd Floor', 'is_main_store' => false],
        ];

        $storeIds = [];
        foreach ($stores as $s) {
            $id = Str::uuid()->toString();
            $storeIds[] = $id;
            DB::table('stores')->insert([
                'id' => $id,
                'name' => $s['name'],
                'code' => $s['code'],
                'location' => $s['location'],
                'is_main_store' => $s['is_main_store'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Suppliers (10 suppliers)
        $suppliersData = [
            ['name' => 'Apex Pharma Ltd', 'contact_person' => 'John Doe', 'phone' => '+1-555-9001', 'email' => 'contact@apexpharma.com', 'address' => 'Industrial Area Phase 1'],
            ['name' => 'MedTech Surgical Inc', 'contact_person' => 'Sarah Connor', 'phone' => '+1-555-9002', 'email' => 'sales@medtechsurg.com', 'address' => 'Innovation Park Suite 400'],
            ['name' => 'Global Care Diagnostics', 'contact_person' => 'Mark Ruffalo', 'phone' => '+1-555-9003', 'email' => 'info@globalcarediag.com', 'address' => 'Healthcare Plaza Tower B'],
            ['name' => 'BioLife Reagents Corp', 'contact_person' => 'Elena Rostova', 'phone' => '+1-555-9004', 'email' => 'support@biolifereagents.com', 'address' => 'Biotech Zone Way 12'],
            ['name' => 'Sun Health Supplies', 'contact_person' => 'Amit Sharma', 'phone' => '+1-555-9005', 'email' => 'orders@sunhealth.com', 'address' => 'Commercial Complex Road 5'],
            ['name' => 'Nexus Medical Solutions', 'contact_person' => 'Lisa Ray', 'phone' => '+1-555-9006', 'email' => 'lisa@nexusmed.com', 'address' => 'Downtown Boulevard 88'],
            ['name' => 'Pinnacle Surgical Goods', 'contact_person' => 'David Miller', 'phone' => '+1-555-9007', 'email' => 'david@pinnaclesurg.com', 'address' => 'Westside Logistics Park'],
            ['name' => 'OmniCare Pharmaceuticals', 'contact_person' => 'Grace Hopper', 'phone' => '+1-555-9008', 'email' => 'grace@omnicarepharma.com', 'address' => 'Central Business District'],
            ['name' => 'Zenith Lab Instruments', 'contact_person' => 'Victor Stone', 'phone' => '+1-555-9009', 'email' => 'victor@zenithlabs.com', 'address' => 'Science & Tech Hub'],
            ['name' => 'Prime Disposables Co', 'contact_person' => 'Rachel Green', 'phone' => '+1-555-9010', 'email' => 'rachel@primedisposables.com', 'address' => 'Eastside Express Way'],
        ];

        foreach ($suppliersData as $sup) {
            DB::table('suppliers')->insert([
                'id' => Str::uuid()->toString(),
                'name' => $sup['name'],
                'contact_person' => $sup['contact_person'],
                'phone' => $sup['phone'],
                'email' => $sup['email'],
                'address' => $sup['address'],
                'tax_id' => 'TAX-' . rand(10000, 99999),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Item Categories (10 categories)
        $categories = [
            'Antibiotics', 'Analgesics & Antipyretics', 'Surgical Gloves & Masks',
            'Intravenous Fluids', 'Diagnostic Reagents', 'Syringes & Needles',
            'Bandages & Dressings', 'Cardiac Medications', 'Anesthetics', 'General Disposables'
        ];

        $categoryIds = [];
        foreach ($categories as $catName) {
            $catId = Str::uuid()->toString();
            $categoryIds[] = $catId;
            DB::table('item_categories')->insert([
                'id' => $catId,
                'name' => $catName,
                'parent_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Items (15 items)
        $itemsData = [
            ['name' => 'Amoxicillin 500mg Capsule', 'code' => 'ITM-001', 'type' => 'medicine', 'unit' => 'box', 'price' => 25.00, 'reorder' => 50],
            ['name' => 'Paracetamol 650mg Tablet', 'code' => 'ITM-002', 'type' => 'medicine', 'unit' => 'strip', 'price' => 5.50, 'reorder' => 100],
            ['name' => 'Surgical Latex Gloves (Medium)', 'code' => 'ITM-003', 'type' => 'consumable', 'unit' => 'box', 'price' => 15.00, 'reorder' => 30],
            ['name' => 'Normal Saline 0.9% 500ml', 'code' => 'ITM-004', 'type' => 'consumable', 'unit' => 'bottle', 'price' => 3.20, 'reorder' => 200],
            ['name' => 'Disposable Syringe 5ml', 'code' => 'ITM-005', 'type' => 'consumable', 'unit' => 'pcs', 'price' => 0.50, 'reorder' => 500],
            ['name' => 'Ciprofloxacin 500mg Tablet', 'code' => 'ITM-006', 'type' => 'medicine', 'unit' => 'strip', 'price' => 12.00, 'reorder' => 40],
            ['name' => 'Ibuprofen 400mg Tablet', 'code' => 'ITM-007', 'type' => 'medicine', 'unit' => 'strip', 'price' => 4.80, 'reorder' => 80],
            ['name' => 'Sterile Gauze Bandage 10cm', 'code' => 'ITM-008', 'type' => 'consumable', 'unit' => 'roll', 'price' => 1.50, 'reorder' => 150],
            ['name' => 'Atorvastatin 20mg Tablet', 'code' => 'ITM-009', 'type' => 'medicine', 'unit' => 'strip', 'price' => 18.50, 'reorder' => 60],
            ['name' => 'Propofol Injection 20ml', 'code' => 'ITM-010', 'type' => 'medicine', 'unit' => 'vial', 'price' => 45.00, 'reorder' => 20],
            ['name' => 'IV Cannula 20G', 'code' => 'ITM-011', 'type' => 'consumable', 'unit' => 'pcs', 'price' => 2.10, 'reorder' => 300],
            ['name' => 'CBC Reagent Pack 5L', 'code' => 'ITM-012', 'type' => 'general', 'unit' => 'canister', 'price' => 220.00, 'reorder' => 5],
            ['name' => 'Digital Thermometer', 'code' => 'ITM-013', 'type' => 'asset', 'unit' => 'pcs', 'price' => 12.00, 'reorder' => 15],
            ['name' => 'Face Mask 3-Ply Protective', 'code' => 'ITM-014', 'type' => 'consumable', 'unit' => 'box', 'price' => 8.00, 'reorder' => 100],
            ['name' => 'Hand Sanitizer 500ml', 'code' => 'ITM-015', 'type' => 'consumable', 'unit' => 'bottle', 'price' => 6.00, 'reorder' => 50],
        ];

        $itemIds = [];
        foreach ($itemsData as $idx => $itm) {
            $itemId = Str::uuid()->toString();
            $itemIds[] = $itemId;
            DB::table('items')->insert([
                'id' => $itemId,
                'name' => $itm['name'],
                'code' => $itm['code'],
                'type' => $itm['type'],
                'category' => $categories[$idx % count($categories)],
                'category_id' => $categoryIds[$idx % count($categoryIds)],
                'unit' => $itm['unit'],
                'reorder_level' => $itm['reorder'],
                'standard_price' => $itm['price'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Item Batches (15 batches)
        $batchIds = [];
        foreach ($itemIds as $idx => $itemId) {
            $batchId = Str::uuid()->toString();
            $batchIds[] = $batchId;
            DB::table('item_batches')->insert([
                'id' => $batchId,
                'item_id' => $itemId,
                'store_id' => $storeIds[$idx % count($storeIds)],
                'batch_no' => 'BATCH-2026-' . sprintf('%03d', $idx + 1),
                'expiry_date' => now()->addMonths(rand(6, 24))->toDateString(),
                'quantity' => rand(100, 500),
                'purchase_price' => rand(5, 50),
                'sale_price' => rand(10, 80),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Stock Transactions (15 transactions)
        foreach ($batchIds as $idx => $batchId) {
            DB::table('stock_transactions')->insert([
                'id' => Str::uuid()->toString(),
                'item_batch_id' => $batchId,
                'type' => $idx % 2 === 0 ? 'in' : 'out',
                'quantity' => rand(10, 50),
                'reference_type' => 'PurchaseOrder',
                'reference_id' => null,
                'transaction_date' => now()->subDays(rand(1, 30)),
                'performed_by' => $admin->id,
                'notes' => 'Stock updated during routine replenishment',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7. Requisitions & Requisition Items (12 requisitions & items)
        for ($i = 1; $i <= 12; $i++) {
            $reqId = Str::uuid()->toString();
            DB::table('requisitions')->insert([
                'id' => $reqId,
                'requisition_no' => 'REQ-2026-' . sprintf('%03d', $i),
                'from_store_id' => $storeIds[$i % count($storeIds)],
                'to_store_id' => $storeIds[0], // Main store
                'status' => $i % 3 === 0 ? 'approved' : ($i % 3 === 1 ? 'pending' : 'issued'),
                'requested_by' => $admin->id,
                'requested_at' => now()->subDays($i),
                'approved_by' => $admin->id,
                'approved_at' => now()->subDays($i - 1),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('requisition_items')->insert([
                'id' => Str::uuid()->toString(),
                'requisition_id' => $reqId,
                'item_id' => $itemIds[$i % count($itemIds)],
                'requested_quantity' => rand(20, 100),
                'issued_quantity' => rand(10, 80),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Inventory tables seeded successfully!');
    }
}
