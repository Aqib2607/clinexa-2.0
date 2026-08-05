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
        Schema::create('bed_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('admission_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('from_bed_id')->constrained('beds');
            $table->foreignUuid('to_bed_id')->constrained('beds');
            $table->timestamp('transfer_date');
            $table->text('reason')->nullable();
            $table->foreignId('transferred_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bed_transfers');
    }
};
