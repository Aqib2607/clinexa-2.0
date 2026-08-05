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
        Schema::create('sample_collections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('visit_id')->constrained()->cascadeOnDelete();
            // Link to bill item to track which test was paid for
            $table->foreignId('bill_item_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('test_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('specimen_sample_id')->nullable()->constrained()->nullOnDelete();
            $table->string('barcode')->unique();
            $table->timestamp('collected_at')->nullable();
            $table->string('collected_by')->nullable();
            $table->enum('status', ['pending', 'collected', 'received', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sample_collections');
    }
};
