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
        Schema::table('departments', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('facilities');
            $table->json('conditions_treated')->nullable()->after('image_url');
            $table->json('technologies')->nullable()->after('conditions_treated');
            $table->text('why_choose_us')->nullable()->after('technologies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn(['image_url', 'conditions_treated', 'technologies', 'why_choose_us']);
        });
    }
};
