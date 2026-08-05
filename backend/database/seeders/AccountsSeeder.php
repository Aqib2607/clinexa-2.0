<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AccountsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create(['name' => 'Finance Admin', 'email' => 'finance_admin@hospital.com']);

        // 1. Chart of Accounts (15 accounts)
        $accounts = [
            ['code' => '1010', 'name' => 'Cash in Hand', 'type' => 'asset'],
            ['code' => '1020', 'name' => 'City Bank Operating Account', 'type' => 'asset'],
            ['code' => '1030', 'name' => 'Accounts Receivable', 'type' => 'asset'],
            ['code' => '1040', 'name' => 'Medical Inventory Asset', 'type' => 'asset'],
            ['code' => '1050', 'name' => 'Hospital Furniture & Fixtures', 'type' => 'asset'],
            ['code' => '2010', 'name' => 'Accounts Payable - Vendors', 'type' => 'liability'],
            ['code' => '2020', 'name' => 'Salaries Payable', 'type' => 'liability'],
            ['code' => '2030', 'name' => 'Tax Payable', 'type' => 'liability'],
            ['code' => '3010', 'name' => 'Hospital Capital Fund', 'type' => 'equity'],
            ['code' => '3020', 'name' => 'Retained Earnings', 'type' => 'equity'],
            ['code' => '4010', 'name' => 'OPD Consultation Revenue', 'type' => 'income'],
            ['code' => '4020', 'name' => 'IPD Bed & Nursing Revenue', 'type' => 'income'],
            ['code' => '4030', 'name' => 'Pharmacy Sales Revenue', 'type' => 'income'],
            ['code' => '5010', 'name' => 'Doctor & Staff Salary Expense', 'type' => 'expense'],
            ['code' => '5020', 'name' => 'Utility & Electricity Expense', 'type' => 'expense'],
        ];

        $coaIds = [];
        foreach ($accounts as $acc) {
            $id = Str::uuid()->toString();
            $coaIds[] = $id;
            DB::table('chart_of_accounts')->insert([
                'id' => $id,
                'code' => $acc['code'],
                'name' => $acc['name'],
                'type' => $acc['type'],
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Cost Centers (10 cost centers)
        $costCenters = [
            ['name' => 'Cardiology Department', 'code' => 'CC-CARD'],
            ['name' => 'Neurology Department', 'code' => 'CC-NEUR'],
            ['name' => 'Orthopedics Department', 'code' => 'CC-ORTH'],
            ['name' => 'Pediatrics Department', 'code' => 'CC-PED'],
            ['name' => 'General Administration', 'code' => 'CC-ADMIN'],
            ['name' => 'Central Pharmacy', 'code' => 'CC-PHARM'],
            ['name' => 'Diagnostic Laboratory', 'code' => 'CC-LAB'],
            ['name' => 'Radiology & Imaging', 'code' => 'CC-RAD'],
            ['name' => 'Inpatient Wards (IPD)', 'code' => 'CC-IPD'],
            ['name' => 'Emergency Department', 'code' => 'CC-EMG'],
        ];

        $costCenterIds = [];
        foreach ($costCenters as $cc) {
            $id = Str::uuid()->toString();
            $costCenterIds[] = $id;
            DB::table('cost_centers')->insert([
                'id' => $id,
                'name' => $cc['name'],
                'code' => $cc['code'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Vouchers & Entries (12 vouchers, 24 entries)
        $voucherIds = [];
        for ($i = 1; $i <= 12; $i++) {
            $vId = Str::uuid()->toString();
            $voucherIds[] = $vId;
            DB::table('vouchers')->insert([
                'id' => $vId,
                'voucher_no' => 'VOUCH-2026-' . sprintf('%03d', $i),
                'date' => now()->subDays($i * 2)->toDateString(),
                'type' => $i % 2 === 0 ? 'receipt' : 'payment',
                'cost_center_id' => $costCenterIds[$i % count($costCenterIds)],
                'narration' => 'Financial transaction #' . $i . ' for department operations',
                'reference' => 'REF-' . rand(1000, 9999),
                'is_posted' => true,
                'created_by' => $admin->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Entry 1 (Debit)
            DB::table('voucher_entries')->insert([
                'id' => Str::uuid()->toString(),
                'voucher_id' => $vId,
                'coa_id' => $coaIds[$i % 5], // Asset account
                'debit' => 1500.00 * $i,
                'credit' => 0.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Entry 2 (Credit)
            DB::table('voucher_entries')->insert([
                'id' => Str::uuid()->toString(),
                'voucher_id' => $vId,
                'coa_id' => $coaIds[10 + ($i % 5)], // Revenue or Expense account
                'debit' => 0.00,
                'credit' => 1500.00 * $i,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Assets & Depreciations (12 assets, 12 depreciations)
        $assetData = [
            ['name' => 'Siemens MRI Scanner 3T', 'code' => 'AST-001', 'val' => 250000.00, 'life' => 10, 'loc' => 'Radiology Rm 1'],
            ['name' => 'GE Ultrasound Machine', 'code' => 'AST-002', 'val' => 45000.00, 'life' => 7, 'loc' => 'OPD Room 102'],
            ['name' => 'Mindray ICU Ventilator A', 'code' => 'AST-003', 'val' => 18000.00, 'life' => 5, 'loc' => 'ICU Bed 01'],
            ['name' => 'Mindray ICU Ventilator B', 'code' => 'AST-004', 'val' => 18000.00, 'life' => 5, 'loc' => 'ICU Bed 02'],
            ['name' => 'Defibrillator Unit ER-1', 'code' => 'AST-005', 'val' => 8500.00, 'life' => 5, 'loc' => 'Emergency Room'],
            ['name' => 'Operation Theater Table Hydraulic', 'code' => 'AST-006', 'val' => 22000.00, 'life' => 8, 'loc' => 'OT 1'],
            ['name' => 'Anesthesia Machine Draeger', 'code' => 'AST-007', 'val' => 35000.00, 'life' => 7, 'loc' => 'OT 2'],
            ['name' => 'ECG Machine 12-Channel', 'code' => 'AST-008', 'val' => 4200.00, 'life' => 5, 'loc' => 'Cardiology Lab'],
            ['name' => 'Hospital Generator 250kVA', 'code' => 'AST-009', 'val' => 60000.00, 'life' => 15, 'loc' => 'Power House'],
            ['name' => 'Autoclave Sterilizer Large', 'code' => 'AST-010', 'val' => 12500.00, 'life' => 8, 'loc' => 'CSSD Dept'],
            ['name' => 'Patient Monitor Multi-Para 1', 'code' => 'AST-011', 'val' => 3500.00, 'life' => 5, 'loc' => 'CCU Ward'],
            ['name' => 'Patient Monitor Multi-Para 2', 'code' => 'AST-012', 'val' => 3500.00, 'life' => 5, 'loc' => 'CCU Ward'],
        ];

        foreach ($assetData as $idx => $ast) {
            $astId = Str::uuid()->toString();
            DB::table('assets')->insert([
                'id' => $astId,
                'name' => $ast['name'],
                'asset_code' => $ast['code'],
                'coa_id' => $coaIds[4], // Hospital Furniture & Fixtures / Fixed Asset
                'purchase_date' => now()->subYears(1)->toDateString(),
                'purchase_value' => $ast['val'],
                'current_value' => $ast['val'] * 0.9,
                'useful_life_years' => $ast['life'],
                'location' => $ast['loc'],
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Depreciation entry
            DB::table('asset_depreciations')->insert([
                'id' => Str::uuid()->toString(),
                'asset_id' => $astId,
                'amount' => $ast['val'] * 0.1,
                'date' => now()->subMonths(6)->toDateString(),
                'voucher_id' => $voucherIds[$idx % count($voucherIds)],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Accounts tables seeded successfully!');
    }
}
