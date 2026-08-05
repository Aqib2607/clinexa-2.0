<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Bill;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Payment::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $bills = Bill::whereIn('payment_status', ['paid', 'partial'])->limit(5)->get();

        if ($bills->count() < 3) {
            $this->command->error('Not enough paid/partial bills! Please run BillSeeder first.');
            return;
        }

        $payments = [
            [
                'bill_id' => $bills[0]->id,
                'amount' => 1300.00,
                'payment_method' => 'cash',
                'transaction_reference' => 'CASH-001',
                'payment_date' => now()->subDays(2)->format('Y-m-d'),
                'notes' => 'Full payment received',
            ],
            [
                'bill_id' => $bills[1]->id ?? $bills[0]->id,
                'amount' => 500.00,
                'payment_method' => 'card',
                'transaction_reference' => 'CARD-TXN-12345',
                'payment_date' => now()->subDays(5)->format('Y-m-d'),
                'notes' => 'Partial payment via credit card',
            ],
            [
                'bill_id' => $bills[2]->id ?? $bills[0]->id,
                'amount' => 450.00,
                'payment_method' => 'upi',
                'transaction_reference' => 'UPI-67890',
                'payment_date' => now()->format('Y-m-d'),
                'notes' => 'UPI payment',
            ],
            [
                'bill_id' => $bills[3]->id ?? $bills[0]->id,
                'amount' => 800.00,
                'payment_method' => 'cash',
                'transaction_reference' => 'CASH-002',
                'payment_date' => now()->subDays(15)->format('Y-m-d'),
                'notes' => 'Cash payment',
            ],
            [
                'bill_id' => $bills[1]->id ?? $bills[0]->id,
                'amount' => 500.00,
                'payment_method' => 'cash',
                'transaction_reference' => 'CASH-003',
                'payment_date' => now()->subDays(3)->format('Y-m-d'),
                'notes' => 'Remaining payment received',
            ],
        ];

        foreach ($payments as $paymentData) {
            Payment::create($paymentData);
        }

        $this->command->info('5 payments seeded successfully!');
    }
}
