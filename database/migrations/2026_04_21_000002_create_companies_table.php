<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('domain')->nullable();
            $table->string('sector');
            $table->unsignedInteger('employee_count')->default(0);
            $table->string('employee_count_range')->nullable();
            $table->string('city')->nullable();
            $table->text('notes')->nullable();
            $table->string('hr_name')->nullable();
            $table->string('hr_phone')->nullable();
            $table->string('hr_title')->nullable();
            $table->string('requester_name')->nullable();
            $table->string('requester_email')->nullable();
            $table->string('requester_phone')->nullable();
            $table->enum('status', ['pending', 'review', 'active', 'rejected'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->string('activation_token')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
