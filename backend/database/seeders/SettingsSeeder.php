<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'hospital_name', 'value' => 'Clinexa Hospital & Research Center', 'group' => 'general'],
            ['key' => 'address', 'value' => 'Hafiz Nagar, Sonadanga, Khulna, Bangladesh', 'group' => 'contact'],
            ['key' => 'phone', 'value' => '+880 1946-664836', 'group' => 'contact'],
            ['key' => 'email', 'value' => 'clinexabd@gmail.com', 'group' => 'contact'],
            ['key' => 'tagline', 'value' => 'Your trusted partner in healthcare excellence', 'group' => 'general'],
            ['key' => 'emergency_hotline', 'value' => '+880 1900-112233', 'group' => 'contact'],
            ['key' => 'currency_symbol', 'value' => '$', 'group' => 'finance'],
            ['key' => 'currency_code', 'value' => 'USD', 'group' => 'finance'],
            ['key' => 'tax_percentage', 'value' => '5.0', 'group' => 'finance'],
            ['key' => 'time_zone', 'value' => 'Asia/Dhaka', 'group' => 'general'],
            ['key' => 'appointment_slot_duration', 'value' => '30', 'group' => 'clinical'],
            ['key' => 'enable_sms_notifications', 'value' => 'true', 'group' => 'notifications'],
            ['key' => 'enable_email_notifications', 'value' => 'true', 'group' => 'notifications'],
            ['key' => 'max_opd_daily_appointments', 'value' => '100', 'group' => 'clinical'],
            ['key' => 'ipd_deposit_requirement', 'value' => '5000', 'group' => 'finance'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'group' => $setting['group'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $this->command->info(count($settings) . ' settings seeded successfully!');
    }
}
