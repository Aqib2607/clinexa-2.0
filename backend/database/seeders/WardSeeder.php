<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ward;
use App\Models\Bed;

class WardSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Ward::truncate();
        Bed::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $wards = [
            ['name' => 'Male General Ward', 'type' => 'general', 'desc' => 'General ward for male adult patients', 'rate' => 1500.00],
            ['name' => 'Female General Ward', 'type' => 'general', 'desc' => 'General ward for female adult patients', 'rate' => 1500.00],
            ['name' => 'Medical ICU (MICU)', 'type' => 'icu', 'desc' => 'Intensive Care Unit for critical patients', 'rate' => 6000.00],
            ['name' => 'Surgical ICU (SICU)', 'type' => 'icu', 'desc' => 'Post-operative intensive care unit', 'rate' => 6500.00],
            ['name' => 'Pediatric Ward', 'type' => 'pediatric', 'desc' => 'Specialized ward for children & infants', 'rate' => 2000.00],
            ['name' => 'Neonatal ICU (NICU)', 'type' => 'icu', 'desc' => 'Newborn intensive care unit', 'rate' => 7000.00],
            ['name' => 'Deluxe Private Suite A', 'type' => 'private', 'desc' => 'Air-conditioned single private room', 'rate' => 4500.00],
            ['name' => 'Deluxe Private Suite B', 'type' => 'private', 'desc' => 'Luxury private room with attendant bed', 'rate' => 5000.00],
            ['name' => 'Maternity Ward', 'type' => 'maternity', 'desc' => 'Post-delivery mother & child care', 'rate' => 2500.00],
            ['name' => 'Emergency Observation Ward', 'type' => 'emergency', 'desc' => 'Short-stay emergency observation', 'rate' => 1800.00],
        ];

        $totalBeds = 0;
        foreach ($wards as $wIdx => $w) {
            $ward = Ward::create([
                'name' => $w['name'],
                'type' => $w['type'],
                'description' => $w['desc'],
                'is_active' => true,
            ]);

            for ($b = 1; $b <= 3; $b++) {
                Bed::create([
                    'ward_id' => $ward->id,
                    'number' => strtoupper(substr($w['type'], 0, 3)) . '-' . sprintf('%02d', ($wIdx * 3) + $b),
                    'type' => $w['type'],
                    'daily_charge' => $w['rate'],
                    'status' => $b % 2 === 0 ? 'occupied' : 'available',
                ]);
                $totalBeds++;
            }
        }

        $this->command->info(count($wards) . " wards and {$totalBeds} beds seeded successfully!");
    }
}
