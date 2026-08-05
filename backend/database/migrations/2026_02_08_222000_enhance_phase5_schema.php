<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // --- Inventory Refinement ---
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('tax_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('item_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->foreignUuid('parent_id')->nullable()->constrained('item_categories')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('items', function (Blueprint $table) {
            $table->foreignUuid('category_id')->nullable()->constrained('item_categories');
            // 'category' string column might be redundant now, but keeping for backward compat or migrating data later
        });

        // --- IPD Pharmacy ---
        Schema::create('ipd_pharmacy_issues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('admission_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('item_batch_id')->constrained('item_batches');
            $table->integer('quantity');
            $table->timestamp('issued_at');
            $table->foreignId('issued_by')->constrained('users');
            $table->timestamps();
        });

        // --- HR Refinement ---
        Schema::create('employee_shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Morning, Evening, Night
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->foreignUuid('shift_id')->nullable()->constrained('employee_shifts');
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('employee_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // --- Accounts Refinement ---
        Schema::create('cost_centers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Cardiology, Orthopedics, Admin
            $table->string('code')->unique();
            $table->timestamps();
        });

        Schema::table('vouchers', function (Blueprint $table) {
            $table->foreignUuid('cost_center_id')->nullable()->constrained('cost_centers');
        });

        Schema::create('asset_depreciations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('asset_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->foreignUuid('voucher_id')->nullable()->constrained(); // Link to accounting entry
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Drop in reverse order of dependency
        Schema::dropIfExists('asset_depreciations');
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropForeign(['cost_center_id']);
            $table->dropColumn('cost_center_id');
        });
        Schema::dropIfExists('cost_centers');
        Schema::dropIfExists('leave_requests');
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['shift_id']);
            $table->dropColumn('shift_id');
        });
        Schema::dropIfExists('employee_shifts');
        Schema::dropIfExists('ipd_pharmacy_issues');
        Schema::table('items', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
        Schema::dropIfExists('item_categories');
        Schema::dropIfExists('suppliers');
    }
};
