<?php

use App\Enums\TopupRequestStatus;
use App\Enums\WalletTransactionType;
use App\Models\Community;
use App\Models\Company;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A6 — إعادة بناء المحافظ والدفتر (H §12.5).
 *
 * - المحفظة تملكها جهة (شركة = محفظة رئيسية، مجتمع = محفظة فرعية) عبر owner
 *   polymorphic؛ الرصيد المخزَّن `balance_halalas` عمود cache فقط: كل كتابة له
 *   تتم داخل نفس معاملة قاعدة البيانات مع قيد الدفتر (LedgerService)، وتُطابقه
 *   مهمة `app:reconcile-balances` ليلياً.
 * - `wallet_transactions` أعيد بناؤه دفتراً حقيقياً: أنواع مغلقة، مبالغ بالهللة
 *   (integer)، اتجاه، مرجع polymorphic، فاعل، مفتاح تفرّد، غير قابل للتعديل
 *   أو الحذف (حراسة في النموذج + triggers في قاعدة البيانات).
 * - الجدول القديم (قيود memo بنوعي credit/debit لا يطابق مجموعها الأرصدة)
 *   يُرحَّل إلى `legacy_wallet_transactions` للاحتفاظ بالتاريخ — لا يُحذف سجل مالي.
 * - الأرصدة القائمة (`wallets.balance`, `communities.balance`) تتحول إلى قيود
 *   افتتاحية من نوع `adjustment` موثَّقة، ثم يُحذف العمودان القابلان للكتابة.
 * - `wallet_holds`: أساس الحجز/الفك/الاستقطاع لتدفق التحصيل (A10).
 * - `wallet_topup_requests`: شحن المحفظة بتحويل بنكي بحالاته وقيد التفرّد
 *   (مرجع العملية + المبلغ).
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1) المحفظة: مالك polymorphic + رصيد cache بالهللة ────────────────
        Schema::table('wallets', function (Blueprint $table) {
            $table->string('owner_type')->nullable()->after('company_id');
            $table->unsignedBigInteger('owner_id')->nullable()->after('owner_type');
            $table->bigInteger('balance_halalas')->default(0)->after('owner_id');
        });

        // المحافظ القائمة كلها محافظ شركات رئيسية.
        DB::table('wallets')->update([
            'owner_type' => Company::class,
            'owner_id' => DB::raw('company_id'),
            'balance_halalas' => $this->toHalalas('balance'),
        ]);

        // محفظة فرعية لكل مجتمع، رصيدها الافتتاحي من عمود communities.balance.
        $now = now();
        foreach (DB::table('communities')->get(['id', 'company_id', 'balance']) as $community) {
            DB::table('wallets')->insert([
                'company_id' => $community->company_id,
                'owner_type' => Community::class,
                'owner_id' => $community->id,
                'balance_halalas' => (int) round(((float) $community->balance) * 100),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::table('wallets', function (Blueprint $table) {
            $table->unique(['owner_type', 'owner_id']);
        });

        Schema::table('wallets', function (Blueprint $table) {
            $table->dropColumn('balance');
        });

        // ── 2) الدفتر القديم يُؤرشف — لا حذف لسجل مالي ─────────────────────
        Schema::rename('wallet_transactions', 'legacy_wallet_transactions');

        /*
         * MySQL لا يعيد تسمية قيود المفتاح الأجنبي حين يُعاد تسمية جدولها،
         * وأسماء القيود فريدة على مستوى القاعدة كلها. فيبقى الجدول المؤرشف
         * ممسكاً بالاسم `wallet_transactions_wallet_id_foreign`، ويسقط إنشاء
         * الدفتر الجديد بـ«Duplicate foreign key constraint name».
         *
         * SQLite لا يسمّي قيوده عالمياً فلا يقع التصادم — ولهذا لم تظهر
         * المشكلة محلياً ولا في الاختبارات، وظهرت على MySQL وحده.
         *
         * القيود تُسقط عن **الأرشيف** لا عن الدفتر الجديد: جدول للقراءة
         * التاريخية لا يحتاج فرضاً مرجعياً، والسجل المالي نفسه لا يُمس.
         */
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            // تُقرأ الأسماء من الفهرس لا تُخمَّن: القيود احتفظت بأسماء الجدول
            // قبل إعادة التسمية، وقد تختلف بين قواعد نشأت في أوقات مختلفة.
            $constraints = DB::select(
                'select constraint_name from information_schema.table_constraints
                 where table_schema = database()
                   and table_name = ?
                   and constraint_type = ?',
                ['legacy_wallet_transactions', 'FOREIGN KEY']
            );

            foreach ($constraints as $constraint) {
                $name = $constraint->constraint_name ?? $constraint->CONSTRAINT_NAME;
                DB::statement("alter table `legacy_wallet_transactions` drop foreign key `{$name}`");
            }
        }

        // ── 3) الدفتر الجديد ────────────────────────────────────────────────
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            // restrictOnDelete: حذف محفظة لا يمحو تاريخاً مالياً أبداً.
            $table->foreignId('wallet_id')->constrained('wallets')->restrictOnDelete();
            $table->enum('type', WalletTransactionType::values());
            $table->unsignedBigInteger('amount_halalas');
            $table->enum('direction', ['credit', 'debit']);
            $table->nullableMorphs('reference');
            // الفاعل: المستخدم العالمي؛ null = النظام (مهمة مجدولة/ترحيل).
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->restrictOnDelete();
            // حركة مرتبطة: الأصل المعكوس لقيود العكس، أو الساق المقابلة لزوج التخصيص.
            $table->foreignId('related_transaction_id')->nullable()->constrained('wallet_transactions')->restrictOnDelete();
            $table->string('idempotency_key')->unique();
            $table->string('note')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['wallet_id', 'type']);
            $table->index(['wallet_id', 'occurred_at']);
        });

        // ── 4) القيود الافتتاحية: Σ الدفتر = الرصيد القائم منذ اليوم الأول ──
        foreach (DB::table('wallets')->get(['id', 'balance_halalas']) as $wallet) {
            if ((int) $wallet->balance_halalas === 0) {
                continue;
            }

            DB::table('wallet_transactions')->insert([
                'wallet_id' => $wallet->id,
                'type' => WalletTransactionType::Adjustment->value,
                'amount_halalas' => abs((int) $wallet->balance_halalas),
                'direction' => ((int) $wallet->balance_halalas) >= 0 ? 'credit' : 'debit',
                'reference_type' => null,
                'reference_id' => null,
                'actor_user_id' => null,
                'related_transaction_id' => null,
                'idempotency_key' => "opening-balance:wallet:{$wallet->id}",
                'note' => 'قيد افتتاحي — ترحيل الرصيد القائم قبل اعتماد الدفتر (A6). الحركات الأقدم في legacy_wallet_transactions.',
                'occurred_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── 5) عدم القابلية للتعديل/الحذف على مستوى قاعدة البيانات ─────────
        // الحراسة الأساسية في النموذج؛ الـ triggers تسد مسار الاستعلامات الخام.
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            DB::unprepared(<<<'SQL'
                CREATE TRIGGER wallet_transactions_no_update
                BEFORE UPDATE ON wallet_transactions
                BEGIN
                    SELECT RAISE(ABORT, 'wallet_transactions is append-only (H 12.5)');
                END;
            SQL);
            DB::unprepared(<<<'SQL'
                CREATE TRIGGER wallet_transactions_no_delete
                BEFORE DELETE ON wallet_transactions
                BEGIN
                    SELECT RAISE(ABORT, 'wallet_transactions is append-only (H 12.5)');
                END;
            SQL);
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::unprepared(<<<'SQL'
                CREATE TRIGGER wallet_transactions_no_update
                BEFORE UPDATE ON wallet_transactions FOR EACH ROW
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'wallet_transactions is append-only (H 12.5)';
            SQL);
            DB::unprepared(<<<'SQL'
                CREATE TRIGGER wallet_transactions_no_delete
                BEFORE DELETE ON wallet_transactions FOR EACH ROW
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'wallet_transactions is append-only (H 12.5)';
            SQL);
        }

        // ── 6) الحجوزات (أساس تدفق التحصيل — A10) ─────────────────────────
        Schema::create('wallet_holds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->restrictOnDelete();
            $table->unsignedBigInteger('amount_halalas');
            $table->unsignedBigInteger('captured_amount_halalas')->nullable();
            $table->enum('status', ['active', 'released', 'captured']);
            $table->nullableMorphs('reference');
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('hold_transaction_id')->constrained('wallet_transactions')->restrictOnDelete();
            $table->string('idempotency_key')->unique();
            $table->string('note')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->timestamps();

            $table->index(['wallet_id', 'status']);
        });

        // ── 7) طلبات الشحن بتحويل بنكي ─────────────────────────────────────
        Schema::create('wallet_topup_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->restrictOnDelete();
            $table->foreignId('wallet_id')->constrained('wallets')->restrictOnDelete();
            $table->unsignedBigInteger('amount_halalas');
            $table->date('transfer_date');
            $table->string('sender_account_last4', 4);
            $table->string('bank_reference');
            $table->string('receipt_path'); // قرص خاص — يُعرض برابط موقّع مؤقت فقط.
            $table->enum('status', TopupRequestStatus::values())->default(TopupRequestStatus::Submitted->value);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('approval_transaction_id')->nullable()->constrained('wallet_transactions')->restrictOnDelete();
            $table->foreignId('unapproved_by_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('unapproved_at')->nullable();
            $table->text('unapproval_reason')->nullable();
            $table->foreignId('reversal_transaction_id')->nullable()->constrained('wallet_transactions')->restrictOnDelete();
            $table->timestamps();

            // H §12.5 بند 3: قيد فريد على (مرجع العملية + المبلغ) يمنع اعتماد
            // نفس التحويل مرتين.
            $table->unique(['bank_reference', 'amount_halalas']);
            $table->index(['company_id', 'status']);
        });

        // ── 8) حذف عمود الرصيد القابل للكتابة عن المجتمعات ──────────────────
        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn('balance');
        });
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['sqlite', 'mysql', 'mariadb'], true)) {
            DB::unprepared('DROP TRIGGER IF EXISTS wallet_transactions_no_update');
            DB::unprepared('DROP TRIGGER IF EXISTS wallet_transactions_no_delete');
        }

        Schema::table('communities', function (Blueprint $table) {
            $table->decimal('balance', 10, 2)->default(0);
        });

        Schema::dropIfExists('wallet_topup_requests');
        Schema::dropIfExists('wallet_holds');
        Schema::dropIfExists('wallet_transactions');
        Schema::rename('legacy_wallet_transactions', 'wallet_transactions');

        Schema::table('wallets', function (Blueprint $table) {
            $table->decimal('balance', 12, 2)->default(0);
        });

        DB::table('wallets')->update(['balance' => DB::raw('balance_halalas / 100.0')]);
        DB::table('wallets')->where('owner_type', Community::class)->delete();

        Schema::table('wallets', function (Blueprint $table) {
            $table->dropUnique(['owner_type', 'owner_id']);
            $table->dropColumn(['owner_type', 'owner_id', 'balance_halalas']);
        });
    }

    /**
     * تحويل ريالات عشرية إلى هللات صحيحة، بتعبير SQL يفهمه المحركان.
     *
     * `CAST(... AS INTEGER)` صالح في SQLite ومرفوض في MySQL — الأخير يريد
     * `SIGNED`. الفرق لا يظهر محلياً على SQLite، فكانت الهجرة تسقط على
     * الخادم وحده بـ«error in your SQL syntax near INTEGER» بعد أن تكون قد
     * أضافت أعمدتها — فتترك القاعدة نصف مهاجَرة ولا تُسجَّل، ويفشل كل تشغيل
     * تالٍ بـ«Duplicate column».
     */
    private function toHalalas(string $column): Expression
    {
        $type = DB::connection()->getDriverName() === 'sqlite' ? 'INTEGER' : 'SIGNED';

        return DB::raw("CAST(ROUND({$column} * 100) AS {$type})");
    }
};
