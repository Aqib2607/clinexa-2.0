<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('patient_otps')) {
            Schema::create('patient_otps', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('mobile_number');
                $table->string('otp_code');
                $table->timestamp('expires_at');
                $table->boolean('is_used')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_otps');
    }
};
