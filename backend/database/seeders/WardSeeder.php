<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ward;
use App\Models\Bed;

class WardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Ward::truncate();
        Bed::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $wards = [
            [
                'name' => 'General Ward',
                'type' => 'general',
                'description' => 'General patient ward',
                'is_active' => true,
                'beds' => [
                    ['number' => 'G-101', 'type' => 'general', 'daily_charge' => 1500.00, 'status' => 'available'],
                    ['number' => 'G-102', 'type' => 'general', 'daily_charge' => 1500.00, 'status' => 'occupied'],
                    ['number' => 'G-103', 'type' => 'general', 'daily_charge' => 1500.00, 'status' => 'available'],
                ],
            ],
            [
                'name' => 'ICU',
                'type' => 'icu',
                'description' => 'Intensive Care Unit',
                'is_active' => true,
                'beds' => [
                    ['number' => 'ICU-01', 'type' => 'icu', 'daily_charge' => 5000.00, 'status' => 'occupied'],
                    ['number' => 'ICU-02', 'type' => 'icu', 'daily_charge' => 5000.00, 'status' => 'available'],
                ],
            ],
            [
                'name' => 'Private Ward',
                'type' => 'private',
                'description' => 'Private patient rooms',
                'is_active' => true,
                'beds' => [
                    ['number' => 'P-201', 'type' => 'private', 'daily_charge' => 3500.00, 'status' => 'available'],
                    ['number' => 'P-202', 'type' => 'private', 'daily_charge' => 3500.00, 'status' => 'maintenance'],
                    ['number' => 'P-203', 'type' => 'private', 'daily_charge' => 3500.00, 'status' => 'available'],
                ],
            ],
        ];

        foreach ($wards as $wardData) {
            $beds = $wardData['beds'];
            unset($wardData['beds']);

            $ward = Ward::create($wardData);

            foreach ($beds as $bedData) {
                $bedData['ward_id'] = $ward->id;
                Bed::create($bedData);
            }
        }

        $this->command->info('3 wards with 8 beds seeded successfully!');
    }
}
