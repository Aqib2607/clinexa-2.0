<?php

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Visit;
use App\Models\Service;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\LabResult;
use App\Models\Ward;
use App\Models\PharmacyItem;

echo "--- Clinexa Project Data Verification ---\n\n";

// 1. User & Role Counts
echo "1. User Counts:\n";
echo "   Total Users: " . User::count() . "\n";
echo "   - Super Admins: " . User::where('role', 'super_admin')->count() . "\n";
echo "   - Doctors: " . User::where('role', 'doctor')->count() . "\n";
echo "   - Nurses: " . User::where('role', 'nurse')->count() . "\n";
echo "   - Patients: " . User::where('role', 'patient')->count() . "\n";
echo "   - Pharmacists: " . User::where('role', 'pharmacist')->count() . "\n";
echo "   - Lab Technicians: " . User::where('role', 'lab_technician')->count() . "\n\n";

// 2. Clinical Data
echo "2. Clinical Data:\n";
echo "   Patients (Profile): " . Patient::count() . "\n";
echo "   Doctors (Profile): " . Doctor::count() . "\n";
echo "   Visits: " . Visit::count() . "\n";
$latestVisit = Visit::with('patient.user', 'doctor.user')->latest()->first();
if ($latestVisit) {
    $patientName = $latestVisit->patient->user ? $latestVisit->patient->user->name : $latestVisit->patient->name;
    echo "   * Latest Visit: " . $latestVisit->type . " - " . $patientName . " (Dr. " . $latestVisit->doctor->user->name . ")\n";
}
echo "\n";

// 3. Billing & Finance
echo "3. Billing & Finance:\n";
echo "   Services: " . Service::count() . "\n";
echo "   Bills: " . Bill::count() . "\n";
echo "   Payments: " . Payment::count() . "\n";
echo "   Total Revenue (Paid Bills): " . Bill::where('payment_status', 'paid')->sum('paid_amount') . "\n\n";

// 4. Laboratory
echo "4. Laboratory:\n";
echo "   Lab Results: " . LabResult::count() . "\n";
$abnormalResults = \App\Models\LabResultItem::where('is_abnormal', true)->count();
echo "   Abnormal Result Items: " . $abnormalResults . "\n\n";

// 5. Hospital Services
echo "5. Hospital Services:\n";
echo "   Wards: " . Ward::count() . "\n";
echo "   Pharmacy Items: " . PharmacyItem::count() . "\n";

echo "\n--- Verification Complete ---\n";
