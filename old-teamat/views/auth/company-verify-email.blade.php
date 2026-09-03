<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — تأكيد البريد الإلكتروني</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Tahoma,Arial,sans-serif;background:#0F1117;color:#E8EAF0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}

.login-container{width:100%;max-width:420px;}

.logo-section{text-align:center;margin-bottom:36px;}
.logo-ar{font-size:32px;font-weight:900;background:linear-gradient(90deg,#009E82,#D4820A);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.logo-en{font-size:11px;color:rgba(255,255,255,.25);letter-spacing:3px;margin-top:4px;}
.logo-tag{display:inline-block;font-size:10px;font-weight:700;color:#009E82;letter-spacing:2px;border:1px solid rgba(0,158,130,.3);border-radius:4px;padding:2px 8px;margin-top:8px;}
.logo-desc{font-size:13px;color:#6B7A99;margin-top:12px;}

.card{background:#161B27;border:1px solid #232A3E;border-radius:16px;padding:36px 32px;}
.card-title{font-size:18px;font-weight:700;color:#fff;margin-bottom:6px;}
.card-sub{font-size:13px;color:#6B7A99;margin-bottom:28px;line-height:1.8;}

.btn{width:100%;padding:13px;background:linear-gradient(135deg,#009E82,#00B894);border:none;border-radius:10px;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:opacity .2s;}
.btn:hover{opacity:.9;}
.btn:active{opacity:.8;}

.status-box{background:rgba(0,158,130,.1);border:1px solid rgba(0,158,130,.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;}
.status-box p{font-size:12px;color:#009E82;margin:0;}

.footer-text{text-align:center;margin-top:24px;font-size:12px;color:#3D4A60;}
</style>
</head>
<body>

<div class="login-container">
    <div class="logo-section">
        <div class="logo-ar">تيمات</div>
        <div class="logo-en">TEAMAT</div>
        <div class="logo-tag">COMPANY</div>
        <div class="logo-desc">بوابة الشركات</div>
    </div>

    <div class="card">
        <div class="card-title">تأكيد البريد الإلكتروني</div>
        <div class="card-sub">يرجى التحقق من بريدك الإلكتروني والضغط على رابط التأكيد الذي أرسلناه إليك. إذا لم تستلم الرسالة، يمكنك طلب إرسالها مرة أخرى.</div>

        @if (session('status'))
            <div class="status-box">
                <p>{{ session('status') }}</p>
            </div>
        @endif

        <form method="POST" action="{{ route('company.verification.send') }}">
            @csrf
            <button type="submit" class="btn">إعادة إرسال رابط التأكيد</button>
        </form>
    </div>

    <div class="footer-text">تيمات &copy; {{ date('Y') }}</div>
</div>

</body>
</html>
