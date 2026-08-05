<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Bill;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Payment::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $bills = Bill::all();

        if ($bills->isEmpty()) {
            return;
        }

        $methods = ['cash', 'card', 'upi', 'netbanking', 'cash'];

        for ($i = 0; $i < 15; $i++) {
            $bill = $bills[$i % $bills->count()];
            Payment::create([
                'bill_id' => $bill->id,
                'amount' => $bill->total_amount > 0 ? $bill->total_amount : 500.00,
                'payment_method' => $methods[$i % count($methods)],
                'transaction_reference' => 'TXN-2026-' . sprintf('%04d', $i + 1),
                'payment_date' => now()->subDays($i)->format('Y-m-d'),
                'notes' => 'Routine bill payment processed',
            ]);
        }

        $this->command->info('15 payments seeded successfully!');
    }
}
