<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cafeteria_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('category')->nullable(); // Beverages, Snacks, Meals
            $table->decimal('price', 10, 2);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        Schema::create('cafeteria_sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('bill_no')->unique();
            $table->timestamp('sale_date');
            $table->decimal('total_amount', 10, 2);
            $table->string('payment_method')->default('cash'); // cash, card, employee_credit
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('cafeteria_sale_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_id')->constrained('cafeteria_sales')->cascadeOnDelete();
            $table->foreignUuid('item_id')->constrained('cafeteria_items');
            $table->integer('quantity');
            $table->decimal('price', 10, 2); // Unit price at time of sale
            $table->decimal('total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cafeteria_sale_items');
        Schema::dropIfExists('cafeteria_sales');
        Schema::dropIfExists('cafeteria_items');
    }
};
