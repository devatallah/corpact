<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_revenue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('settlement_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('source');
            $table->string('description')->nullable();
            $table->date('revenue_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_revenue');
    }
};
