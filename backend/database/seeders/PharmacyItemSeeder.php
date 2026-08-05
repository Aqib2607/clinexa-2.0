<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PharmacyItem;

class PharmacyItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        PharmacyItem::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $items = [
            [
                'name' => 'Amoxicillin 500mg',
                'generic_name' => 'Amoxicillin',
                'brand_name' => 'Amox',
                'unit' => 'capsule',
                'reorder_level' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Metformin 500mg',
                'generic_name' => 'Metformin Hydrochloride',
                'brand_name' => 'Glucophage',
                'unit' => 'tablet',
                'reorder_level' => 200,
                'is_active' => true,
            ],
            [
                'name' => 'Amlodipine 5mg',
                'generic_name' => 'Amlodipine Besylate',
                'brand_name' => 'Norvasc',
                'unit' => 'tablet',
                'reorder_level' => 150,
                'is_active' => true,
            ],
            [
                'name' => 'Paracetamol 500mg',
                'generic_name' => 'Acetaminophen',
                'brand_name' => 'Tylenol',
                'unit' => 'tablet',
                'reorder_level' => 500,
                'is_active' => true,
            ],
            [
                'name' => 'Omeprazole 20mg',
                'generic_name' => 'Omeprazole',
                'brand_name' => 'Prilosec',
                'unit' => 'capsule',
                'reorder_level' => 100,
                'is_active' => true,
            ],
        ];

        foreach ($items as $itemData) {
            PharmacyItem::create($itemData);
        }

        $this->command->info('5 pharmacy items seeded successfully!');
    }
}
