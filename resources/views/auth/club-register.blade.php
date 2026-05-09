<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — تسجيل نادي جديد</title>
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
.card-sub{font-size:13px;color:#6B7A99;margin-bottom:28px;}

.field{margin-bottom:20px;}
.field label{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:8px;}
.field input{width:100%;padding:12px 14px;background:#0F1117;border:1px solid #232A3E;border-radius:10px;color:#E8EAF0;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;}
.field input:focus{border-color:#009E82;}
.field input::placeholder{color:#3D4A60;}

.field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

.btn{width:100%;padding:13px;background:linear-gradient(135deg,#009E82,#00B894);border:none;border-radius:10px;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:opacity .2s;margin-top:4px;}
.btn:hover{opacity:.9;}
.btn:active{opacity:.8;}

.error-box{background:rgba(224,48,80,.1);border:1px solid rgba(224,48,80,.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;}
.error-box p{font-size:12px;color:#E03050;margin:0;}

.footer-text{text-align:center;margin-top:24px;font-size:12px;color:#3D4A60;}

.login-link{text-align:center;margin-top:20px;}
.login-link a{font-size:13px;color:#009E82;text-decoration:none;}
.login-link a:hover{text-decoration:underline;}
</style>
</head>
<body>

<div class="login-container">
    <div class="logo-section">
        <div class="logo-ar">كورباكت</div>
        <div class="logo-en">CORPACT</div>
        <div class="logo-tag">CLUB</div>
        <div class="logo-desc">تسجيل نادي جديد</div>
    </div>

    <div class="card">
        <div class="card-title">إنشاء حساب نادي</div>
        <div class="card-sub">أدخل بيانات ناديك للتسجيل في المنصة</div>

        @if ($errors->any())
            <div class="error-box">
                @foreach ($errors->all() as $error)
                    <p>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('club.register') }}">
            @csrf

            <div class="field">
                <label for="name">اسم النادي</label>
                <input type="text" id="name" name="name" value="{{ old('name') }}" placeholder="اسم النادي" required autofocus>
            </div>

            <div class="field">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="club@example.com" required dir="ltr">
            </div>

            <div class="field-row">
                <div class="field">
                    <label for="password">كلمة المرور</label>
                    <input type="password" id="password" name="password" placeholder="••••••••" required dir="ltr">
                </div>
                <div class="field">
                    <label for="password_confirmation">تأكيد كلمة المرور</label>
                    <input type="password" id="password_confirmation" name="password_confirmation" placeholder="••••••••" required dir="ltr">
                </div>
            </div>

            <div class="field-row">
                <div class="field">
                    <label for="city">المدينة</label>
                    <input type="text" id="city" name="city" value="{{ old('city') }}" placeholder="الرياض" required>
                </div>
                <div class="field">
                    <label for="district">الحي</label>
                    <input type="text" id="district" name="district" value="{{ old('district') }}" placeholder="العليا" required>
                </div>
            </div>

            <div class="field">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="info@club.com" required dir="ltr">
            </div>

            <div class="field">
                <label for="contact_phone">رقم التواصل</label>
                <input type="tel" id="contact_phone" name="contact_phone" value="{{ old('contact_phone') }}" placeholder="05xxxxxxxx" required dir="ltr">
            </div>

            <button type="submit" class="btn">تسجيل</button>
        </form>

        <div class="login-link">
            <a href="{{ route('club.login') }}">لديك حساب بالفعل؟ تسجيل الدخول</a>
        </div>
    </div>

    <div class="footer-text">كورباكت &copy; {{ date('Y') }}</div>
</div>

</body>
</html>
