<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\ServicePrice;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Service::truncate();
        ServicePrice::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $services = [
            [
                'code' => 'CONS-GEN',
                'name' => 'General Consultation',
                'type' => 'consultation',
                'is_active' => true,
                'price' => 500.00,
            ],
            [
                'code' => 'XR-CHEST',
                'name' => 'Chest X-Ray',
                'type' => 'radiology',
                'is_active' => true,
                'price' => 800.00,
            ],
            [
                'code' => 'LAB-CBC',
                'name' => 'Complete Blood Count',
                'type' => 'laboratory',
                'is_active' => true,
                'price' => 300.00,
            ],
            [
                'code' => 'ECG-12',
                'name' => '12-Lead ECG',
                'type' => 'diagnostic',
                'is_active' => true,
                'price' => 600.00,
            ],
            [
                'code' => 'USG-ABD',
                'name' => 'Abdominal Ultrasound',
                'type' => 'radiology',
                'is_active' => true,
                'price' => 1200.00,
            ],
        ];

        foreach ($services as $serviceData) {
            $price = $serviceData['price'];
            unset($serviceData['price']);

            $service = Service::create($serviceData);

            // Create price
            ServicePrice::create([
                'service_id' => $service->id,
                'price' => $price,
                'is_current' => true,
            ]);
        }

        $this->command->info('5 services with prices seeded successfully!');
    }
}
