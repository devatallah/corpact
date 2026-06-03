<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('city');
            $table->string('district')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_title')->nullable();
            $table->string('working_hours')->nullable();
            $table->unsignedInteger('venues_count')->nullable();
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('total_bookings')->default(0);
            $table->decimal('commission_rate', 4, 2)->default(10.00);
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'active', 'rejected', 'suspended'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->string('activation_token')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
