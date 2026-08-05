<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabResult;
use App\Models\LabResultItem;
use App\Models\SampleCollection;
use App\Models\RadiologyStudy;
use App\Models\RadiologyResult;
use App\Models\Visit;
use App\Models\Test;
use App\Models\User;
use App\Models\Bill;
use App\Models\BillItem;
use Illuminate\Support\Facades\Schema;

class LabResultSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RadiologyResult::truncate();
        RadiologyStudy::truncate();
        LabResultItem::truncate();
        LabResult::truncate();
        SampleCollection::truncate();
        Schema::enableForeignKeyConstraints();

        $visits = Visit::take(15)->get();
        $tests = Test::all();
        $technician = User::where('role', 'nurse')->first() ?? User::first();
        $pathologist = User::where('role', 'doctor')->first() ?? User::first();

        if ($visits->isEmpty() || $tests->isEmpty()) {
            return;
        }

        // 1. Sample Collections & Lab Results & Items (12 items)
        for ($i = 0; $i < 12; $i++) {
            $v = $visits[$i % count($visits)];
            $t = $tests[$i % count($tests)];

            $bill = Bill::create([
                'bill_number' => 'LAB-BILL-' . sprintf('%04d', $i + 1),
                'visit_id' => $v->id,
                'patient_id' => $v->patient_id,
                'total_amount' => $t->price,
                'status' => 'finalized',
                'payment_status' => 'paid',
            ]);

            $billItem = BillItem::create([
                'bill_id' => $bill->id,
                'service_id' => null,
                'item_name' => $t->name,
                'quantity' => 1,
                'unit_price' => $t->price,
                'total_price' => $t->price,
            ]);

            $sc = SampleCollection::create([
                'visit_id' => $v->id,
                'bill_item_id' => $billItem->id,
                'test_id' => $t->id,
                'barcode' => 'BARCODE-' . sprintf('%04d', $i + 1),
                'status' => 'collected',
                'collected_at' => now()->subHours($i * 2),
                'collected_by' => (string)$technician->name,
            ]);

            $lr = LabResult::create([
                'visit_id' => $v->id,
                'bill_item_id' => $billItem->id,
                'test_id' => $t->id,
                'sample_collection_id' => $sc->id,
                'status' => 'finalized',
                'technician_id' => $technician->id,
                'pathologist_id' => $pathologist->id,
                'finalized_at' => now()->subHours($i),
            ]);

            LabResultItem::create([
                'lab_result_id' => $lr->id,
                'component_name' => $t->name . ' Parameter',
                'value' => (string)rand(10, 150),
                'unit' => 'mg/dL',
                'reference_range' => '10-100',
                'is_abnormal' => $i % 3 === 0,
            ]);
        }

        // 2. Radiology Studies & Results (12 items)
        for ($i = 0; $i < 12; $i++) {
            $v = $visits[$i % count($visits)];

            $radBill = Bill::create([
                'bill_number' => 'RAD-BILL-' . sprintf('%04d', $i + 1),
                'visit_id' => $v->id,
                'patient_id' => $v->patient_id,
                'total_amount' => 800.00,
                'status' => 'finalized',
                'payment_status' => 'paid',
            ]);

            $radBillItem = BillItem::create([
                'bill_id' => $radBill->id,
                'service_id' => null,
                'item_name' => 'Radiology Scan',
                'quantity' => 1,
                'unit_price' => 800.00,
                'total_price' => 800.00,
            ]);

            $rs = RadiologyStudy::create([
                'visit_id' => $v->id,
                'bill_item_id' => $radBillItem->id,
                'modality' => $i % 2 === 0 ? 'X-Ray' : 'CT Scan',
                'study_name' => $i % 2 === 0 ? 'Chest X-Ray PA View' : 'Brain CT Scan',
                'status' => 'reported',
            ]);

            RadiologyResult::create([
                'radiology_study_id' => $rs->id,
                'radiologist_id' => $pathologist->id,
                'findings' => 'Study evaluated. No gross focal pathological lesion observed.',
                'impression' => 'Unremarkable radiological examination.',
                'finalized_at' => now()->subDays($i),
            ]);
        }

        $this->command->info('12 sample collections, lab results, and radiology studies seeded successfully!');
    }
}
