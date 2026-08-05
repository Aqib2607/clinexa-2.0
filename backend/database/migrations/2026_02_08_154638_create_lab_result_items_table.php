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
        Schema::create('lab_result_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_result_id')->constrained()->cascadeOnDelete();
            $table->string('component_name'); // e.g., Hemoglobin
            $table->string('value'); // 14.5
            $table->string('unit')->nullable(); // g/dL
            $table->string('reference_range')->nullable(); // 13.5-17.5
            $table->boolean('is_abnormal')->default(false);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_result_items');
    }
};
