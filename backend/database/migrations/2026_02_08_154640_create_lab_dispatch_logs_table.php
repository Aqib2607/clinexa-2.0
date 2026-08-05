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
        Schema::create('lab_dispatch_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_result_id')->constrained()->cascadeOnDelete();
            $table->string('dispatched_to'); // Patient or Doctor
            $table->string('dispatch_method'); // Email, Print, Portal
            $table->foreignId('dispatched_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_dispatch_logs');
    }
};
