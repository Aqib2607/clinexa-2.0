<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemUpdateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $updates = [
            [
                'title' => 'Scheduled System Maintenance',
                'message' => 'The system will be down for maintenance on February 15, 2026 from 2:00 AM to 4:00 AM. Please save your work before this time.',
                'type' => 'maintenance',
                'is_active' => true,
                'scheduled_at' => now()->addDays(5)->setTime(2, 0)
            ],
            [
                'title' => 'New Feature: Patient Portal',
                'message' => 'We have launched a new patient portal! Patients can now view their lab results, prescriptions, and bills online.',
                'type' => 'feature',
                'is_active' => true,
                'scheduled_at' => null
            ],
            [
                'title' => 'Important Security Update',
                'message' => 'Please update your password if you have not done so in the last 90 days. Strong passwords help keep patient data secure.',
                'type' => 'alert',
                'is_active' => false,
                'scheduled_at' => null
            ]
        ];

        foreach ($updates as $update) {
            \App\Models\SystemUpdate::create($update);
        }
    }
}
