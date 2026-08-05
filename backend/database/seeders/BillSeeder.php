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
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Bill::truncate();
        BillItem::truncate();
        Schema::enableForeignKeyConstraints();

        $visits = Visit::take(15)->get();
        $services = Service::all();
        $patients = Patient::take(15)->get();

        if ($visits->isEmpty() || $services->isEmpty() || $patients->isEmpty()) {
            return;
        }

        for ($i = 0; $i < count($visits); $i++) {
            $serv = $services[$i % $services->count()];
            $total = $serv->prices()->first()?->price ?? 500.00;
            $status = $i % 3 === 0 ? 'paid' : ($i % 3 === 1 ? 'partial' : 'pending');

            $bill = Bill::create([
                'bill_number' => 'BILL-2026-' . sprintf('%03d', $i + 1),
                'visit_id' => $visits[$i]->id,
                'patient_id' => $patients[$i % count($patients)]->id,
                'total_amount' => $total,
                'discount_amount' => 0.00,
                'paid_amount' => $status === 'paid' ? $total : ($status === 'partial' ? $total / 2 : 0.00),
                'due_amount' => $status === 'paid' ? 0.00 : ($status === 'partial' ? $total / 2 : $total),
                'status' => 'finalized',
                'payment_status' => $status,
            ]);

            BillItem::create([
                'bill_id' => $bill->id,
                'service_id' => $serv->id,
                'item_name' => $serv->name,
                'quantity' => 1,
                'unit_price' => $total,
                'total_price' => $total,
            ]);
        }

        $this->command->info(count($visits) . ' bills with items seeded successfully!');
    }
}
