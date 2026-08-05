<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemUpdate;

class SystemUpdateSeeder extends Seeder
{
    public function run(): void
    {
        $updates = [
            ['title' => 'Scheduled System Maintenance', 'message' => 'The system will be down for routine maintenance on Sunday from 2:00 AM to 4:00 AM.', 'type' => 'maintenance', 'scheduled_at' => now()->addDays(5)->setTime(2, 0)],
            ['title' => 'New Feature: Patient Portal v2.0', 'message' => 'We have launched an enhanced patient portal! Patients can now view lab results, prescriptions, and pay bills online.', 'type' => 'feature', 'scheduled_at' => null],
            ['title' => 'Important Security Audit', 'message' => 'Please update your password every 90 days to maintain healthcare data compliance.', 'type' => 'alert', 'scheduled_at' => null],
            ['title' => 'EMR System Upgrade Notice', 'message' => 'Electronic Medical Record system upgraded to version 2.4 with improved response times.', 'type' => 'feature', 'scheduled_at' => null],
            ['title' => 'New ICU Equipment Integration', 'message' => 'ICU vital monitors are now auto-synced with the nursing workstation portal.', 'type' => 'feature', 'scheduled_at' => null],
            ['title' => 'Pharmacy Inventory Audit', 'message' => 'Annual stock count scheduled for next Friday. All pharmacy transactions will be audited.', 'type' => 'maintenance', 'scheduled_at' => now()->addDays(7)],
            ['title' => 'Radiology PACS Integration', 'message' => 'High-resolution DICOM imaging viewer is now available directly in doctor portal.', 'type' => 'feature', 'scheduled_at' => null],
            ['title' => 'HIPAA & Data Privacy Protocol', 'message' => 'Mandatory annual data privacy training for all clinical and administrative staff.', 'type' => 'alert', 'scheduled_at' => null],
            ['title' => 'Lab Automation Machine Interface', 'message' => 'Beckman Coulter & Roche chemistry analyzers are now transmitting automated test results.', 'type' => 'feature', 'scheduled_at' => null],
            ['title' => 'Tele-consultation Module Release', 'message' => 'Doctors can now schedule video consultations for remote patient follow-ups.', 'type' => 'feature', 'scheduled_at' => null],
        ];

        foreach ($updates as $u) {
            $u['is_active'] = true;
            SystemUpdate::create($u);
        }

        $this->command->info(count($updates) . ' system updates seeded successfully!');
    }
}
