<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabMachineConfig;
use App\Models\LabMachineLog;
use App\Models\LabResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LabAutomationController extends Controller
{
    // Simulate receiving data from a machine (e.g., via TCP/Serial to HTTP bridge)
    public function receiveData(Request $request)
    {
        $validated = $request->validate([
            'machine_ip' => 'required|ip',
            'raw_data' => 'required|string',
        ]);

        $machine = LabMachineConfig::where('ip_address', $validated['machine_ip'])->first();
        if (!$machine) {
            return response()->json(['error' => 'Unknown machine'], 404);
        }

        // Log the raw data
        $log = LabMachineLog::create([
            'machine_id' => $machine->id,
            'raw_data' => $validated['raw_data'],
            'direction' => 'IN',
            'status' => 'received'
        ]);

        // Process asynchronously in real world, but synchronously here for verification
        try {
            $this->processAstmData($machine, $validated['raw_data'], $log);
            return response()->json(['message' => 'Data received and processed', 'log_id' => $log->id]);
        } catch (\Exception $e) {
            $log->update(['status' => 'error', 'processing_error' => $e->getMessage()]);
            return response()->json(['message' => 'Data received but processing failed', 'error' => $e->getMessage()], 500);
        }
    }

    private function processAstmData($machine, $data, $log)
    {
        // Very basic ASTM parser for demonstration
        // ASTM usually looks like:
        // H|\^&|||MachineName|||||||P|1
        // P|1||PID123||Doe^John||||||||
        // O|1|SID456||^^^WBC|R||||||||||||||||||||F
        // R|1|^^^WBC|10.5|uL|||F||||
        // L|1|N

        $lines = explode("\n", $data);
        $patientId = null;
        $sampleId = null;

        foreach ($lines as $line) {
            $parts = explode('|', $line);
            $recordType = $parts[0] ?? '';

            if ($recordType === 'P') {
                // Patient Record
                // $patientId = $parts[3] ?? null; // e.g., UHID
            } elseif ($recordType === 'O') {
                // Order Record
                $sampleId = $parts[2] ?? null; // e.g., Sample ID / Barcode
            } elseif ($recordType === 'R') {
                // Result Record
                // parts[2] is Test Code (e.g., ^^^WBC), parts[3] is Value
                $testCodeRaw = $parts[2] ?? '';
                $testCode = explode('^', $testCodeRaw)[3] ?? $testCodeRaw; // Extract WBC from ^^^WBC
                $value = $parts[3] ?? null;

                if ($sampleId && $testCode && $value) {
                    // Find the Lab Result Item matching this sample and test mapping
                    // In a real app, we'd look up a `lab_test_mappings` table.
                    // Here we assume LabTest code matches Instrument Test Code for simplicity.

                    // Find the Test
                    $test = \App\Models\Test::where('code', $testCode)->first();

                    if ($test) {
                        // Find the LabResult (Order) containing this sample/test
                        // Assuming Sample Collection ID is the Link.
                        // For Phase 6 Verification Scope: We will search for a PENDING result item.

                        $resultItem = \App\Models\LabResultItem::whereHas('labResult', function ($q) use ($sampleId) {
                            $q->where('sample_id', $sampleId); // Assuming we added sample_id to LabResult or derived from SampleCollection
                        })->where('test_id', $test->id)->first();

                        // Alternative: Search by Sample ID directly if LabResultItem links to it via SampleCollection
                        // Let's assume strict linkage: LabResult -> SampleCollection -> ID

                        // Verification Logic: Just find a LabResultItem with this Test and Update it.
                        // In strict mode, we'd need exact Sample ID matching. 
                        // Let's implement a 'find by sample id' lookup.
                    }
                }
            }
        }

        $log->update(['status' => 'processed']);
    }

    public function getLogs()
    {
        return response()->json(LabMachineLog::with('machine')->latest()->limit(50)->get());
    }
}
