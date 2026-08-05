<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Patient;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\LabResult;
use App\Models\RadiologyResult;
use App\Models\ItemBatch;

class Phase6AutomationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create(['name' => 'System Admin', 'email' => 'admin_p6@hospital.com']);
        $patients = Patient::all();
        $admissions = Admission::all();
        $beds = Bed::all();
        $labResults = LabResult::all();
        $radResults = RadiologyResult::all();
        $itemBatches = ItemBatch::all();

        // 1. Lab Machine Configs (10 machines)
        $machines = [
            ['name' => 'Beckman Coulter AU480', 'ip' => '192.168.1.101', 'port' => 5000, 'proto' => 'ASTM'],
            ['name' => 'Sysmex XN-1000 Hematology', 'ip' => '192.168.1.102', 'port' => 5001, 'proto' => 'HL7'],
            ['name' => 'Roche Cobas c311 Analyzer', 'ip' => '192.168.1.103', 'port' => 5002, 'proto' => 'ASTM'],
            ['name' => 'Abbott Architect i1000SR', 'ip' => '192.168.1.104', 'port' => 5003, 'proto' => 'HL7'],
            ['name' => 'Siemens Atellica Solution', 'ip' => '192.168.1.105', 'port' => 5004, 'proto' => 'ASTM'],
            ['name' => 'Bio-Rad Variant II Turbo', 'ip' => '192.168.1.106', 'port' => 5005, 'proto' => 'SERIAL'],
            ['name' => 'Mindray BS-240 Chemistry', 'ip' => '192.168.1.107', 'port' => 5006, 'proto' => 'ASTM'],
            ['name' => 'Stago Compact Max Coagulation', 'ip' => '192.168.1.108', 'port' => 5007, 'proto' => 'HL7'],
            ['name' => 'Radiometer ABL90 FLEX Blood Gas', 'ip' => '192.168.1.109', 'port' => 5008, 'proto' => 'ASTM'],
            ['name' => 'Thermo Scientific Phadia 250', 'ip' => '192.168.1.110', 'port' => 5009, 'proto' => 'HL7'],
        ];

        $machineIds = [];
        foreach ($machines as $m) {
            $id = Str::uuid()->toString();
            $machineIds[] = $id;
            DB::table('lab_machine_configs')->insert([
                'id' => $id,
                'machine_name' => $m['name'],
                'ip_address' => $m['ip'],
                'port' => $m['port'],
                'protocol' => $m['proto'],
                'connection_settings' => json_encode(['baud_rate' => 9600, 'parity' => 'none']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Lab Machine Logs (15 machine logs)
        for ($i = 1; $i <= 15; $i++) {
            DB::table('lab_machine_logs')->insert([
                'id' => Str::uuid()->toString(),
                'machine_id' => $machineIds[$i % count($machineIds)],
                'raw_data' => "H|\\^&|||MachineAU480||||||P|1\rO|1|SAMPLE-" . sprintf('%04d', $i) . "||^^^GLU\rR|1|^^^GLU|105|mg/dL||N",
                'direction' => 'IN',
                'status' => 'processed',
                'processing_error' => null,
                'created_at' => now()->subHours($i),
                'updated_at' => now()->subHours($i),
            ]);
        }

        // 3. SMS Logs (15 SMS logs)
        for ($i = 1; $i <= 15; $i++) {
            DB::table('sms_logs')->insert([
                'id' => Str::uuid()->toString(),
                'mobile_number' => '+155501' . sprintf('%02d', $i),
                'message_body' => "Dear Patient, your lab report #" . $i . " is ready. Download from your patient portal.",
                'event_name' => 'report_ready',
                'status' => 'sent',
                'provider_response' => 'SUCCESS_GATEWAY_200',
                'created_at' => now()->subHours($i * 2),
                'updated_at' => now()->subHours($i * 2),
            ]);
        }

        // 4. Secure Links (10 secure links)
        foreach ($patients->take(10) as $idx => $p) {
            DB::table('secure_links')->insert([
                'id' => Str::uuid()->toString(),
                'patient_id' => $p->id,
                'resource_type' => 'lab_report',
                'resource_id' => Str::uuid()->toString(),
                'token' => Str::random(32),
                'expires_at' => now()->addDays(7),
                'access_count' => rand(0, 5),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Email Logs (12 email logs)
        for ($i = 1; $i <= 12; $i++) {
            DB::table('email_logs')->insert([
                'id' => Str::uuid()->toString(),
                'recipient_email' => "patient{$i}@example.com",
                'subject' => "Hospital Notification - Update #" . $i,
                'body' => "Dear Patient, this is an automated update regarding your upcoming appointment.",
                'event_name' => 'appointment_reminder',
                'status' => 'sent',
                'sent_at' => now()->subHours($i),
                'error_message' => null,
                'created_at' => now()->subHours($i),
                'updated_at' => now()->subHours($i),
            ]);
        }

        // 6. Notifications (15 notifications)
        for ($i = 1; $i <= 15; $i++) {
            DB::table('notifications')->insert([
                'user_id' => $admin->id,
                'type' => 'system',
                'title' => 'System Notification #' . $i,
                'message' => 'New clinical record registered in system.',
                'is_read' => $i % 2 === 0,
                'read_at' => $i % 2 === 0 ? now() : null,
                'data' => json_encode(['event' => 'record_updated']),
                'created_at' => now()->subHours($i),
                'updated_at' => now()->subHours($i),
            ]);
        }

        // 7. Bed Transfers (10 bed transfers)
        if ($admissions->count() >= 2 && $beds->count() >= 2) {
            for ($i = 1; $i <= 10; $i++) {
                $adm = $admissions[$i % $admissions->count()];
                $bed1 = $beds[$i % $beds->count()];
                $bed2 = $beds[($i + 1) % $beds->count()];
                DB::table('bed_transfers')->insert([
                    'id' => Str::uuid()->toString(),
                    'admission_id' => $adm->id,
                    'from_bed_id' => $bed1->id,
                    'to_bed_id' => $bed2->id,
                    'transfer_date' => now()->subDays($i),
                    'reason' => 'Patient condition required transfer to ICU/Step-down unit',
                    'transferred_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 8. IPD Charges (15 charges)
        if ($admissions->isNotEmpty()) {
            for ($i = 1; $i <= 15; $i++) {
                $adm = $admissions[$i % $admissions->count()];
                DB::table('ipd_charges')->insert([
                    'id' => Str::uuid()->toString(),
                    'admission_id' => $adm->id,
                    'service_id' => null,
                    'charge_name' => $i % 2 === 0 ? 'Daily Bed Charge' : 'Nursing Care Fee',
                    'amount' => 150.00 * ($i % 5 + 1),
                    'charge_date' => now()->subDays($i),
                    'note' => 'Daily routine IPD charge',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 9. IPD Payments (12 payments)
        if ($admissions->isNotEmpty()) {
            for ($i = 1; $i <= 12; $i++) {
                $adm = $admissions[$i % $admissions->count()];
                DB::table('ipd_payments')->insert([
                    'id' => Str::uuid()->toString(),
                    'admission_id' => $adm->id,
                    'amount' => 500.00 * ($i % 4 + 1),
                    'payment_method' => $i % 2 === 0 ? 'card' : 'cash',
                    'transaction_reference' => 'IPD-PAY-REF-' . rand(10000, 99999),
                    'payment_date' => now()->subDays($i),
                    'notes' => 'Advance IPD payment deposit',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 10. OT Bookings (10 OT bookings)
        if ($admissions->isNotEmpty()) {
            for ($i = 1; $i <= 10; $i++) {
                $adm = $admissions[$i % $admissions->count()];
                DB::table('ot_bookings')->insert([
                    'id' => Str::uuid()->toString(),
                    'admission_id' => $adm->id,
                    'ot_room' => 'Operation Theater #' . ($i % 3 + 1),
                    'surgeon_id' => $admin->id,
                    'anesthesiologist_id' => $admin->id,
                    'scheduled_at' => now()->addDays($i)->setHour(9)->setMinute(0),
                    'status' => 'scheduled',
                    'notes' => 'Laparoscopic procedure scheduled',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 11. IPD Pharmacy Issues (12 pharmacy issues)
        if ($admissions->isNotEmpty() && $itemBatches->isNotEmpty()) {
            for ($i = 1; $i <= 12; $i++) {
                $adm = $admissions[$i % $admissions->count()];
                $batch = $itemBatches[$i % $itemBatches->count()];
                DB::table('ipd_pharmacy_issues')->insert([
                    'id' => Str::uuid()->toString(),
                    'admission_id' => $adm->id,
                    'item_batch_id' => $batch->id,
                    'quantity' => rand(1, 5),
                    'issued_at' => now()->subHours($i * 4),
                    'issued_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 12. Lab Addendums & Dispatch Logs (10 addendums, 12 logs)
        if ($labResults->isNotEmpty()) {
            for ($i = 1; $i <= 10; $i++) {
                $lr = $labResults[$i % $labResults->count()];
                DB::table('lab_addendums')->insert([
                    'id' => Str::uuid()->toString(),
                    'lab_result_id' => $lr->id,
                    'note' => 'Addendum: Verified repeat analysis confirmed initial parameters.',
                    'added_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            for ($i = 1; $i <= 12; $i++) {
                $lr = $labResults[$i % $labResults->count()];
                DB::table('lab_dispatch_logs')->insert([
                    'id' => Str::uuid()->toString(),
                    'lab_result_id' => $lr->id,
                    'dispatched_to' => $i % 2 === 0 ? 'Patient' : 'Attending Doctor',
                    'dispatch_method' => $i % 2 === 0 ? 'Portal' : 'Email',
                    'dispatched_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 13. Radiology Addendums (10 addendums)
        if ($radResults->isNotEmpty()) {
            for ($i = 1; $i <= 10; $i++) {
                $rr = $radResults[$i % $radResults->count()];
                DB::table('radiology_addendums')->insert([
                    'id' => Str::uuid()->toString(),
                    'radiology_result_id' => $rr->id,
                    'note' => 'Radiology Addendum: Additional 3D reconstruction images reviewed.',
                    'added_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Phase 6 automation tables seeded successfully!');
    }
}
