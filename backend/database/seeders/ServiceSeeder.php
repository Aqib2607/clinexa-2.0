<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\ServicePrice;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Service::truncate();
        ServicePrice::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $services = [
            ['code' => 'CONS-GEN', 'name' => 'General Consultation', 'type' => 'consultation', 'price' => 500.00],
            ['code' => 'CONS-SPEC', 'name' => 'Specialist Consultation', 'type' => 'consultation', 'price' => 1200.00],
            ['code' => 'XR-CHEST', 'name' => 'Chest X-Ray PA View', 'type' => 'radiology', 'price' => 800.00],
            ['code' => 'LAB-CBC', 'name' => 'Complete Blood Count (CBC)', 'type' => 'laboratory', 'price' => 350.00],
            ['code' => 'ECG-12', 'name' => '12-Lead Electrocardiogram', 'type' => 'diagnostic', 'price' => 600.00],
            ['code' => 'USG-ABD', 'name' => 'Whole Abdomen Ultrasound', 'type' => 'radiology', 'price' => 1500.00],
            ['code' => 'LAB-LFT', 'name' => 'Liver Function Test (LFT)', 'type' => 'laboratory', 'price' => 750.00],
            ['code' => 'LAB-KFT', 'name' => 'Kidney Function Test (KFT)', 'type' => 'laboratory', 'price' => 700.00],
            ['code' => 'LAB-LIPID', 'name' => 'Lipid Profile Panel', 'type' => 'laboratory', 'price' => 650.00],
            ['code' => 'CT-HEAD', 'name' => 'CT Scan Brain Non-Contrast', 'type' => 'radiology', 'price' => 3500.00],
            ['code' => 'MRI-SPINE', 'name' => 'MRI Lumbar Spine', 'type' => 'radiology', 'price' => 6500.00],
            ['code' => 'BED-ICU', 'name' => 'ICU Bed Per Day Charge', 'type' => 'ipd', 'price' => 4500.00],
            ['code' => 'NURS-CARE', 'name' => '24-Hour Nursing Care', 'type' => 'ipd', 'price' => 1000.00],
            ['code' => 'OT-PROC', 'name' => 'Minor OT Surgery Fee', 'type' => 'procedure', 'price' => 5000.00],
            ['code' => 'PHYS-SESS', 'name' => 'Physiotherapy Session', 'type' => 'rehab', 'price' => 400.00],
        ];

        foreach ($services as $serviceData) {
            $price = $serviceData['price'];
            unset($serviceData['price']);
            $serviceData['is_active'] = true;

            $service = Service::create($serviceData);

            ServicePrice::create([
                'service_id' => $service->id,
                'price' => $price,
                'is_current' => true,
            ]);
        }

        $this->command->info(count($services) . ' services with prices seeded successfully!');
    }
}
