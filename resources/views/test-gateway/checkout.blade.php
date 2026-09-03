<!DOCTYPE html>
{{--
    The local payment gateway stand-in.

    Never reachable in production: the route is registered only when
    `payments.gateway` is the local driver. It exists so the whole checkout
    path — intent, redirect, signed webhook, paid — can be walked end to end
    without a real acquirer, including the two failure shapes that matter
    (a declined payment and a webhook that arrives late).
--}}
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>بوابة الدفع التجريبية — تيمات</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">

        <style>
            :root { --ink: #0A0A0A; --lime: #C8FF00; --page: #F6F8F5; --hair: rgba(10,10,10,.10); }
            * { box-sizing: border-box; }
            body {
                font-family: 'Almarai', -apple-system, BlinkMacSystemFont, sans-serif;
                background: var(--page); color: var(--ink); margin: 0; padding: 24px;
                display: flex; min-height: 100vh; align-items: center; justify-content: center;
            }
            .card { background: #fff; border: .5px solid var(--hair); border-radius: 16px; padding: 28px; width: 100%; max-width: 420px; }
            .badge { display: inline-block; background: #FEF9E0; color: #C87D00; border: .5px solid rgba(200,125,0,.25); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 700; margin-bottom: 16px; }
            .label { color: rgba(10,10,10,.6); font-size: 12px; }
            .amount { font-size: 34px; font-weight: 800; margin: 4px 0 16px; font-variant-numeric: tabular-nums; }
            .row { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 0; border-bottom: .5px solid var(--hair); }
            .row span:last-child { font-weight: 700; font-variant-numeric: tabular-nums; }
            .methods { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }
            .method { border: .5px solid var(--hair); border-radius: 999px; padding: 5px 12px; font-size: 11px; font-weight: 700; }
            button { width: 100%; border: .5px solid transparent; border-radius: 999px; padding: 13px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 8px; font-family: inherit; }
            .pay { background: var(--lime); color: var(--ink); border-color: var(--lime); }
            .fail { background: #FDEDEC; color: #D9381E; border-color: rgba(217,56,30,.25); }
            .delay { background: rgba(10,10,10,.05); color: var(--ink); border-color: var(--hair); }
            .status { background: #E8F5E9; border: .5px solid rgba(46,125,50,.25); color: #2E7D32; border-radius: 12px; padding: 10px 12px; font-size: 12px; font-weight: 700; margin-bottom: 14px; }
        </style>
    </head>
    <body>
        <div class="card">
            <span class="badge">بوابة تجريبية — للتطوير والاختبار فقط</span>

            @if (session('status'))
                <div class="status">{{ session('status') }}</div>
            @endif

            <div class="label">المبلغ المستحق (شامل ضريبة القيمة المضافة ١٥٪)</div>
            <div class="amount">{{ $intent->amount }} <span style="font-size:15px;font-weight:400">ريال</span></div>

            <div class="row"><span>الأساس</span><span>{{ $intent->base_amount }} ريال</span></div>
            <div class="row"><span>الضريبة (١٥٪)</span><span>{{ $intent->vat_amount }} ريال</span></div>
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
                    <button class="pay" name="action" value="success" type="submit">أرسل الويبهوك الآن</button>
                @endif
            </form>
        </div>
    </body>
</html>
