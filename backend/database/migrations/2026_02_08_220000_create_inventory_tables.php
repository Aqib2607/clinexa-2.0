<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stores
        Schema::create('stores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('location')->nullable();
            $table->boolean('is_main_store')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Items Master
        Schema::create('items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('type'); // medicine, consumable, asset, general
            $table->string('category')->nullable(); // antibiotic, stationary, etc.
            $table->string('unit'); // pcs, box, strip, kg
            $table->integer('reorder_level')->default(0);
            $table->decimal('standard_price', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Item Batches (Stock)
        Schema::create('item_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('item_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('store_id')->constrained()->cascadeOnDelete();
            $table->string('batch_no');
            $table->date('expiry_date')->nullable();
            $table->integer('quantity')->default(0);
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('sale_price', 10, 2);
            $table->timestamps();
        });

        // Stock Transactions
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('item_batch_id')->constrained('item_batches')->cascadeOnDelete();
            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->integer('quantity');
            $table->string('reference_type')->nullable(); // PurchaseOrder, Requisition, PatientIssue
            $table->uuid('reference_id')->nullable();
            $table->timestamp('transaction_date');
            $table->foreignId('performed_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Requisitions (Internal Requests)
        Schema::create('requisitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('requisition_no')->unique();
            $table->foreignUuid('from_store_id')->constrained('stores'); // Requesting Store
            $table->foreignUuid('to_store_id')->constrained('stores');   // Issuing Store
            $table->enum('status', ['pending', 'approved', 'rejected', 'issued', 'partial'])->default('pending');
            $table->foreignId('requested_by')->constrained('users');
            $table->timestamp('requested_at');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('requisition_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('requisition_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('item_id')->constrained();
            $table->integer('requested_quantity');
            $table->integer('issued_quantity')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requisition_items');
        Schema::dropIfExists('requisitions');
        Schema::dropIfExists('stock_transactions');
        Schema::dropIfExists('item_batches');
        Schema::dropIfExists('items');
        Schema::dropIfExists('stores');
    }
};
