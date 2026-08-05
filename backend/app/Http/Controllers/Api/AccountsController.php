<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Voucher;
use App\Models\VoucherEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AccountsController extends Controller
{
    public function getTrialBalance()
    {
        // Simple Trial Balance Logic: Sum debits and credits for each account
        $accounts = ChartOfAccount::select('id', 'name', 'code', 'type')->get();

        $report = $accounts->map(function ($account) {
            $debit = VoucherEntry::where('coa_id', $account->id)->sum('debit');
            $credit = VoucherEntry::where('coa_id', $account->id)->sum('credit');

            return [
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $debit - $credit
            ];
        });

        return response()->json($report);
    }

    public function createCostCenter(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:cost_centers,code',
        ]);
        return response()->json(\App\Models\CostCenter::create($validated));
    }

    public function createVoucher(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:journal,payment,receipt,contra',
            'narration' => 'nullable|string',
            'cost_center_id' => 'nullable|exists:cost_centers,id',
            'entries' => 'required|array|min:2',
            'entries.*.coa_id' => 'required|exists:chart_of_accounts,id',
            'entries.*.debit' => 'required|numeric|min:0',
            'entries.*.credit' => 'required|numeric|min:0',
        ]);

        // Validate Total Debit = Total Credit
        $totalDebit = collect($validated['entries'])->sum('debit');
        $totalCredit = collect($validated['entries'])->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return response()->json(['message' => 'Debits and Credits must match'], 400);
        }

        return DB::transaction(function () use ($validated) {
            $voucher = Voucher::create([
                'voucher_no' => 'VCH-' . time(),
                'date' => $validated['date'],
                'type' => $validated['type'],
                'narration' => $validated['narration'] ?? null,
                'cost_center_id' => $validated['cost_center_id'] ?? null,
                'created_by' => Auth::id() ?? 1,
                'is_posted' => true, // Auto-post for now
            ]);

            foreach ($validated['entries'] as $entry) {
                VoucherEntry::create([
                    'voucher_id' => $voucher->id,
                    'coa_id' => $entry['coa_id'],
                    'debit' => $entry['debit'],
                    'credit' => $entry['credit'],
                ]);
            }

            return response()->json($voucher->load('entries'));
        });
    }
}
