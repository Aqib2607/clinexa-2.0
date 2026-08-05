<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name'     => 'Test User',
                'phone'    => '0000000000',
                'password' => Hash::make('password123'),
                'role'     => 'doctor',
            ]
        );

        User::firstOrCreate(
            ['email' => 'admin01@gmail.com'],
            [
                'name'     => 'Super Admin',
                'phone'    => '0000000001',
                'password' => Hash::make('password123'),
                'role'     => 'super_admin',
            ]
        );

        $this->call([
            HospitalSeeder::class,
            DepartmentSeeder::class,
            DoctorSeeder::class,
            DoctorScheduleSeeder::class,
            PatientSeeder::class,
            EmployeeSeeder::class,
            AppointmentSlotSeeder::class,
            AppointmentSeeder::class,
            VisitSeeder::class,
            ServiceSeeder::class,
            PrescriptionSeeder::class,
            BillSeeder::class,
            PaymentSeeder::class,
            PharmacyItemSeeder::class,
            TestSeeder::class,
            LabResultSeeder::class,
            WardSeeder::class,
            NursePortalSeeder::class,
            NurseTaskSeeder::class,
            PatientNoteSeeder::class,
            VitalSignSeeder::class,
            InventorySeeder::class,
            HrSeeder::class,
            AccountsSeeder::class,
            CafeteriaSeeder::class,
            Phase6AutomationSeeder::class,
            SmsTemplateSeeder::class,
            SystemUpdateSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
