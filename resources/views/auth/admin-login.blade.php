<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تيمات — دخول المشرف</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Almarai',Tahoma,Arial,sans-serif;background:#F0EDE6;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;}

.logo-section{display:flex;align-items:center;gap:10px;margin-bottom:32px;}
.logo-text{font-size:28px;font-weight:900;color:#0A0A0A;}

.card{background:#fff;border-radius:24px;padding:40px 32px;width:100%;max-width:420px;box-shadow:0 4px 24px rgba(10,10,10,.06);}
.card-title{font-size:24px;font-weight:800;color:#0A0A0A;text-align:center;margin-bottom:6px;}
.card-sub{font-size:14px;color:rgba(10,10,10,0.6);text-align:center;margin-bottom:32px;}

.field{margin-bottom:24px;}
.field label{display:block;font-size:14px;font-weight:700;color:#0A0A0A;margin-bottom:8px;text-align:right;}
.field input{width:100%;padding:14px 16px;background:#fff;border:2px solid rgba(10,10,10,0.1);border-radius:14px;color:#0A0A0A;font-size:15px;font-family:inherit;outline:none;transition:border-color .2s;}
.field input:focus{border-color:#C8FF00;}
.field input::placeholder{color:#C4C0B6;}

.btn{width:100%;padding:16px;background:#C8FF00;border:none;border-radius:14px;color:#0A0A0A;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;transition:opacity .2s;margin-top:8px;}
.btn:hover{opacity:.9;}
.btn:active{opacity:.8;}

.error-box{background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.2);border-radius:14px;padding:12px 16px;margin-bottom:20px;}
.error-box p{font-size:13px;color:#c0392b;margin:0;}

.status-box{background:rgba(200,255,0,.1);border:1px solid rgba(200,255,0,.3);border-radius:14px;padding:12px 16px;margin-bottom:20px;}
.status-box p{font-size:13px;color:#5a7a10;margin:0;}
</style>
</head>
<body>

<div class="logo-section">
    <svg width="40" height="40" viewBox="0 0 52 52"><rect width="52" height="52" rx="13" fill="#C8FF00"/><rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A"/><rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A"/></svg>
    <span class="logo-text">تيمات</span>
</div>

<div class="card">
    <div class="card-title">لوحة المشرف</div>
    <div class="card-sub">أدخل بياناتك للدخول</div>

    @if (session('status'))
        <div class="status-box">
            <p>{{ session('status') }}</p>
        </div>
    @endif
    @if ($errors->any())
        <div class="error-box">
            @foreach ($errors->all() as $error)
                <p>{{ $error }}</p>
            @endforeach
        </div>
    @endif

    <form method="POST" action="{{ route('admin.login') }}">
        @csrf

        <div class="field">
            <label for="email">البريد الإلكتروني</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus dir="ltr">
        </div>

        <div class="field">
            <label for="password">كلمة المرور</label>
            <input type="password" id="password" name="password" required dir="ltr">
        </div>

        <button type="submit" class="btn">دخول — لوحة المشرف</button>
    </form>
</div>

</body>
</html>
