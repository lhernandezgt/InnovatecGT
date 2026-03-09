// ============================================================
// InnovatecGT · Auth Module
// SHA-256 hash de contraseña, sesión 8 horas
// ============================================================
const ITG_AUTH = (() => {
  const HASH     = '64604f6edcadf034e8b1dc8968383e4f8957fdaa6934a4850049adab5b5767a7';
  const KEY      = 'itg_auth';
  const DURATION = 8 * 60 * 60 * 1000; // 8 horas en ms

  async function sha256(str) {
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function isValid() {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY));
      return s && s.ok && (Date.now() - s.ts) < DURATION;
    } catch { return false; }
  }

  function save() {
    sessionStorage.setItem(KEY, JSON.stringify({ ok: true, ts: Date.now() }));
  }

  function logout() {
    sessionStorage.removeItem(KEY);
    location.reload();
  }

  // Inyecta el overlay de login si no está autenticado
  function protect(onSuccess) {
    if (isValid()) { onSuccess(); return; }

    // Ocultar contenido real
    document.body.style.display = 'none';

    const overlay = document.createElement('div');
    overlay.id = 'itg-login';
    overlay.innerHTML = `
      <style>
        #itg-login {
          position:fixed; inset:0; z-index:99999;
          background:#0a0f1a;
          display:flex; align-items:center; justify-content:center;
          font-family:'Outfit',sans-serif;
        }
        #itg-login .grid-bg {
          position:fixed; inset:0;
          background-image:
            linear-gradient(rgba(30,58,92,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,58,92,0.15) 1px, transparent 1px);
          background-size:50px 50px; z-index:0; pointer-events:none;
        }
        #itg-login::before {
          content:''; position:fixed;
          top:-200px; left:-200px; width:600px; height:600px;
          background:radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
          pointer-events:none;
        }
        #itg-login::after {
          content:''; position:fixed;
          bottom:-200px; right:-200px; width:500px; height:500px;
          background:radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
          pointer-events:none;
        }
        .itg-box {
          background:#111827; border:1px solid #1e3a5f;
          border-radius:16px; padding:36px 32px; width:100%; max-width:380px;
          position:relative; z-index:1;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
        }
        .itg-box::before {
          content:''; position:absolute;
          top:0; left:0; right:0; height:2px; border-radius:16px 16px 0 0;
          background:linear-gradient(90deg,#34d399,#38bdf8,#2563eb);
        }
        .itg-logo {
          display:flex; align-items:center; gap:12px; margin-bottom:28px;
        }
        .itg-logo-icon {
          width:42px; height:42px; position:relative; flex-shrink:0;
        }
        .itg-sq1 {
          position:absolute; width:32px; height:32px; border-radius:8px;
          background:linear-gradient(135deg,rgba(56,189,248,0.6),rgba(14,165,233,0.6));
          top:6px; left:6px; transform:rotate(10deg);
        }
        .itg-sq2 {
          position:absolute; width:32px; height:32px; border-radius:8px;
          background:linear-gradient(135deg,#7dd3fc,#2563eb);
          top:3px; left:3px; transform:rotate(-4deg);
        }
        .itg-dot {
          position:absolute; width:5px; height:5px;
          background:white; border-radius:50%; opacity:0.8;
          top:16px; left:16px;
        }
        .itg-logo-text .t1 { font-size:20px; font-weight:800; color:#e0f2fe; letter-spacing:-0.3px; }
        .itg-logo-text .t1 em { color:#38bdf8; font-style:normal; }
        .itg-logo-text .t2 { font-size:9px; color:#475569; letter-spacing:2px; text-transform:uppercase; margin-top:2px; }
        .itg-title { font-size:14px; font-weight:600; color:#94a3b8; margin-bottom:20px; }
        .itg-input-wrap {
          display:flex; align-items:center;
          background:#1e293b; border:1.5px solid #1e3a5f;
          border-radius:10px; overflow:hidden; margin-bottom:14px;
          transition:border-color 0.15s, box-shadow 0.15s;
        }
        .itg-input-wrap:focus-within {
          border-color:#38bdf8;
          box-shadow:0 0 0 3px rgba(56,189,248,0.12);
        }
        .itg-input-wrap span {
          padding:0 12px; color:#475569; font-size:16px; flex-shrink:0;
        }
        .itg-input-wrap input {
          flex:1; padding:12px 12px 12px 0;
          background:transparent; border:none; outline:none;
          color:#f1f5f9; font-family:'Outfit',sans-serif; font-size:14px;
        }
        .itg-input-wrap input::placeholder { color:#334155; }
        .itg-btn {
          width:100%; padding:13px;
          background:linear-gradient(135deg,#2563eb,#0ea5e9);
          border:none; border-radius:10px;
          color:#fff; font-family:'Outfit',sans-serif;
          font-size:14px; font-weight:700; cursor:pointer;
          transition:all 0.15s; margin-bottom:12px;
          letter-spacing:0.3px;
        }
        .itg-btn:hover { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 8px 20px rgba(37,99,235,0.35); }
        .itg-btn:active { transform:translateY(0); }
        .itg-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .itg-error {
          display:none; padding:10px 14px;
          background:rgba(185,28,28,0.15); border:1px solid rgba(185,28,28,0.3);
          border-radius:8px; color:#fca5a5; font-size:12px; margin-bottom:12px;
          text-align:center;
        }
        .itg-footer { text-align:center; font-size:10px; color:#334155; margin-top:8px; letter-spacing:0.5px; }
      </style>
      <div class="grid-bg"></div>
      <div class="itg-box">
        <div class="itg-logo">
          <div class="itg-logo-icon">
            <div class="itg-sq1"></div>
            <div class="itg-sq2"></div>
            <div class="itg-dot"></div>
          </div>
          <div class="itg-logo-text">
            <div class="t1">Innovatec<em>GT</em></div>
            <div class="t2">Sistema Interno</div>
          </div>
        </div>
        <div class="itg-title">🔐 Ingresa tu contraseña para continuar</div>
        <div class="itg-input-wrap">
          <span>🔑</span>
          <input type="password" id="itg-pass" placeholder="Contraseña" autocomplete="current-password">
        </div>
        <div class="itg-error" id="itg-err">Contraseña incorrecta. Intenta de nuevo.</div>
        <button class="itg-btn" id="itg-btn" onclick="ITG_AUTH.attempt()">Ingresar</button>
        <div class="itg-footer">INNOVACIONES TECNOLÓGICAS DE GUATEMALA · USO EXCLUSIVO INTERNO</div>
      </div>
    `;
    document.documentElement.appendChild(overlay);

    // Enter key
    document.getElementById('itg-pass').addEventListener('keydown', e => {
      if (e.key === 'Enter') ITG_AUTH.attempt();
    });
    // Autofocus
    setTimeout(() => document.getElementById('itg-pass')?.focus(), 100);
  }

  async function attempt() {
    const input = document.getElementById('itg-pass');
    const btn   = document.getElementById('itg-btn');
    const err   = document.getElementById('itg-err');
    if (!input) return;

    btn.disabled = true;
    btn.textContent = 'Verificando...';
    err.style.display = 'none';

    const h = await sha256(input.value);
    if (h === HASH) {
      save();
      document.getElementById('itg-login')?.remove();
      document.body.style.display = '';
      if (typeof window._itgReady === 'function') window._itgReady();
    } else {
      err.style.display = 'block';
      input.value = '';
      input.focus();
      btn.disabled = false;
      btn.textContent = 'Ingresar';
      // Shake animation
      const box = document.querySelector('.itg-box');
      box.style.animation = 'none';
      box.style.transform = 'translateX(-8px)';
      setTimeout(() => box.style.transform = 'translateX(8px)', 80);
      setTimeout(() => box.style.transform = 'translateX(-5px)', 160);
      setTimeout(() => box.style.transform = 'translateX(5px)', 240);
      setTimeout(() => box.style.transform = '', 320);
    }
  }

  return { protect, attempt, isValid, logout, save };
})();
