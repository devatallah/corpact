<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A15 — H §19 «الملفات» + H §21 (جدول `files`).
 *
 * مصفوفة الرفع (شعار 2MB · إشعار تحويل 5MB · عقد 10MB)، فحص نوع MIME الفعلي
 * لا الامتداد، رفض التنفيذي، **الاستبدال ينشئ نسخة جديدة ويحتفظ بالقديمة**،
 * ولا حذف نهائي للعقود والملفات المالية.
 *
 * الجدول اسمه `stored_files` لا `files` تفادياً لكلمة محجوزة في بعض المحركات
 * ولالتباسها مع أدوات الإطار؛ النموذج `App\Models\StoredFile`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stored_files', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // App\Enums\FileCategory
            $table->string('category', 32);

            $table->string('disk', 32);
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type', 128);
            $table->string('extension', 16)->nullable();
            $table->unsignedBigInteger('size_bytes');
            $table->string('checksum', 64)->nullable();

            $table->nullableMorphs('fileable');
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            // الإصدارات: الاستبدال ينشئ صفاً جديداً يشير إلى سلفه ويُنزل عَلَم
            // `is_current` عن القديم — والقديم يبقى.
            $table->unsignedInteger('version')->default(1);
            $table->foreignId('replaces_file_id')->nullable()->constrained('stored_files')->nullOnDelete();
            $table->boolean('is_current')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['fileable_type', 'fileable_id', 'category', 'is_current'], 'stored_files_owner_index');
            $table->index(['category', 'created_at']);
            $table->index(['company_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stored_files');
    }
};
