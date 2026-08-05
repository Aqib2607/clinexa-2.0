<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Test;
use App\Models\TestPanel;
use App\Models\SpecimenSample;
use Illuminate\Support\Facades\Schema;

class TestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Test::truncate();
        Schema::enableForeignKeyConstraints();

        $tests = [
            [
                'code' => 'CBC',
                'name' => 'Complete Blood Count',
                'method' => 'Automated Counter',
                'price' => 300.00,
                'is_active' => true,
                'range_info' => [
                    'hemoglobin' => ['male' => '13.5-17.5', 'female' => '12.0-15.5'],
                    'wbc' => '4000-11000'
                ]
            ],
            [
                'code' => 'FBS',
                'name' => 'Fasting Blood Sugar',
                'method' => 'Hexokinase',
                'price' => 150.00,
                'is_active' => true,
                'range_info' => ['normal' => '70-100 mg/dL']
            ],
            [
                'code' => 'LIPID',
                'name' => 'Lipid Profile',
                'method' => 'Enzymatic',
                'price' => 500.00,
                'is_active' => true,
                'range_info' => ['total_cholesterol' => '<200 mg/dL']
            ],
            [
                'code' => 'TFT',
                'name' => 'Thyroid Function Test',
                'method' => 'CLIA',
                'price' => 600.00,
                'is_active' => true,
                'range_info' => ['tsh' => '0.4-4.0 mIU/L']
            ],
            [
                'code' => 'LFT',
                'name' => 'Liver Function Test',
                'method' => 'Spectrophotometry',
                'price' => 450.00,
                'is_active' => true,
                'range_info' => ['alt' => '7-56', 'ast' => '10-40']
            ],
        ];

        foreach ($tests as $testData) {
            Test::create($testData);
        }

        $this->command->info('5 tests seeded successfully!');
    }
}
