<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AppointmentSlot;
use App\Models\Doctor;

class AppointmentSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first available doctor
        $doctor = Doctor::first();

        if (!$doctor) {
            $this->command->error('No doctors found! Please seed doctors first.');
            return;
        }

        $slots = [
            [
                'doctor_id' => $doctor->id,
                'date' => now()->addDays(1)->format('Y-m-d'),
                'day_of_week' => 'Monday',
                'start_time' => '09:00:00',
                'end_time' => '10:00:00',
                'capacity' => 5,
                'status' => 'available',
            ],
            [
                'doctor_id' => $doctor->id,
                'date' => now()->addDays(1)->format('Y-m-d'),
                'day_of_week' => 'Monday',
                'start_time' => '10:00:00',
                'end_time' => '11:00:00',
                'capacity' => 5,
                'status' => 'available',
            ],
            [
                'doctor_id' => $doctor->id,
                'date' => now()->addDays(2)->format('Y-m-d'),
                'day_of_week' => 'Tuesday',
                'start_time' => '14:00:00',
                'end_time' => '15:00:00',
                'capacity' => 5,
                'status' => 'available',
            ],
            [
                'doctor_id' => $doctor->id,
                'date' => now()->addDays(3)->format('Y-m-d'),
                'day_of_week' => 'Wednesday',
                'start_time' => '09:00:00',
                'end_time' => '10:00:00',
                'capacity' => 5,
                'status' => 'available',
            ],
            [
                'doctor_id' => $doctor->id,
                'date' => now()->addDays(4)->format('Y-m-d'),
                'day_of_week' => 'Thursday',
                'start_time' => '16:00:00',
                'end_time' => '17:00:00',
                'capacity' => 3,
                'status' => 'available',
            ],
        ];

        foreach ($slots as $slotData) {
            AppointmentSlot::create($slotData);
        }

        $this->command->info('5 appointment slots seeded successfully!');
    }
}
