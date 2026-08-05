<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AppointmentSlot;
use App\Models\Doctor;

class AppointmentSlotSeeder extends Seeder
{
    public function run(): void
    {
        $doctors = Doctor::take(5)->get();

        if ($doctors->isEmpty()) {
            $this->command->error('No doctors found! Please seed doctors first.');
            return;
        }

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $times = [
            ['09:00:00', '10:00:00'],
            ['10:00:00', '11:00:00'],
            ['11:00:00', '12:00:00'],
            ['14:00:00', '15:00:00'],
        ];

        $count = 0;
        foreach ($doctors as $dIdx => $doc) {
            foreach ($days as $dayIdx => $day) {
                if ($count >= 15) break 2;
                $t = $times[$dayIdx % count($times)];
                AppointmentSlot::create([
                    'doctor_id' => $doc->id,
                    'date' => now()->addDays($dayIdx + 1)->format('Y-m-d'),
                    'day_of_week' => $day,
                    'start_time' => $t[0],
                    'end_time' => $t[1],
                    'capacity' => 5,
                    'status' => 'available',
                ]);
                $count++;
            }
        }

        $this->command->info($count . ' appointment slots seeded successfully!');
    }
}
