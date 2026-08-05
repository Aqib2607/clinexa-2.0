<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Visit;
use App\Models\Service;
use App\Models\Patient;
use Illuminate\Support\Facades\Schema;

class BillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Bill::truncate();
        BillItem::truncate();
        Schema::enableForeignKeyConstraints();

        $visits = Visit::limit(5)->get();
        $services = Service::limit(3)->get();

        if ($visits->count() < 5) {
            $this->command->error('Not enough visits! Please run VisitSeeder first.');
            return;
        }

        if ($services->count() < 3) {
            $this->command->error('Not enough services! Please run ServiceSeeder first.');
            return;
        }

        $bills = [
            [
                'bill_number' => 'BILL-001',
                'visit_id' => $visits[0]->id,
                'patient_id' => $visits[0]->patient_id,
                'total_amount' => 1300.00,
                'discount_amount' => 0.00,
                'paid_amount' => 1300.00,
                'due_amount' => 0.00,
                'status' => 'finalized',
                'payment_status' => 'paid',
                'items' => [
                    ['service_id' => $services[0]->id, 'item_name' => $services[0]->name, 'quantity' => 1, 'unit_price' => 500.00, 'total_price' => 500.00],
                    ['service_id' => $services[1]->id, 'item_name' => $services[1]->name, 'quantity' => 1, 'unit_price' => 800.00, 'total_price' => 800.00],
                ],
            ],
            [
                'bill_number' => 'BILL-002',
                'visit_id' => $visits[1]->id,
                'patient_id' => $visits[1]->patient_id,
                'total_amount' => 1100.00,
                'discount_amount' => 100.00,
                'paid_amount' => 500.00,
                'due_amount' => 500.00,
                'status' => 'finalized',
                'payment_status' => 'partial',
                'items' => [
                    ['service_id' => $services[0]->id, 'item_name' => $services[0]->name, 'quantity' => 1, 'unit_price' => 500.00, 'total_price' => 500.00],
                    ['service_id' => $services[2]->id, 'item_name' => $services[2]->name, 'quantity' => 2, 'unit_price' => 300.00, 'total_price' => 600.00],
                ],
            ],
            [
                'bill_number' => 'BILL-003',
                'visit_id' => $visits[2]->id,
                'patient_id' => $visits[2]->patient_id,
                'total_amount' => 1700.00,
                'discount_amount' => 0.00,
                'paid_amount' => 0.00,
                'due_amount' => 1700.00,
                'status' => 'finalized',
                'payment_status' => 'pending',
                'items' => [
                    ['service_id' => $services[0]->id, 'item_name' => $services[0]->name, 'quantity' => 1, 'unit_price' => 500.00, 'total_price' => 500.00],
                    ['service_id' => $services[1]->id, 'item_name' => $services[1]->name, 'quantity' => 1, 'unit_price' => 800.00, 'total_price' => 800.00],
                    ['service_id' => $services[2]->id, 'item_name' => $services[2]->name, 'quantity' => 1, 'unit_price' => 300.00, 'total_price' => 300.00],
                ],
            ],
            [
                'bill_number' => 'BILL-004',
                'visit_id' => $visits[3]->id,
                'patient_id' => $visits[3]->patient_id,
                'total_amount' => 500.00,
                'discount_amount' => 50.00,
                'paid_amount' => 450.00,
                'due_amount' => 0.00,
                'status' => 'finalized',
                'payment_status' => 'paid',
                'items' => [
                    ['service_id' => $services[0]->id, 'item_name' => $services[0]->name, 'quantity' => 1, 'unit_price' => 500.00, 'total_price' => 500.00],
                ],
            ],
            [
                'bill_number' => 'BILL-005',
                'visit_id' => $visits[4]->id,
                'patient_id' => $visits[4]->patient_id,
                'total_amount' => 800.00,
                'discount_amount' => 0.00,
                'paid_amount' => 800.00,
                'due_amount' => 0.00,
                'status' => 'finalized',
                'payment_status' => 'paid',
                'items' => [
                    ['service_id' => $services[1]->id, 'item_name' => $services[1]->name, 'quantity' => 1, 'unit_price' => 800.00, 'total_price' => 800.00],
                ],
            ],
        ];

        foreach ($bills as $billData) {
            $items = $billData['items'];
            unset($billData['items']);

            $bill = Bill::create($billData);

            foreach ($items as $itemData) {
                $itemData['bill_id'] = $bill->id;
                BillItem::create($itemData);
            }
        }

        $this->command->info('5 bills with items seeded successfully!');
    }
}
