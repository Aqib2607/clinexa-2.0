<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\DoctorSchedule;

class DoctorScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $doctors = User::where('role', 'doctor')->get();
        if ($doctors->isEmpty()) {
            return;
        }

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $count = 0;

        foreach ($doctors->take(15) as $doctor) {
            foreach (['Monday', 'Wednesday', 'Friday'] as $day) {
                DoctorSchedule::create([
                    'doctor_id' => $doctor->id,
                    'day_of_week' => $day,
                    'start_time' => '09:00:00',
                    'end_time' => '13:00:00',
                    'is_available' => true,
                    'slot_duration' => '30',
                    'notes' => 'Morning consultation hours',
                ]);
                $count++;
            }
        }

        $this->command->info($count . ' doctor schedules seeded successfully!');
    }
}
