<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Chart of Accounts
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->foreignUuid('parent_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Vouchers (Transactions)
        Schema::create('vouchers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('voucher_no')->unique();
            $table->date('date');
            $table->enum('type', ['journal', 'payment', 'receipt', 'contra']);
            $table->text('narration')->nullable();
            $table->string('reference')->nullable();
            $table->boolean('is_posted')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });

        // Voucher Entries (Line Items)
        Schema::create('voucher_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('voucher_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('coa_id')->constrained('chart_of_accounts'); // Account Head
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->timestamps();
        });

        // Assets Management
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('asset_code')->unique();
            $table->foreignUuid('coa_id')->nullable()->constrained('chart_of_accounts'); // Link to Asset Account
            $table->date('purchase_date');
            $table->decimal('purchase_value', 15, 2);
            $table->decimal('current_value', 15, 2);
            $table->integer('useful_life_years')->nullable();
            $table->string('location')->nullable();
            $table->enum('status', ['active', 'disposed', 'maintenance'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
        Schema::dropIfExists('voucher_entries');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('chart_of_accounts');
    }
};
