<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ============================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('logout', [\App\Http\Controllers\Api\AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Public data (for public-facing pages - read-only)
Route::get('departments', [\App\Http\Controllers\Api\DepartmentController::class, 'index']);
Route::get('departments/{department}', [\App\Http\Controllers\Api\DepartmentController::class, 'show']);
Route::get('departments/{department}/doctors', [\App\Http\Controllers\Api\DepartmentController::class, 'doctors']);
Route::get('doctors', [\App\Http\Controllers\Api\DoctorController::class, 'index']);
Route::get('doctors/{doctor}', [\App\Http\Controllers\Api\DoctorController::class, 'show']);
Route::get('services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
Route::get('slots', [\App\Http\Controllers\Api\AppointmentSlotController::class, 'index']);
Route::get('slots/{slot}', [\App\Http\Controllers\Api\AppointmentSlotController::class, 'show']);

// Public appointment booking (guest or patient)
Route::post('appointments', [\App\Http\Controllers\Api\AppointmentController::class, 'store']);

// Settings (read-only for frontend configuration)
Route::get('settings', [\App\Http\Controllers\Api\SettingsController::class, 'index']);

// System updates (read-only for public display)
Route::get('system-updates', [\App\Http\Controllers\Api\SystemUpdateController::class, 'index']);

// ============================================================
// AUTHENTICATED ROUTES (All roles)
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Current user
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        // Load role-specific relationships if they exist
        if ($user->role === 'doctor') {
            $user->load('doctor');
        }
        return $user;
    });

    // Notifications (all authenticated users)
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);

    // ============================================================
    // ADMIN-ONLY ROUTES
    // ============================================================
    Route::middleware('role:super_admin')->group(function () {

        // Admin Dashboard & Reports
        Route::prefix('admin')->group(function () {
            Route::get('stats', [\App\Http\Controllers\Api\AdminController::class, 'getDashboardStats']);
            Route::get('reports', [\App\Http\Controllers\Api\AdminController::class, 'getReports']);
            Route::get('reports/export/{type}', [\App\Http\Controllers\Api\AdminController::class, 'exportReportDetail']);
        });

        // Department management (CRUD)
        Route::post('departments', [\App\Http\Controllers\Api\DepartmentController::class, 'store']);
        Route::put('departments/{department}', [\App\Http\Controllers\Api\DepartmentController::class, 'update']);
        Route::delete('departments/{department}', [\App\Http\Controllers\Api\DepartmentController::class, 'destroy']);

        // Doctor management (CRUD)
        Route::post('doctors', [\App\Http\Controllers\Api\DoctorController::class, 'store']);
        Route::put('doctors/{doctor}', [\App\Http\Controllers\Api\DoctorController::class, 'update']);
        Route::delete('doctors/{doctor}', [\App\Http\Controllers\Api\DoctorController::class, 'destroy']);

        // Patient management (CRUD)
        Route::apiResource('patients', \App\Http\Controllers\Api\PatientController::class);

        // Appointment management (full CRUD)
        Route::get('appointments', [\App\Http\Controllers\Api\AppointmentController::class, 'index']);
        Route::get('appointments/{appointment}', [\App\Http\Controllers\Api\AppointmentController::class, 'show']);
        Route::put('appointments/{appointment}', [\App\Http\Controllers\Api\AppointmentController::class, 'update']);
        Route::delete('appointments/{appointment}', [\App\Http\Controllers\Api\AppointmentController::class, 'destroy']);

        // Slot management
        Route::post('slots', [\App\Http\Controllers\Api\AppointmentSlotController::class, 'store']);
        Route::put('slots/{slot}', [\App\Http\Controllers\Api\AppointmentSlotController::class, 'update']);
        Route::delete('slots/{slot}', [\App\Http\Controllers\Api\AppointmentSlotController::class, 'destroy']);
        Route::post('slots/generate', [\App\Http\Controllers\Api\AppointmentSlotController::class, 'generate']);

        // Prescriptions (admin view)
        Route::apiResource('prescriptions', \App\Http\Controllers\Api\PrescriptionController::class);

        // Billing
        Route::apiResource('bills', \App\Http\Controllers\Api\BillingController::class);
        Route::post('bills/{id}/items', [\App\Http\Controllers\Api\BillingController::class, 'addItem']);
        Route::post('bills/{id}/payments', [\App\Http\Controllers\Api\BillingController::class, 'addPayment']);
        Route::post('bills/{id}/finalize', [\App\Http\Controllers\Api\BillingController::class, 'finalize']);

        // Visits
        Route::apiResource('visits', \App\Http\Controllers\Api\VisitController::class);

        // Pharmacy
        Route::prefix('pharmacy')->group(function () {
            Route::get('items', [\App\Http\Controllers\Api\PharmacyController::class, 'indexItems']);
            Route::post('items', [\App\Http\Controllers\Api\PharmacyController::class, 'storeItem']);
            Route::post('stock', [\App\Http\Controllers\Api\PharmacyController::class, 'addStock']);
            Route::post('sales', [\App\Http\Controllers\Api\PharmacyController::class, 'storeSale']);
        });

        // LIS (Lab)
        Route::prefix('lis')->group(function () {
            Route::get('samples', [\App\Http\Controllers\Api\LisController::class, 'indexSamples']);
            Route::post('samples/{id}/collect', [\App\Http\Controllers\Api\LisController::class, 'collectSample']);
            Route::post('samples/{id}/receive', [\App\Http\Controllers\Api\LisController::class, 'receiveSample']);
            Route::get('results', [\App\Http\Controllers\Api\LisController::class, 'indexResults']);
            Route::post('results/{id}', [\App\Http\Controllers\Api\LisController::class, 'storeResult']);
            Route::post('results/{id}/verify', [\App\Http\Controllers\Api\LisController::class, 'verifyResult']);
            Route::post('results/{id}/finalize', [\App\Http\Controllers\Api\LisController::class, 'finalizeResult']);
            Route::get('reports/{id}', [\App\Http\Controllers\Api\LisController::class, 'getReport']);
        });

        // RIS (Radiology)
        Route::prefix('ris')->group(function () {
            Route::get('studies', [\App\Http\Controllers\Api\RisController::class, 'indexStudies']);
            Route::post('studies/{id}/result', [\App\Http\Controllers\Api\RisController::class, 'storeResult']);
            Route::post('results/{id}/finalize', [\App\Http\Controllers\Api\RisController::class, 'finalizeResult']);
            Route::get('reports/{id}', [\App\Http\Controllers\Api\RisController::class, 'getReport']);
        });

        // IPD
        Route::prefix('ipd')->group(function () {
            Route::get('beds', [\App\Http\Controllers\Api\IpdController::class, 'indexBeds']);
            Route::post('beds/transfer/{id}', [\App\Http\Controllers\Api\IpdController::class, 'transferBed']);
            Route::post('admissions', [\App\Http\Controllers\Api\IpdController::class, 'admit']);
            Route::get('admissions/{id}', [\App\Http\Controllers\Api\IpdController::class, 'show']);
            Route::post('admissions/{id}/charge', [\App\Http\Controllers\Api\IpdController::class, 'addCharge']);
            Route::post('admissions/{id}/payment', [\App\Http\Controllers\Api\IpdController::class, 'addPayment']);
            Route::post('admissions/{id}/discharge', [\App\Http\Controllers\Api\IpdController::class, 'discharge']);
        });

        // OT
        Route::prefix('ot')->group(function () {
            Route::get('bookings', [\App\Http\Controllers\Api\OtController::class, 'indexBookings']);
            Route::post('bookings', [\App\Http\Controllers\Api\OtController::class, 'storeBooking']);
            Route::patch('bookings/{id}/status', [\App\Http\Controllers\Api\OtController::class, 'updateStatus']);
        });

        // Inventory
        Route::prefix('inventory')->group(function () {
            Route::get('stores', [\App\Http\Controllers\Api\InventoryController::class, 'getStores']);
            Route::get('stock', [\App\Http\Controllers\Api\InventoryController::class, 'getStock']);
            Route::post('items', [\App\Http\Controllers\Api\InventoryController::class, 'createItem']);
            Route::post('categories', [\App\Http\Controllers\Api\InventoryController::class, 'createCategory']);
            Route::post('suppliers', [\App\Http\Controllers\Api\InventoryController::class, 'createSupplier']);
            Route::post('stock/receive', [\App\Http\Controllers\Api\InventoryController::class, 'receiveStock']);
            Route::post('requisitions', [\App\Http\Controllers\Api\InventoryController::class, 'createRequisition']);
            Route::post('requisitions/{id}/fulfill', [\App\Http\Controllers\Api\InventoryController::class, 'fulfillRequisition']);
            Route::post('issue/ipd', [\App\Http\Controllers\Api\InventoryController::class, 'issueToAdmission']);
        });

        // HR
        Route::prefix('hr')->group(function () {
            Route::get('employees', [\App\Http\Controllers\Api\HrController::class, 'getEmployees']);
            Route::post('employees', [\App\Http\Controllers\Api\HrController::class, 'createEmployee']);
            Route::put('employees/{id}', [\App\Http\Controllers\Api\HrController::class, 'updateEmployee']);
            Route::delete('employees/{id}', [\App\Http\Controllers\Api\HrController::class, 'deleteEmployee']);
            Route::post('shifts', [\App\Http\Controllers\Api\HrController::class, 'createShift']);
            Route::post('leaves', [\App\Http\Controllers\Api\HrController::class, 'applyLeave']);
            Route::post('attendance', [\App\Http\Controllers\Api\HrController::class, 'markAttendance']);
            Route::post('payroll/generate', [\App\Http\Controllers\Api\HrController::class, 'generatePayroll']);
        });

        // Accounts
        Route::prefix('accounts')->group(function () {
            Route::get('trial-balance', [\App\Http\Controllers\Api\AccountsController::class, 'getTrialBalance']);
            Route::post('cost-centers', [\App\Http\Controllers\Api\AccountsController::class, 'createCostCenter']);
            Route::post('vouchers', [\App\Http\Controllers\Api\AccountsController::class, 'createVoucher']);
        });

        // Cafeteria
        Route::prefix('cafeteria')->group(function () {
            Route::get('items', [\App\Http\Controllers\Api\CafeteriaController::class, 'getItems']);
            Route::post('sales', [\App\Http\Controllers\Api\CafeteriaController::class, 'storeSale']);
        });

        // Lab Automation
        Route::prefix('lab-automation')->group(function () {
            Route::post('receive', [\App\Http\Controllers\Api\LabAutomationController::class, 'receiveData']);
            Route::get('logs', [\App\Http\Controllers\Api\LabAutomationController::class, 'getLogs']);
        });

        // SMS
        Route::prefix('sms')->group(function () {
            Route::post('send', [\App\Http\Controllers\Api\SmsController::class, 'sendSms']);
            Route::get('logs', [\App\Http\Controllers\Api\SmsController::class, 'getLogs']);
        });

        // Settings (write)
        Route::post('settings', [\App\Http\Controllers\Api\SettingsController::class, 'store']);

        // System Updates (write)
        Route::post('system-updates', [\App\Http\Controllers\Api\SystemUpdateController::class, 'store']);
        Route::put('system-updates/{id}', [\App\Http\Controllers\Api\SystemUpdateController::class, 'update']);
        Route::delete('system-updates/{id}', [\App\Http\Controllers\Api\SystemUpdateController::class, 'destroy']);
    });

    // ============================================================
    // DOCTOR PORTAL ROUTES
    // ============================================================
    Route::middleware('role:doctor')->prefix('doctor')->group(function () {
        // Appointments
        Route::get('/appointments', [\App\Http\Controllers\Api\DoctorPortalController::class, 'getAppointments']);
        Route::post('/appointments', [\App\Http\Controllers\Api\DoctorPortalController::class, 'createAppointment']);
        Route::put('/appointments/{id}', [\App\Http\Controllers\Api\DoctorPortalController::class, 'updateAppointment']);
        Route::delete('/appointments/{id}/cancel', [\App\Http\Controllers\Api\DoctorPortalController::class, 'cancelAppointment']);

        // Prescriptions
        Route::get('/prescriptions', [\App\Http\Controllers\Api\DoctorPortalController::class, 'getPrescriptions']);
        Route::post('/prescriptions', [\App\Http\Controllers\Api\DoctorPortalController::class, 'createPrescription']);
        Route::put('/prescriptions/{id}', [\App\Http\Controllers\Api\DoctorPortalController::class, 'updatePrescription']);
        Route::delete('/prescriptions/{id}', [\App\Http\Controllers\Api\DoctorPortalController::class, 'deletePrescription']);

        // Patients
        Route::get('/patients', [\App\Http\Controllers\Api\DoctorPortalController::class, 'getPatients']);
        Route::get('/patients/{patientId}/notes', [\App\Http\Controllers\Api\DoctorPortalController::class, 'getPatientNotes']);
        Route::post('/patients/{patientId}/notes', [\App\Http\Controllers\Api\DoctorPortalController::class, 'createPatientNote']);
        Route::put('/patients/{patientId}/notes/{noteId}', [\App\Http\Controllers\Api\DoctorPortalController::class, 'updatePatientNote']);

        // Schedule
        Route::get('/schedule', [\App\Http\Controllers\Api\DoctorPortalController::class, 'getSchedule']);
        Route::post('/schedule', [\App\Http\Controllers\Api\DoctorPortalController::class, 'updateSchedule']);
        Route::post('/schedule/replace-slots', [\App\Http\Controllers\Api\DoctorPortalController::class, 'replaceAppointmentSlots']);
        Route::post('/schedule/block', [\App\Http\Controllers\Api\DoctorPortalController::class, 'blockTimeSlot']);
        Route::delete('/schedule/{id}', [\App\Http\Controllers\Api\DoctorPortalController::class, 'deleteScheduleSlot']);
        Route::delete('/slots/{id}', [\App\Http\Controllers\Api\DoctorPortalController::class, 'deleteAppointmentSlot']);

        // Profile
        Route::get('/profile', [\App\Http\Controllers\Api\DoctorPortalController::class, 'getProfile']);
        Route::post('/profile', [\App\Http\Controllers\Api\DoctorPortalController::class, 'updateProfile']);
    });

    // ============================================================
    // NURSE PORTAL ROUTES
    // ============================================================
    Route::middleware('role:nurse')->prefix('nurse')->group(function () {
        // Dashboard stats
        Route::get('/dashboard', [\App\Http\Controllers\Api\NursePortalController::class, 'getDashboardData']);

        // Admission
        Route::get('/admission-options', [\App\Http\Controllers\Api\NursePortalController::class, 'getAdmissionOptions']);
        Route::post('/admit', [\App\Http\Controllers\Api\NursePortalController::class, 'admitPatient']);
        
        // Assigned patients (from admissions)
        Route::get('/patients', [\App\Http\Controllers\Api\NursePortalController::class, 'getPatients']);
        Route::get('/patients/{id}', [\App\Http\Controllers\Api\NursePortalController::class, 'getPatientDetails']);

        // Vitals
        Route::get('/vitals', [\App\Http\Controllers\Api\NursePortalController::class, 'getRecentVitals']);
        Route::post('/vitals/{admissionId}', [\App\Http\Controllers\Api\NursingController::class, 'storeVitals']);

        // Tasks
        Route::get('/tasks', [\App\Http\Controllers\Api\NursePortalController::class, 'getTasks']);
        Route::patch('/tasks/{id}/complete', [\App\Http\Controllers\Api\NursePortalController::class, 'completeTask']);

        // Nursing notes
        Route::post('/notes/{admissionId}', [\App\Http\Controllers\Api\NursingController::class, 'storeNote']);

        // Profile
        Route::get('/profile', [\App\Http\Controllers\Api\NursePortalController::class, 'getProfile']);
        Route::post('/profile', [\App\Http\Controllers\Api\NursePortalController::class, 'updateProfile']);

        // Nursing station worklist (existing controller)
        Route::get('/worklist', [\App\Http\Controllers\Api\NursingController::class, 'indexWorklist']);
    });

    // ============================================================
    // PATIENT PORTAL ROUTES
    // ============================================================
    Route::middleware('role:patient')->prefix('patient')->group(function () {
        Route::get('/dashboard-data', [\App\Http\Controllers\Api\PatientPortalController::class, 'getDashboardData']);
        Route::get('/appointments', [\App\Http\Controllers\Api\PatientPortalController::class, 'getAppointments']);
        Route::post('/appointments/{id}/cancel', [\App\Http\Controllers\Api\PatientPortalController::class, 'cancelAppointment']);
        Route::get('/prescriptions', [\App\Http\Controllers\Api\PatientPortalController::class, 'getPrescriptions']);
        Route::get('/records', [\App\Http\Controllers\Api\PatientPortalController::class, 'getRecords']);
        Route::get('/profile', [\App\Http\Controllers\Api\PatientPortalController::class, 'getProfile']);
        Route::post('/profile', [\App\Http\Controllers\Api\PatientPortalController::class, 'updateProfile']);
        Route::get('/download/{token}', [\App\Http\Controllers\Api\PatientPortalController::class, 'downloadSecure']);
    });
});
