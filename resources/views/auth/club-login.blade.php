<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>كورباكت — دخول النادي</title>
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

.field-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
.remember{display:flex;align-items:center;gap:8px;cursor:pointer;}
.remember input[type="checkbox"]{width:16px;height:16px;accent-color:#009E82;cursor:pointer;}
.remember span{font-size:12px;color:rgba(255,255,255,.5);}

.btn{width:100%;padding:13px;background:linear-gradient(135deg,#009E82,#00B894);border:none;border-radius:10px;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:opacity .2s;}
.btn:hover{opacity:.9;}
.btn:active{opacity:.8;}

.error-box{background:rgba(224,48,80,.1);border:1px solid rgba(224,48,80,.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;}
.error-box p{font-size:12px;color:#E03050;margin:0;}

.footer-text{text-align:center;margin-top:24px;font-size:12px;color:#3D4A60;}

/* Demo credentials */
.demo-section{margin-top:24px;padding-top:20px;border-top:1px solid #232A3E;}
.demo-title{font-size:11px;font-weight:700;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;text-align:center;}
.demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.demo-btn{padding:10px;background:#0F1117;border:1px solid #232A3E;border-radius:8px;cursor:pointer;text-align:center;transition:all .15s;font-family:inherit;}
.demo-btn:hover{border-color:#009E82;background:rgba(0,158,130,.05);}
.demo-btn .demo-role{font-size:11px;font-weight:700;color:#009E82;margin-bottom:2px;}
.demo-btn .demo-email{font-size:10px;color:#6B7A99;direction:ltr;}
</style>
</head>
<body>

<div class="login-container">
    <div class="logo-section">
        <div class="logo-ar">كورباكت</div>
        <div class="logo-en">CORPACT</div>
        <div class="logo-tag">CLUB</div>
        <div class="logo-desc">بوابة الأندية</div>
    </div>

    <div class="card">
        <div class="card-title">تسجيل الدخول</div>
        <div class="card-sub">أدخل بياناتك للوصول إلى لوحة النادي</div>

        @if (session('status'))
            <div style="background:rgba(0,158,130,.1);border:1px solid rgba(0,158,130,.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;">
                <p style="font-size:12px;color:#009E82;margin:0;">{{ session('status') }}</p>
            </div>
        @endif
        @if ($errors->any())
            <div class="error-box">
                @foreach ($errors->all() as $error)
                    <p>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('club.login') }}">
            @csrf

            <div class="field">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="club@corpact.com" required autofocus dir="ltr">
            </div>

            <div class="field">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" name="password" placeholder="••••••••" required dir="ltr">
            </div>

            <div class="field-row">
                <label class="remember">
                    <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}>
                    <span>تذكرني</span>
                </label>
                <a href="{{ route('club.password.request') }}" style="font-size:12px;color:#009E82;text-decoration:none;">نسيت كلمة المرور؟</a>
            </div>

            <button type="submit" class="btn">دخول</button>
        </form>

        <div class="login-link" style="text-align:center;margin-top:20px;">
            <a href="{{ route('club.register') }}" style="font-size:13px;color:#009E82;text-decoration:none;">ليس لديك حساب؟ سجل الآن</a>
        </div>

        <div class="demo-section">
            <div class="demo-title">حسابات تجريبية</div>
            <div class="demo-grid">
                <button type="button" class="demo-btn" onclick="fillDemo('club1@corpact.com')">
                    <div class="demo-role">نادي 1</div>
                    <div class="demo-email">club1@corpact.com</div>
                </button>
                <button type="button" class="demo-btn" onclick="fillDemo('club2@corpact.com')">
                    <div class="demo-role">نادي 2</div>
                    <div class="demo-email">club2@corpact.com</div>
                </button>
            </div>
        </div>
    </div>

    <div class="footer-text">كورباكت &copy; {{ date('Y') }}</div>
</div>

<script>
function fillDemo(email) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = 'password';
}
</script>

</body>
</html>
