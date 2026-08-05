<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'hospital_name', 'value' => 'Clinexa', 'group' => 'general'],
            ['key' => 'address', 'value' => 'Hafiz Nagar, Sonadanga, Khulna, Bangladesh', 'group' => 'contact'],
            ['key' => 'phone', 'value' => '+880 1946-664836', 'group' => 'contact'],
            ['key' => 'email', 'value' => 'clinexabd@gmail.com', 'group' => 'contact'],
            ['key' => 'tagline', 'value' => 'Your trusted partner in healthcare excellence', 'group' => 'general'],
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
    }
}
