<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add SoftDeletes to Patient, Doctor, Appointment, Prescription
        Schema::table('patients', function (Blueprint $table) {
            $table->softDeletes();
            $table->index(['phone', 'email']);
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->softDeletes();
            $table->index(['department_id', 'is_active']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->softDeletes();
            $table->index(['doctor_id', 'appointment_date', 'status']);
            $table->index(['patient_id', 'status']);
            $table->index(['appointment_date', 'status']);
        });

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->softDeletes();
            $table->index(['patient_id', 'doctor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropIndex(['patient_id', 'doctor_id']);
            $table->dropSoftDeletes();
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['doctor_id', 'appointment_date', 'status']);
            $table->dropIndex(['patient_id', 'status']);
            $table->dropIndex(['appointment_date', 'status']);
            $table->dropSoftDeletes();
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->dropIndex(['department_id', 'is_active']);
            $table->dropSoftDeletes();
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['phone', 'email']);
            $table->dropSoftDeletes();
        });
    }
};
