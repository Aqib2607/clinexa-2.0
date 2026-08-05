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
        Schema::dropIfExists('patient_otps');

        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('api_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('patient_otps', function (Blueprint $table) {
            $table->id();
            $table->string('mobile_number');
            $table->string('otp_code');
            $table->boolean('is_used')->default(false);
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->string('api_token', 80)->unique()->nullable()->default(null);
        });
    }
};
