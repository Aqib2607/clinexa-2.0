<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VitalSign;
use App\Models\Admission;
use App\Models\User;

class VitalSignSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        VitalSign::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        // VitalSigns require admissions, which we haven't seeded yet
        // For simplicity, we'll create vital signs only if admissions exist
        $admissions = Admission::limit(5)->get();
        $nurse = User::where('role', 'nurse')->first();

        if ($admissions->count() < 1) {
            $this->command->warn('No admissions found. Skipping vital signs seeding.');
            $this->command->info('Note: Run AdmissionSeeder first for vital signs data.');
            return;
        }

        if (!$nurse) {
            $this->command->warn('No nurse user found. Using first available user.');
            $nurse = User::first();
        }

        $vitalSigns = [];

        foreach ($admissions as $index => $admission) {
            $vitalSigns[] = [
                'admission_id' => $admission->id,
                'bp_systolic' => 120 + ($index * 5),
                'bp_diastolic' => 80 + ($index * 2),
                'pulse' => 72 + ($index * 3),
                'temperature' => 98.6 + ($index * 0.2),
                'spo2' => 98 - $index,
                'respiratory_rate' => 16 + $index,
                'recorded_at' => now()->subHours($index * 6),
                'recorded_by' => $nurse->id,
            ];
        }

        foreach ($vitalSigns as $vitalData) {
            VitalSign::create($vitalData);
        }

        $this->command->info(count($vitalSigns) . ' vital signs seeded successfully!');
    }
}
