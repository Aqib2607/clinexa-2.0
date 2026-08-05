<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HospitalSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            DB::table('hospitals')->insertOrIgnore([
                'id' => $i,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
