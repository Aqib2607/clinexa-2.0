<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VitalSign;
use App\Models\Admission;
use App\Models\User;

class VitalSignSeeder extends Seeder
{
    public function run(): void
    {
        $admissions = Admission::all();
        $nurse = User::where('role', 'nurse')->first() ?? User::first();

        if ($admissions->isEmpty()) {
            return;
        }

        for ($i = 0; $i < 15; $i++) {
            $adm = $admissions[$i % $admissions->count()];
            VitalSign::create([
                'admission_id' => $adm->id,
                'bp_systolic' => 115 + ($i % 25),
                'bp_diastolic' => 75 + ($i % 15),
                'pulse' => 70 + ($i % 20),
                'temperature' => 98.4 + (($i % 10) * 0.2),
                'spo2' => 96 + ($i % 4),
                'respiratory_rate' => 16 + ($i % 6),
                'recorded_at' => now()->subHours($i * 4),
                'recorded_by' => $nurse->id,
            ]);
        }

        $this->command->info('15 vital signs seeded successfully!');
    }
}
