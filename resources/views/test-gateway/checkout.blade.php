<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>بوابة الدفع التجريبية — تيمات</title>
    <style>
        body { font-family: 'Almarai', 'Segoe UI', Tahoma, sans-serif; background: #F6F6F6; margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; }
        .card { background: #fff; border: 1px solid #EBEBEB; border-radius: 16px; padding: 28px; width: 100%; max-width: 420px; }
        .badge { display: inline-block; background: #FEF3C7; color: #92400E; border-radius: 8px; padding: 4px 10px; font-size: 12px; margin-bottom: 14px; }
        .amount { font-size: 34px; font-weight: 800; margin: 6px 0; }
        .muted { color: #777; font-size: 13px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #EEE; }
        .methods { display: flex; gap: 8px; margin: 14px 0; }
        .method { border: 1px solid #DDD; border-radius: 10px; padding: 6px 12px; font-size: 12px; }
        button { width: 100%; border: 0; border-radius: 12px; padding: 13px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; font-family: inherit; }
        .pay { background: #18A86B; color: #fff; }
        .fail { background: #FEE2E2; color: #B91C1C; }
        .delay { background: #EFF6FF; color: #1D4ED8; }
        .status { background: #ECFDF3; border: 1px solid #18A86B33; color: #0E7C4A; border-radius: 10px; padding: 10px; font-size: 13px; margin-bottom: 12px; }
    </style>
</head>
<body>
<div class="card">
    <span class="badge">بوابة تجريبية — للتطوير والاختبار فقط (H §12.6)</span>

    @if (session('status'))
        <div class="status">{{ session('status') }}</div>
    @endif

    <div class="muted">المبلغ المستحق (شامل ضريبة القيمة المضافة 15%)</div>
    <div class="amount">{{ $intent->amount }} <span style="font-size:16px">ريال</span></div>

    <div class="row"><span>الأساس</span><span>{{ $intent->base_amount }} ريال</span></div>
    <div class="row"><span>الضريبة (15%)</span><span>{{ $intent->vat_amount }} ريال</span></div>
    <div class="row"><span>يظهر في كشف حسابك باسم</span><span>{{ $statementDescriptor }}</span></div>

    <div class="methods">
        @foreach ($methods as $method)
            <span class="method">
                @switch($method)
                    @case('mada') مدى @break
                    @case('card') بطاقة ائتمانية @break
                    @case('apple_pay') Apple Pay @break
                    @default {{ $method }}
                @endswitch
            </span>
        @endforeach
    </div>

    <form method="post" action="{{ route('test-gateway.complete', ['reference' => $reference]) }}">
        @csrf
        <button class="pay" name="action" value="success" type="submit">ادفع الآن (نجاح)</button>
        <button class="fail" name="action" value="fail" type="submit">محاكاة فشل الدفع</button>
        <button class="delay" name="action" value="delay" type="submit">محاكاة تأخير الويبهوك</button>
        @if (session('status'))
            <button class="pay" name="action" value="success" type="submit" style="background:#0E7C4A">أرسل الويبهوك الآن</button>
        @endif
    </form>
</div>
</body>
</html>
