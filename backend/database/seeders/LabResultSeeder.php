<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabResult;
use App\Models\LabResultItem;
use App\Models\Visit;
use App\Models\Test;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class LabResultSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        LabResult::truncate();
        LabResultItem::truncate();
        Schema::enableForeignKeyConstraints();

        $visits = Visit::limit(5)->get();
        $tests = Test::limit(3)->get();
        $technician = User::where('role', 'nurse')->first(); // Using nurse as technician
        $pathologist = User::where('role', 'doctor')->first();

        if ($visits->count() < 3) {
            $this->command->error('Not enough visits! Please run VisitSeeder first.');
            return;
        }

        if ($tests->count() < 1) {
            $this->command->error('No tests found! Please run TestSeeder first.');
            return;
        }

        $labResults = [
            [
                'visit_id' => $visits[0]->id,
                'bill_item_id' => null,
                'test_id' => $tests[0]->id,
                'sample_collection_id' => null,
                'status' => 'finalized',
                'technician_id' => $technician->id ?? null,
                'pathologist_id' => $pathologist->id ?? null,
                'finalized_at' => now()->subDays(2),
                'items' => [
                    ['component_name' => 'Hemoglobin', 'value' => '14.5', 'unit' => 'g/dL', 'reference_range' => '12-16', 'is_abnormal' => false],
                    ['component_name' => 'WBC Count', 'value' => '8500', 'unit' => 'cells/μL', 'reference_range' => '4000-11000', 'is_abnormal' => false],
                ],
            ],
            [
                'visit_id' => $visits[1]->id,
                'bill_item_id' => null,
                'test_id' => $tests[1]->id ?? $tests[0]->id,
                'sample_collection_id' => null,
                'status' => 'finalized',
                'technician_id' => $technician->id ?? null,
                'pathologist_id' => $pathologist->id ?? null,
                'finalized_at' => now()->subDays(5),
                'items' => [
                    ['component_name' => 'Blood Glucose', 'value' => '180', 'unit' => 'mg/dL', 'reference_range' => '70-100', 'is_abnormal' => true],
                    ['component_name' => 'HbA1c', 'value' => '8.2', 'unit' => '%', 'reference_range' => '<5.7', 'is_abnormal' => true],
                ],
            ],
            [
                'visit_id' => $visits[2]->id,
                'bill_item_id' => null,
                'test_id' => $tests[2]->id ?? $tests[0]->id,
                'sample_collection_id' => null,
                'status' => 'finalized',
                'technician_id' => $technician->id ?? null,
                'pathologist_id' => $pathologist->id ?? null,
                'finalized_at' => now()->subDays(10),
                'items' => [
                    ['component_name' => 'Total Cholesterol', 'value' => '220', 'unit' => 'mg/dL', 'reference_range' => '<200', 'is_abnormal' => true],
                    ['component_name' => 'HDL', 'value' => '45', 'unit' => 'mg/dL', 'reference_range' => '>40', 'is_abnormal' => false],
                    ['component_name' => 'LDL', 'value' => '150', 'unit' => 'mg/dL', 'reference_range' => '<100', 'is_abnormal' => true],
                ],
            ],
            [
                'visit_id' => $visits[3]->id ?? $visits[0]->id,
                'bill_item_id' => null,
                'test_id' => $tests[0]->id,
                'sample_collection_id' => null,
                'status' => 'pending',
                'technician_id' => $technician->id ?? null,
                'pathologist_id' => null,
                'finalized_at' => null,
                'items' => [
                    ['component_name' => 'Platelet Count', 'value' => '250000', 'unit' => 'cells/μL', 'reference_range' => '150000-400000', 'is_abnormal' => false],
                ],
            ],
            [
                'visit_id' => $visits[4]->id ?? $visits[0]->id,
                'bill_item_id' => null,
                'test_id' => $tests[1]->id ?? $tests[0]->id,
                'sample_collection_id' => null,
                'status' => 'finalized',
                'technician_id' => $technician->id ?? null,
                'pathologist_id' => $pathologist->id ?? null,
                'finalized_at' => now()->subDays(15),
                'items' => [
                    ['component_name' => 'Creatinine', 'value' => '1.0', 'unit' => 'mg/dL', 'reference_range' => '0.7-1.3', 'is_abnormal' => false],
                    ['component_name' => 'BUN', 'value' => '18', 'unit' => 'mg/dL', 'reference_range' => '7-20', 'is_abnormal' => false],
                ],
            ],
        ];

        foreach ($labResults as $resultData) {
            $items = $resultData['items'];
            unset($resultData['items']);

            // Create a dummy Bill and BillItem for this lab result
            // This is required because LabResult has non-nullable foreign key to bill_items
            $bill = \App\Models\Bill::create([
                'bill_number' => 'LAB-' . uniqid(),
                'visit_id' => $resultData['visit_id'],
                'patient_id' => \App\Models\Visit::find($resultData['visit_id'])->patient_id,
                'total_amount' => 0,
                'status' => 'finalized',
                'payment_status' => 'paid',
            ]);

            $billItem = \App\Models\BillItem::create([
                'bill_id' => $bill->id,
                'service_id' => null,
                'item_name' => 'Lab Test',
                'quantity' => 1,
                'unit_price' => 0,
                'total_price' => 0,
            ]);

            $resultData['bill_item_id'] = $billItem->id;

            $labResult = LabResult::create($resultData);

            foreach ($items as $itemData) {
                $itemData['lab_result_id'] = $labResult->id;
                LabResultItem::create($itemData);
            }
        }

        $this->command->info('5 lab results with items and bills seeded successfully!');
    }
}
