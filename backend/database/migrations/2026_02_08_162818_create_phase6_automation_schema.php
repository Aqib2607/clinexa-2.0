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
        // --- Lab Automation ---
        Schema::create('lab_machine_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('machine_name'); // e.g., "Beckman Coulter AU480"
            $table->string('ip_address')->nullable();
            $table->integer('port')->nullable();
            $table->string('protocol')->default('ASTM'); // ASTM, HL7, SERIAL
            $table->json('connection_settings')->nullable(); // Baud rate, parity, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('lab_machine_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('machine_id')->constrained('lab_machine_configs')->cascadeOnDelete();
            $table->text('raw_data'); // The actual ASTM/HL7 string
            $table->string('direction'); // IN (received), OUT (sent/ack)
            $table->string('status')->default('received'); // received, processed, error
            $table->text('processing_error')->nullable();
            $table->timestamps();
        });

        // --- SMS System ---
        Schema::create('sms_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event_name')->unique(); // e.g., "report_ready", "bill_due"
            $table->text('template_body'); // "Dear {name}, your report is ready. Link: {link}"
            $table->text('variables')->nullable(); // JSON array of available vars
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('sms_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('mobile_number');
            $table->text('message_body');
            $table->string('event_name')->nullable();
            $table->string('status')->default('pending'); // pending, sent, failed
            $table->string('provider_response')->nullable();
            $table->timestamps();
        });

        // --- Patient Portal ---
        Schema::create('patient_otps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('mobile_number');
            $table->string('otp_code');
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->timestamps();
        });

        Schema::create('secure_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->string('resource_type'); // 'lab_report', 'prescription', 'bill'
            $table->string('resource_id'); // UUID of the resource (lab_result_id, etc.)
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->integer('access_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secure_links');
        Schema::dropIfExists('patient_otps');
        Schema::dropIfExists('sms_logs');
        Schema::dropIfExists('sms_templates');
        Schema::dropIfExists('lab_machine_logs');
        Schema::dropIfExists('lab_machine_configs');
    }
};
