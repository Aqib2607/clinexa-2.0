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
        Schema::create('radiology_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('radiology_study_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('radiology_template_id')->nullable()->constrained()->nullOnDelete();
            $table->text('findings');
            $table->text('impression')->nullable();
            $table->foreignId('radiologist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('radiology_results');
    }
};
