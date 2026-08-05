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
        Schema::create('pharmacy_sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('pharmacy_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('pharmacy_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pharmacy_stock_id')->constrained()->cascadeOnDelete(); // Trace batch
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2); // Snapshot price
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacy_sale_items');
    }
};
