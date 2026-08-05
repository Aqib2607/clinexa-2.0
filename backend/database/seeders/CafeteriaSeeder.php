<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class CafeteriaSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create(['name' => 'Cafeteria Manager', 'email' => 'cafeteria@hospital.com']);

        // 1. Cafeteria Items (15 items)
        $items = [
            ['name' => 'Espresso Coffee', 'code' => 'CAF-001', 'category' => 'Beverages', 'price' => 3.50],
            ['name' => 'Green Tea', 'code' => 'CAF-002', 'category' => 'Beverages', 'price' => 2.50],
            ['name' => 'Fresh Orange Juice', 'code' => 'CAF-003', 'category' => 'Beverages', 'price' => 4.00],
            ['name' => 'Mineral Water 500ml', 'code' => 'CAF-004', 'category' => 'Beverages', 'price' => 1.50],
            ['name' => 'Chicken Sandwich', 'code' => 'CAF-005', 'category' => 'Snacks', 'price' => 6.50],
            ['name' => 'Veggie Club Wrap', 'code' => 'CAF-006', 'category' => 'Snacks', 'price' => 5.50],
            ['name' => 'Blueberry Muffin', 'code' => 'CAF-007', 'category' => 'Snacks', 'price' => 3.00],
            ['name' => 'Fruit Salad Bowl', 'code' => 'CAF-008', 'category' => 'Snacks', 'price' => 4.50],
            ['name' => 'Healthy Veggie Thali', 'code' => 'CAF-009', 'category' => 'Meals', 'price' => 9.00],
            ['name' => 'Grilled Chicken Platter', 'code' => 'CAF-010', 'category' => 'Meals', 'price' => 12.00],
            ['name' => 'Steamed Rice & Lentils', 'code' => 'CAF-011', 'category' => 'Meals', 'price' => 7.00],
            ['name' => 'Whole Wheat Pasta Bowl', 'code' => 'CAF-012', 'category' => 'Meals', 'price' => 8.50],
            ['name' => 'Oatmeal Porridge Bowl', 'code' => 'CAF-013', 'category' => 'Snacks', 'price' => 3.80],
            ['name' => 'Greek Yogurt Parfait', 'code' => 'CAF-014', 'category' => 'Snacks', 'price' => 4.20],
            ['name' => 'Lemon Iced Tea', 'code' => 'CAF-015', 'category' => 'Beverages', 'price' => 3.00],
        ];

        $itemIds = [];
        foreach ($items as $itm) {
            $id = Str::uuid()->toString();
            $itemIds[] = $id;
            DB::table('cafeteria_items')->insert([
                'id' => $id,
                'name' => $itm['name'],
                'code' => $itm['code'],
                'category' => $itm['category'],
                'price' => $itm['price'],
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Cafeteria Sales & Items (12 sales)
        for ($i = 1; $i <= 12; $i++) {
            $saleId = Str::uuid()->toString();
            $unitPrice = $items[$i % count($items)]['price'];
            $qty = rand(1, 3);
            $total = $unitPrice * $qty;

            DB::table('cafeteria_sales')->insert([
                'id' => $saleId,
                'bill_no' => 'CAF-BILL-2026-' . sprintf('%03d', $i),
                'sale_date' => now()->subDays($i),
                'total_amount' => $total,
                'payment_method' => $i % 3 === 0 ? 'card' : ($i % 3 === 1 ? 'cash' : 'employee_credit'),
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('cafeteria_sale_items')->insert([
                'id' => Str::uuid()->toString(),
                'sale_id' => $saleId,
                'item_id' => $itemIds[$i % count($itemIds)],
                'quantity' => $qty,
                'price' => $unitPrice,
                'total' => $total,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Cafeteria tables seeded successfully!');
    }
}
