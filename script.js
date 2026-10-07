document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const timeNow = () => new Date().toLocaleTimeString('es-AR', { hour12: false });
  const scrollToEl = (el) => el && el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  const LINKEDIN_URL = 'https://www.linkedin.com/in/manuelmolina01';
  const COUNTER_NS = 'manuel-molina-portfolio-2026';

  const store = {
    get: (k, s = localStorage) => { try { return s.getItem(k); } catch (e) { return null; } },
    set: (k, v, s = localStorage) => { try { s.setItem(k, v); } catch (e) { /* almacenamiento no disponible */ } }
  };

  // ==========================================================
  // 0. IDIOMA (ES / EN)
  // Los textos fijos llevan su traducción en data-en; los textos que arma
  // el JavaScript usan L('español', 'english').
  // ==========================================================
  let lang = store.get('lang') || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');
  const L = (es, en) => (lang === 'en' ? en : es);
  const langListeners = [];

  function applyLang(newLang) {
    lang = newLang;
    document.documentElement.lang = lang;
    $$('[data-en]').forEach(el => {
      if (el.dataset.es === undefined) el.dataset.es = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    $$('[data-en-placeholder]').forEach(el => {
      if (el.dataset.esPlaceholder === undefined) el.dataset.esPlaceholder = el.placeholder;
      el.placeholder = lang === 'en' ? el.dataset.enPlaceholder : el.dataset.esPlaceholder;
    });
    const toggle = $('#langToggle');
    if (toggle) toggle.setAttribute('aria-label', L('Switch to English', 'Cambiar a español'));
    const formLang = $('#formLang');
    if (formLang) formLang.value = lang;
    langListeners.forEach(fn => fn());
  }

  const langToggle = $('#langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const next = lang === 'es' ? 'en' : 'es';
      store.set('lang', next);
      applyLang(next);
    });
  }

  // 1. CONTADOR DE VISITAS REALES
  // Solo suma una visita por sesión para no inflar el número al recargar.
  const realViewsCount = $('#realViewsCount');
  if (realViewsCount) {
    const alreadyCounted = store.get('viewCounted', sessionStorage) === '1';
    fetch(`https://api.counterapi.dev/v1/${COUNTER_NS}/pageviews${alreadyCounted ? '' : '/up'}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.count) {
          realViewsCount.innerText = data.count.toLocaleString('es-AR');
          store.set('viewCounted', '1', sessionStorage);
        }
      })
      .catch(() => {
        // Si el servicio no responde, se oculta el badge en lugar de mostrar un número falso.
        const badge = realViewsCount.closest('.live-views-badge');
        if (badge) badge.remove();
      });
  }

  // 2. MENÚ MOBILE
  const menuToggleBtn = $('#menuToggleBtn');
  const navLinks = $('#navLinks');

  function setMenu(open) {
    if (!menuToggleBtn || !navLinks) return;
    navLinks.classList.toggle('open', open);
    menuToggleBtn.setAttribute('aria-expanded', String(open));
    menuToggleBtn.setAttribute('aria-label', open ? L('Cerrar menú', 'Close menu') : L('Abrir menú', 'Open menu'));
    menuToggleBtn.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }

  if (menuToggleBtn && navLinks) {
    menuToggleBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    $$('a', navLinks).forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1024) setMenu(false); });
  }

  // 3. MÁQUINA DE ESCRIBIR DEL HERO
  const typedTextSpan = $('#typedText');
  const typedLines = () => [
    'tail -f eventos.log | grep CRITICAL',
    L('Detección → Triage → Ticket → Escalamiento N2/N3', 'Detection → Triage → Ticket → L2/L3 Escalation'),
    'Grafana · Zabbix · Jira · Redmine · SQL · AD · ITIL'
  ];
  let textArrayIndex = 0;
  let charIndex = 0;

  function type() {
    const text = typedLines()[textArrayIndex];
    if (charIndex < text.length) {
      typedTextSpan.textContent += text.charAt(charIndex++);
      setTimeout(type, 55);
    } else {
      setTimeout(erase, 2200);
    }
  }
  function erase() {
    if (charIndex > 0) {
      typedTextSpan.textContent = typedLines()[textArrayIndex].substring(0, --charIndex);
      setTimeout(erase, 25);
    } else {
      textArrayIndex = (textArrayIndex + 1) % typedLines().length;
      setTimeout(type, 400);
    }
  }
  if (typedTextSpan) {
    if (prefersReducedMotion) {
      langListeners.push(() => { typedTextSpan.textContent = typedLines()[1]; });
    } else {
      langListeners.push(() => { typedTextSpan.textContent = typedLines()[textArrayIndex].substring(0, charIndex); });
      setTimeout(type, 500);
    }
  }

  // 4. NAVEGACIÓN ACTIVA, ANIMACIONES Y CONTADORES
  const navLinkEls = $$('.nav-link');
  const sections = navLinkEls.map(link => $(link.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinkEls.forEach(link => {
          const isActive = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isActive);
          if (isActive) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    if (!prefersReducedMotion) {
      document.documentElement.classList.add('js-reveal');
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      $$('.reveal').forEach(el => revealObserver.observe(el));

      const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / 1200, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.unobserve(el);
        });
      }, { threshold: 0.6 });
      $$('.stat-number[data-target]').forEach(el => statObserver.observe(el));
    }
  }

  // 5. RELOJES Y SPARKLINE DEL HERO
  const clocks = [$('#heroClock'), $('#labClock')].filter(Boolean);
  const tickClocks = () => clocks.forEach(c => { c.textContent = timeNow(); });
  tickClocks();
  setInterval(tickClocks, 1000);

  const toPoints = (values, w, h, max) => values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - Math.min(v / max, 1) * (h - 4) - 2}`)
    .join(' ');

  const heroLine = $('#heroSpark polyline');
  if (heroLine) {
    const heroValues = Array.from({ length: 40 }, () => 30 + Math.random() * 10);
    const drawHero = () => {
      heroValues.shift();
      heroValues.push(28 + Math.random() * 14);
      heroLine.setAttribute('points', toPoints(heroValues, 300, 48, 60));
    };
    drawHero();
    if (!prefersReducedMotion) setInterval(drawHero, 1500);
  }

  // Contadores públicos del LAB (counterapi.dev): una vez por sesión y por acción
  function countLab(key, onCount) {
    const flag = `counted-${key}`;
    const already = store.get(flag, sessionStorage) === '1';
    fetch(`https://api.counterapi.dev/v1/${COUNTER_NS}/${key}${already ? '' : '/up'}`)
      .then(res => res.json())
      .then(data => {
        store.set(flag, '1', sessionStorage);
        if (data && data.count && onCount) onCount(data.count);
      })
      .catch(() => { /* la medición nunca debe romper el LAB */ });
  }
  const showLabStats = (count) => {
    $('#labStats').textContent = count.toLocaleString('es-AR');
    $('#labStatsWrap').classList.remove('hidden');
  };
  // Lectura inicial sin sumar
  fetch(`https://api.counterapi.dev/v1/${COUNTER_NS}/lab-simulations`)
    .then(res => res.json())
    .then(data => { if (data && data.count) showLabStats(data.count); })
    .catch(() => {});

  // ==========================================================
  // 6. LAB: SIMULADOR DE COMMAND CENTER
  // ==========================================================
  const lab = {
    phase: 'idle',          // idle → detected → ticket → escalated → resolved
    scenario: null,
    detectedAt: null,
    escalatedAt: null,
    ticketNum: 1041,
    ticketStatus: 'open',   // open | reassign | escalated | resolved
    escalatedTeam: null,
    evidence: [],
    lastOutput: null,
    triaged: false,
    sound: true
  };

  // 6a. Pestañas accesibles
  const tabs = $$('.tab');
  const tabNames = { dash: 'tab-dash', jira: 'tab-jira', console: 'tab-console', abi: 'tab-abi' };

  function selectTab(tab, focus = false) {
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).classList.toggle('hidden', !selected);
    });
    if (focus) tab.focus();
  }
  function gotoTab(name) {
    const tab = $(`#${tabNames[name]}`);
    if (tab) selectTab(tab);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-goto]');
    if (btn) gotoTab(btn.dataset.goto);
  });

  // 6b. Registro de eventos
  const eventLog = $('#eventLog');
  const eventCount = $('#eventCount');
  let events = 0;

  function addEvent(lvl, msg, onClick) {
    if (!eventLog) return;
    const li = document.createElement('li');
    li.dataset.lvl = lvl;
    li.innerHTML = `<time>${timeNow()}</time><span class="lvl">${lvl}</span>`;
    li.append(document.createTextNode(msg));
    if (onClick) {
      li.classList.add('clickable');
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.addEventListener('click', onClick);
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } });
    }
    eventLog.prepend(li);
    while (eventLog.children.length > 40) eventLog.lastElementChild.remove();
    eventCount.textContent = ++events;
  }

  // 6c. Escenarios de incidente
  const okDns = (host, ip) => [
    ['t-white', 'Server:  dc01.clinica.local'],
    ['t-white', `Name:    ${host}.clinica.local`],
    ['t-white', `Address: ${ip}`],
    ['t-ok', L('✔ El nombre resuelve correctamente.', '✔ The name resolves correctly.')]
  ];
  const okTrace = (gw, ip) => [
    ['t-white', `  1    <1 ms    <1 ms    <1 ms  ${gw}`],
    ['t-white', `  2     1 ms     1 ms     1 ms  ${ip}`],
    ['t-ok', L('Traza completa ✔', 'Trace complete ✔')]
  ];
  // Comando de mesa de ayuda, no depende del incidente (no genera evidencia)
  const adCheck = () => ({
    prompt: 'Get-ADUser jperez -Properties Enabled, LockedOut, PasswordExpired',
    lines: [
      ['t-white', 'SamAccountName  : jperez'],
      ['t-ok', 'Enabled         : True'],
      ['t-err', 'LockedOut       : True'],
      ['t-white', 'PasswordExpired : False'],
      ['t-cyan', L('→ Cuenta bloqueada por intentos fallidos: desbloqueo y blanqueo de clave (caso típico de mesa de ayuda).', '→ Account locked after failed attempts: unlock and password reset (a typical help desk case).')]
    ]
  });
  const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
  const teams = () => ({
    infra: { name: L('Equipo de Infraestructura N2', 'Infrastructure Team L2'), channel: 'infra-n2-guardia', mention: '@Infra-N2' },
    devs: { name: L('Equipo Devs (N3)', 'Dev Team (L3)'), channel: 'devs-guardia', mention: '@Devs-N3' }
  });
  const svcName = (svc) => ({
    web: L('Servidor Web 01', 'Web Server 01'),
    api: L('API Pagos', 'Payments API'),
    sql: L('Base de Datos SQL', 'SQL Database'),
    biocom: L('Servidor App Biocom', 'Biocom App Server'),
    holter: L('Servidor Holter · Cardiología', 'Holter Server · Cardiology'),
    turnos: L('API Turnos', 'Appointments API')
  })[svc];

  const SCENARIOS = {
    biocom: () => ({
      svc: 'biocom', host: 'srv-app-biocom', state: 'crit', port: 1433,
      badge: 'CRITICAL 500', detail: 'HTTP 500', lat: 'TIMEOUT',
      priority: 'P1', impact: 'users', team: 'infra',
      summary: L('[P1] Servidor App Biocom caído · CRITICAL HTTP 500 en producción', '[P1] Biocom App Server down · CRITICAL HTTP 500 in production'),
      symptom: L('HTTP 500 Internal Server Error · health-check 3/3 fallidos', 'HTTP 500 Internal Server Error · health check 3/3 failed'),
      l1: L('Evento validado (no es falso positivo).', 'Event validated (not a false positive).'),
      warnEvent: L('srv-app-biocom: latencia > 2000 ms (umbral superado)', 'srv-app-biocom: latency > 2000 ms (threshold exceeded)'),
      critEvent: L('srv-app-biocom: HTTP 500 · health-check 3/3 fallidos. Clic para abrir incidente', 'srv-app-biocom: HTTP 500 · health check 3/3 failed. Click to open incident'),
      triage: L('Triage: la app no llega a la base de datos por el puerto 1433', 'Triage: the app cannot reach the database on port 1433'),
      wrongTeam: L('Devs: el código no cambió y la app no llega a la BD por red. Corresponde a Infraestructura, reasignar.', 'Devs: no code changes and the app cannot reach the DB over the network. This belongs to Infrastructure, please reassign.'),
      resolving: L('Infra N2: regla de firewall restaurada hacia sql-prod-01:1433, reiniciando pool de conexiones', 'Infra L2: firewall rule to sql-prod-01:1433 restored, restarting connection pool'),
      console: {
        api: {
          prompt: 'curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://srv-app-biocom/health',
          lines: () => [
            ['t-err', '500 30.012s'],
            ['t-cyan', L('→ El health check devuelve 500 y tarda 30 s: se cuelga esperando la BD.', '→ The health check returns 500 and takes 30 s: it hangs waiting for the DB.')]
          ],
          evidence: () => 'curl /health → HTTP 500 (30 s)'
        },
        dns: { prompt: 'nslookup sql-prod-01', lines: () => okDns('sql-prod-01', '10.20.4.15'), evidence: () => L('nslookup sql-prod-01 OK: se descarta DNS', 'nslookup sql-prod-01 OK: DNS ruled out') },
        tracert: {
          prompt: 'tracert -d sql-prod-01',
          lines: () => [
            ['t-white', '  1    <1 ms    <1 ms    <1 ms  10.20.3.1'],
            ['t-white', '  2     1 ms     1 ms     1 ms  10.20.4.15'],
            ['t-cyan', L('→ La ruta llega al host: el bloqueo está en el puerto 1433 (firewall).', '→ The route reaches the host: port 1433 is being blocked (firewall).')]
          ],
          evidence: () => L('tracert sql-prod-01: ruta OK, bloqueo en puerto 1433', 'tracert sql-prod-01: route OK, port 1433 blocked')
        },
        svc: {
          prompt: 'Get-Service BiocomApp | Select Status, Name',
          lines: () => [['t-ok', 'Running  BiocomApp'], ['t-muted', L('→ El servicio está corriendo, pero no llega a la base.', '→ The service is running, but cannot reach the database.')]],
          evidence: () => L('Servicio BiocomApp: Running (no es caída del servicio)', 'BiocomApp service: Running (the service itself is up)')
        },
        res: {
          prompt: 'Get-Counter "\\Processor(_Total)\\% Processor Time","\\Memory\\% Committed Bytes In Use"',
          lines: () => [['t-white', 'CPU 18%   MEM 61%   DISK C: 54%'], ['t-ok', L('→ Recursos normales: no es un problema de capacidad.', '→ Normal resources: not a capacity problem.')]],
          evidence: () => L('srv-app-biocom: CPU 18%, MEM 61% (recursos normales)', 'srv-app-biocom: CPU 18%, MEM 61% (normal resources)')
        },
        log: {
          prompt: 'tail -n 8 /var/log/biocom/app.log',
          lines: () => [
            ['t-muted', `${ts()} INFO  [http] GET /api/turnos 200 64ms`],
            ['t-warn', `${ts()} WARN  [db] pool: esperando conexión libre (30s)...`],
            ['t-err', `${ts()} ERROR [db] Connection TimeOut: Database unreachable on Port 1433 (sql-prod-01)`],
            ['t-err', `${ts()} ERROR [db] java.sql.SQLException: Login timeout expired`],
            ['t-err', `${ts()} ERROR [http] GET /api/turnos 500 Internal Server Error 30012ms`],
            ['t-warn', L('⚠ 214 errores HTTP 500 en los últimos 5 minutos.', '⚠ 214 HTTP 500 errors in the last 5 minutes.')]
          ],
          evidence: () => L('app.log: "Connection TimeOut: Database unreachable on Port 1433" + 214 HTTP 500 en 5 min', 'app.log: "Connection TimeOut: Database unreachable on Port 1433" + 214 HTTP 500 in 5 min')
        },
        sql: {
          prompt: 'sqlcmd -S sql-prod-01,1433 -Q "SELECT @@SERVERNAME, GETDATE();"',
          lines: () => [
            ['t-err', 'Sqlcmd: Error: Microsoft ODBC Driver 17 for SQL Server : TCP Provider: Timeout error [258].'],
            ['t-err', 'Sqlcmd: Error: Login timeout expired.'],
            ['t-err', 'Connection TimeOut: Database unreachable on Port 1433'],
            ['t-cyan', L('→ La BD está OK en Grafana pero no es alcanzable desde la app: red / firewall. Escalar a Infraestructura N2.', '→ The DB is OK in Grafana but unreachable from the app: network / firewall. Escalate to Infrastructure L2.')]
          ],
          evidence: () => L('sqlcmd desde srv-app-biocom: "Login timeout expired · Database unreachable on Port 1433"', 'sqlcmd from srv-app-biocom: "Login timeout expired · Database unreachable on Port 1433"')
        },
        ping: {
          prompt: 'ipconfig && ping -n 4 sql-prod-01',
          lines: () => [
            ['t-white', '   IPv4 Address. . . . : 10.20.3.21'],
            ['t-white', '   Default Gateway . . : 10.20.3.1'],
            ['t-white', 'Reply from 10.20.4.15: bytes=32 time=1ms TTL=127  (x4)'],
            ['t-ok', 'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'],
            ['t-warn', L('→ Hay ping al servidor de BD: el host vive, el problema está en el puerto.', '→ The DB server answers ping: the host is up, the problem is the port.')]
          ],
          evidence: () => L('ping sql-prod-01 OK (0% pérdida): el host responde, falla el servicio/puerto', 'ping sql-prod-01 OK (0% loss): host is up, service/port fails')
        },
        port: {
          prompt: 'Test-NetConnection sql-prod-01 -Port 1433',
          lines: () => [
            ['t-warn', 'WARNING: TCP connect to (10.20.4.15 : 1433) failed'],
            ['t-white', 'RemotePort       : 1433'],
            ['t-white', 'PingSucceeded    : True'],
            ['t-err', 'TcpTestSucceeded : False']
          ],
          evidence: () => 'Test-NetConnection sql-prod-01:1433 → Ping OK, TcpTestSucceeded: False'
        }
      }
    }),

    holter: () => ({
      svc: 'holter', host: 'srv-holter-01', state: 'crit', port: 8080,
      badge: 'DOWN', detail: L('sin señal', 'no signal'), lat: 'NO DATA',
      priority: 'P1', impact: 'patients', team: 'infra', notify: L('@Guardia-Cardiología', '@Cardiology-OnCall'),
      summary: L('[P1] Servidor Holter caído · los estudios no llegan a Cardiología', '[P1] Holter server down · studies are not reaching Cardiology'),
      symptom: L('Sin señal de srv-holter-01: los Holters no transfieren el ritmo cardíaco a las PCs de Cardiología. Sin servidor, el estudio no se puede hacer y el paciente no puede ser atendido.', 'No signal from srv-holter-01: Holters are not transferring heart rhythm data to the Cardiology PCs. Without the server the study cannot be done and the patient cannot be seen.'),
      l1: L('Validado con ipconfig y ping desde la PC de Cardiología: la red de la PC está OK, el servidor no responde.', 'Validated with ipconfig and ping from the Cardiology PC: the PC network is OK, the server does not respond.'),
      warnEvent: L('srv-holter-01: sin transacciones de HolterSync hace 5 min', 'srv-holter-01: no HolterSync transactions for 5 min'),
      critEvent: L('srv-holter-01 DOWN · los estudios Holter no llegan a Cardiología. Clic para abrir incidente', 'srv-holter-01 DOWN · Holter studies are not reaching Cardiology. Click to open incident'),
      triage: L('Triage: la PC de Cardiología tiene red, el servidor Holter no responde', 'Triage: the Cardiology PC has network, the Holter server does not respond'),
      wrongTeam: L('Devs: el servidor no responde ni a ping, es un problema de infraestructura. Reasignar a Infra N2.', 'Devs: the server does not even answer ping, this is an infrastructure issue. Reassign to Infra L2.'),
      resolving: L('Infra N2: servidor Holter reiniciado (servicio HolterSync detenido), sincronizando estudios en cola', 'Infra L2: Holter server restarted (HolterSync service was stopped), syncing queued studies'),
      console: {
        api: {
          prompt: 'curl -s -m 10 https://srv-holter-01:8080/status',
          lines: () => [['t-err', 'curl: (28) Connection timed out after 10001 milliseconds']],
          evidence: () => 'curl srv-holter-01:8080/status → timeout (10 s)'
        },
        dns: { prompt: 'nslookup srv-holter-01', lines: () => okDns('srv-holter-01', '10.20.8.40'), evidence: () => L('nslookup srv-holter-01 OK: el nombre resuelve', 'nslookup srv-holter-01 OK: name resolves') },
        tracert: {
          prompt: 'tracert -d srv-holter-01',
          lines: () => [
            ['t-white', '  1    <1 ms    <1 ms    <1 ms  10.20.8.1'],
            ['t-err', '  2     *        *        *     Request timed out.'],
            ['t-err', '  3     *        *        *     Request timed out.'],
            ['t-cyan', L('→ La ruta muere después del gateway de Cardiología: el servidor no responde.', '→ The route dies after the Cardiology gateway: the server does not respond.')]
          ],
          evidence: () => L('tracert srv-holter-01: sin respuesta después de 10.20.8.1', 'tracert srv-holter-01: no response after 10.20.8.1')
        },
        svc: {
          prompt: 'Get-Service -ComputerName srv-holter-01 HolterSync',
          lines: () => [['t-err', "Get-Service : Cannot open Service Control Manager on computer 'srv-holter-01'."], ['t-err', 'The RPC server is unavailable.']],
          evidence: () => L('Get-Service HolterSync: servidor RPC no disponible', 'Get-Service HolterSync: RPC server unavailable')
        },
        res: {
          prompt: 'Get-Counter -ComputerName srv-holter-01 "\\Memory\\% Committed Bytes In Use"',
          lines: () => [['t-err', 'Get-Counter : Unable to connect to the specified computer or the computer is offline.']],
          evidence: () => L('Get-Counter srv-holter-01: equipo fuera de línea', 'Get-Counter srv-holter-01: computer offline')
        },
        log: {
          prompt: 'type C:\\HolterSync\\logs\\cliente.log | tail -6',
          lines: () => [
            ['t-muted', `${ts()} INFO  ${L('Estudio H-2231 recibido del equipo Holter #4', 'Study H-2231 received from Holter device #4')}`],
            ['t-err', `${ts()} ERROR ${L('No se pudo conectar con srv-holter-01:8080 (timeout)', 'Could not connect to srv-holter-01:8080 (timeout)')}`],
            ['t-err', `${ts()} ERROR ${L('Transferencia del estudio H-2231 fallida, reintento 3/3', 'Transfer of study H-2231 failed, retry 3/3')}`],
            ['t-warn', `${ts()} WARN  ${L('6 estudios en cola sin transferir', '6 studies queued, not transferred')}`],
            ['t-warn', L('⚠ Los estudios Holter no llegan a las PCs de Cardiología.', '⚠ Holter studies are not reaching the Cardiology PCs.')]
          ],
          evidence: () => L('HolterSync: "No se pudo conectar con srv-holter-01:8080" · 6 estudios en cola', 'HolterSync: "Could not connect to srv-holter-01:8080" · 6 studies queued')
        },
        sql: {
          prompt: 'SELECT TOP 4 estudio, equipo, estado FROM holter_estudios ORDER BY fecha DESC;',
          lines: () => [
            ['t-white', 'estudio  equipo      estado'],
            ['t-white', '-------  ----------  -----------------------'],
            ['t-err', 'H-2231   Holter #4   PENDIENTE_TRANSFERENCIA'],
            ['t-err', 'H-2230   Holter #2   PENDIENTE_TRANSFERENCIA'],
            ['t-err', 'H-2229   Holter #7   PENDIENTE_TRANSFERENCIA'],
            ['t-ok', 'H-2228   Holter #1   TRANSFERIDO'],
            ['t-cyan', L('→ Las transacciones se cortaron: desde H-2229 nada se transfirió.', '→ Transactions stopped: nothing has been transferred since H-2229.')]
          ],
          evidence: () => L('holter_estudios: 6 estudios en PENDIENTE_TRANSFERENCIA desde H-2229', 'holter_estudios: 6 studies stuck in PENDIENTE_TRANSFERENCIA since H-2229')
        },
        ping: {
          prompt: 'ipconfig && ping -n 4 srv-holter-01',
          lines: () => [
            ['t-white', '   IPv4 Address. . . . : 10.20.8.57'],
            ['t-white', '   Default Gateway . . : 10.20.8.1'],
            ['t-err', 'Request timed out.  (x4)'],
            ['t-err', 'Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)'],
            ['t-cyan', L('→ La PC tiene IP y gateway OK; el servidor Holter no responde. Escalar P1 a Infraestructura.', '→ The PC has a valid IP and gateway; the Holter server does not respond. Escalate P1 to Infrastructure.')]
          ],
          evidence: () => L('ipconfig OK en la PC de Cardiología · ping srv-holter-01: 100% de pérdida', 'ipconfig OK on the Cardiology PC · ping srv-holter-01: 100% loss')
        },
        port: {
          prompt: 'Test-NetConnection srv-holter-01 -Port 8080',
          lines: () => [
            ['t-warn', 'WARNING: Ping to srv-holter-01 failed with status: TimedOut'],
            ['t-white', 'RemotePort       : 8080'],
            ['t-err', 'PingSucceeded    : False'],
            ['t-err', 'TcpTestSucceeded : False']
          ],
          evidence: () => 'Test-NetConnection srv-holter-01:8080 → Ping False, TcpTestSucceeded: False'
        }
      }
    }),

    sql: () => ({
      svc: 'sql', host: 'sql-prod-01', state: 'warn', port: 1433,
      badge: 'WARN DISK 96%', detail: 'DISK D: 96%', lat: 'DISK 96%',
      priority: 'P2', impact: 'risk', team: 'infra',
      summary: L('[P2] Base de Datos SQL · disco de datos al 96%', '[P2] SQL Database · data disk at 96%'),
      symptom: L('Disco D: al 96% en sql-prod-01 y en aumento por el log de transacciones. Si se llena, la BD deja de escribir y cae la operación.', 'Disk D: at 96% on sql-prod-01 and growing because of the transaction log. If it fills up, the DB stops writing and operations go down.'),
      l1: L('Evento preventivo: todavía no hay impacto en usuarios.', 'Preventive event: no user impact yet.'),
      warnEvent: L('sql-prod-01: disco D: supera el 90%', 'sql-prod-01: disk D: above 90%'),
      critEvent: L('sql-prod-01: disco D: al 96% y creciendo. Clic para abrir incidente', 'sql-prod-01: disk D: at 96% and growing. Click to open incident'),
      triage: L('Triage: el log de transacciones ocupa 180 GB', 'Triage: the transaction log takes 180 GB'),
      wrongTeam: L('Devs: no es un problema de la aplicación, es espacio en disco del servidor. Reasignar a Infra N2 (DBA).', 'Devs: not an application issue, it is server disk space. Reassign to Infra L2 (DBA).'),
      resolving: L('Infra N2 (DBA): backup del log de transacciones y liberación de espacio en curso', 'Infra L2 (DBA): transaction log backup and space reclaim in progress'),
      console: {
        api: {
          prompt: 'curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://srv-app-biocom/health',
          lines: () => [['t-ok', '200 1.82s'], ['t-warn', L('→ Las apps todavía responden, pero más lento por los autogrow del log.', '→ Apps still respond, but slower because of the log autogrow.')]],
          evidence: () => L('Apps responden 200 pero en 1,8 s (degradación leve)', 'Apps respond 200 but in 1.8 s (slight degradation)')
        },
        dns: { prompt: 'nslookup sql-prod-01', lines: () => okDns('sql-prod-01', '10.20.4.15'), evidence: () => L('nslookup sql-prod-01 OK', 'nslookup sql-prod-01 OK') },
        tracert: { prompt: 'tracert -d sql-prod-01', lines: () => okTrace('10.20.3.1', '10.20.4.15'), evidence: () => L('tracert sql-prod-01: ruta OK', 'tracert sql-prod-01: route OK') },
        svc: {
          prompt: 'Get-Service MSSQLSERVER, SQLSERVERAGENT | Select Status, Name',
          lines: () => [['t-ok', 'Running  MSSQLSERVER'], ['t-ok', 'Running  SQLSERVERAGENT']],
          evidence: () => L('Servicios SQL en Running', 'SQL services Running')
        },
        res: {
          prompt: 'Get-PSDrive D | Select Used, Free',
          lines: () => [['t-white', 'CPU 22%   MEM 70%'], ['t-err', 'DISK D: 96% (19.2 GB libres de 500 GB)'], ['t-cyan', L('→ Al ritmo actual el disco se llena en pocas horas.', '→ At the current rate the disk fills up within hours.')]],
          evidence: () => L('Disco D: 96% (19,2 GB libres de 500 GB)', 'Disk D: 96% (19.2 GB free of 500 GB)')
        },
        log: {
          prompt: 'Get-Content ERRORLOG -Tail 5',
          lines: () => [
            ['t-muted', `${ts()} spid51  Log was backed up 26 hours ago.`],
            ['t-warn', `${ts()} spid64  Autogrow of file 'clinica_log' in database 'clinica' took 18250 ms.`],
            ['t-warn', `${ts()} spid64  Disk D: 96% used (19.2 GB free of 500 GB).`],
            ['t-warn', L('⚠ El log de transacciones crece sin backups recientes.', '⚠ The transaction log keeps growing without recent backups.')]
          ],
          evidence: () => L('ERRORLOG: autogrow de clinica_log (18 s) · disco D: al 96% · último backup de log hace 26 h', 'ERRORLOG: clinica_log autogrow (18 s) · disk D: 96% · last log backup 26 h ago')
        },
        sql: {
          prompt: 'SELECT name, size_gb, used_pct FROM vw_archivos_bd;',
          lines: () => [
            ['t-white', 'name           size_gb  used_pct'],
            ['t-white', '-------------  -------  --------'],
            ['t-white', 'clinica_data   290      71'],
            ['t-err', 'clinica_log    180      99'],
            ['t-cyan', L('→ El log ocupa 180 GB: falta el backup de log. Escalar a Infra N2 (DBA).', '→ The log takes 180 GB: log backup is missing. Escalate to Infra L2 (DBA).')]
          ],
          evidence: () => L('clinica_log: 180 GB al 99% de uso', 'clinica_log: 180 GB, 99% used')
        },
        ping: {
          prompt: 'ipconfig && ping -n 4 sql-prod-01',
          lines: () => [
            ['t-white', '   IPv4 Address. . . . : 10.20.3.21'],
            ['t-white', 'Reply from 10.20.4.15: bytes=32 time=1ms TTL=127  (x4)'],
            ['t-ok', 'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'],
            ['t-muted', L('→ Conectividad OK: el problema es de espacio, no de red.', '→ Connectivity OK: this is a space issue, not a network one.')]
          ],
          evidence: () => L('ping sql-prod-01 OK: se descarta problema de red', 'ping sql-prod-01 OK: network issue ruled out')
        },
        port: {
          prompt: 'Test-NetConnection sql-prod-01 -Port 1433',
          lines: () => [
            ['t-white', 'RemotePort       : 1433'],
            ['t-ok', 'TcpTestSucceeded : True'],
            ['t-muted', L('→ El servicio SQL responde.', '→ The SQL service responds.')]
          ],
          evidence: () => 'Test-NetConnection sql-prod-01:1433 → True'
        }
      }
    }),

    turnos: () => ({
      svc: 'turnos', host: 'api-turnos', state: 'warn', port: 443,
      badge: 'WARN MEM 95%', detail: 'MEM 95% · cache 97%', lat: 'MEM 95%',
      priority: 'P2', impact: 'risk', team: 'devs',
      summary: L('[P2] API Turnos · memoria al 95% y caché saturada', '[P2] Appointments API · memory at 95% and cache saturated'),
      symptom: L('Memoria al 95% y caché al 97% en api-turnos. Si se satura, el sistema hospitalario deja de dar turnos.', 'Memory at 95% and cache at 97% on api-turnos. If it saturates, the hospital system stops booking appointments.'),
      l1: L('Limpieza de caché ejecutada por runbook (95% → 71%), pero el consumo vuelve a subir: posible pérdida de memoria.', 'Cache cleanup run per runbook (95% → 71%), but usage climbs again: possible memory leak.'),
      warnEvent: L('api-turnos: memoria > 85%', 'api-turnos: memory > 85%'),
      critEvent: L('api-turnos: memoria 95% · caché 97%. Clic para abrir incidente', 'api-turnos: memory 95% · cache 97%. Click to open incident'),
      triage: L('Triage: tras limpiar la caché la memoria vuelve a subir', 'Triage: memory climbs again after the cache cleanup'),
      wrongTeam: L('Infra: el servidor tiene recursos y la red está OK; la memoria la consume la aplicación. Reasignar a Devs N3.', 'Infra: the server has resources and the network is fine; the application is consuming the memory. Reassign to Devs L3.'),
      resolving: L('Devs N3: hotfix de pérdida de memoria desplegado, reiniciando instancias', 'Devs L3: memory leak hotfix deployed, restarting instances'),
      console: {
        api: {
          prompt: 'curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://api-turnos/health',
          lines: () => [['t-warn', '200 2.41s'], ['t-cyan', L('→ Responde, pero 30 veces más lento que lo normal (80 ms).', '→ It responds, but 30 times slower than normal (80 ms).')]],
          evidence: () => L('curl api-turnos/health → 200 en 2,41 s (normal 80 ms)', 'curl api-turnos/health → 200 in 2.41 s (normal 80 ms)')
        },
        dns: { prompt: 'nslookup api-turnos', lines: () => okDns('api-turnos', '10.20.5.40'), evidence: () => L('nslookup api-turnos OK', 'nslookup api-turnos OK') },
        tracert: { prompt: 'tracert -d api-turnos', lines: () => okTrace('10.20.3.1', '10.20.5.40'), evidence: () => L('tracert api-turnos: ruta OK', 'tracert api-turnos: route OK') },
        svc: {
          prompt: 'Get-Service api-turnos | Select Status, StartTime',
          lines: () => [['t-ok', L('Running   iniciado hace 41 días', 'Running   started 41 days ago')], ['t-muted', L('→ Sin reinicios: la memoria se viene acumulando.', '→ No restarts: memory has been piling up.')]],
          evidence: () => L('Servicio api-turnos: Running, 41 días sin reinicio', 'api-turnos service: Running, 41 days without restart')
        },
        res: {
          prompt: 'Get-Counter "\\Memory\\% Committed Bytes In Use"; Get-CacheStats',
          lines: () => [['t-white', 'CPU 64%'], ['t-err', 'MEM 95% (3.8 / 4 GB)   CACHE 97%']],
          evidence: () => L('api-turnos: MEM 95% (3,8/4 GB), caché 97%', 'api-turnos: MEM 95% (3.8/4 GB), cache 97%')
        },
        log: {
          prompt: 'tail -n 6 /var/log/api-turnos/app.log',
          lines: () => [
            ['t-warn', `${ts()} WARN  [jvm] heap 95% (3.8 / 4 GB)`],
            ['t-warn', `${ts()} WARN  [cache] evictions/s 1240 · hit ratio 41%`],
            ['t-ok', `${ts()} INFO  ${L('Runbook L1: limpieza de caché ejecutada → MEM 95% → 71%', 'L1 runbook: cache cleanup executed → MEM 95% → 71%')}`],
            ['t-warn', `${ts()} WARN  [jvm] heap 83% ${L('a los 10 min', 'after 10 min')}`],
            ['t-cyan', L('→ El consumo vuelve a subir después de limpiar: posible pérdida de memoria. Escalar a Devs N3.', '→ Usage climbs again after the cleanup: possible memory leak. Escalate to Devs L3.')]
          ],
          evidence: () => L('app.log: heap 95%, limpieza de caché → 71%, vuelve a 83% en 10 min', 'app.log: heap 95%, cache cleanup → 71%, back to 83% in 10 min')
        },
        sql: {
          prompt: 'SELECT COUNT(*) AS sesiones FROM turnos_sesiones WHERE activa = 1;',
          lines: () => [
            ['t-white', 'sesiones'],
            ['t-white', '--------'],
            ['t-warn', '48213'],
            ['t-cyan', L('→ Las sesiones no se liberan (normal: ~3.000).', '→ Sessions are not being released (normal: ~3,000).')]
          ],
          evidence: () => L('turnos_sesiones: 48.213 sesiones activas (normal ~3.000)', 'turnos_sesiones: 48,213 active sessions (normal ~3,000)')
        },
        ping: {
          prompt: 'ipconfig && ping -n 4 api-turnos',
          lines: () => [
            ['t-white', '   IPv4 Address. . . . : 10.20.3.21'],
            ['t-white', 'Reply from 10.20.5.40: bytes=32 time=2ms TTL=127  (x4)'],
            ['t-ok', 'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'],
            ['t-muted', L('→ Red OK: el problema es de la aplicación.', '→ Network OK: the issue is in the application.')]
          ],
          evidence: () => L('ping api-turnos OK: se descarta problema de red', 'ping api-turnos OK: network issue ruled out')
        },
        port: {
          prompt: 'Test-NetConnection api-turnos -Port 443',
          lines: () => [
            ['t-white', 'RemotePort       : 443'],
            ['t-ok', 'TcpTestSucceeded : True'],
            ['t-warn', L('→ Responde, pero con tiempos de 2,4 s por la presión de memoria.', '→ It responds, but with 2.4 s response times due to memory pressure.')]
          ],
          evidence: () => L('api-turnos:443 responde con 2,4 s de latencia', 'api-turnos:443 responds with 2.4 s latency')
        }
      }
    })
  };
  const sc = () => (lab.scenario ? SCENARIOS[lab.scenario]() : null);

  // Salidas de consola cuando todo está sano
  const healthyOutput = (cmd, host) => ({
    api: { prompt: `curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://${host}/health`, lines: [['t-ok', '200 0.081s']] },
    dns: { prompt: `nslookup ${host}`, lines: okDns(host, '10.20.3.21') },
    tracert: { prompt: `tracert -d ${host}`, lines: okTrace('10.20.3.1', '10.20.3.21') },
    svc: { prompt: 'Get-Service BiocomApp | Select Status, Name', lines: [['t-ok', 'Running  BiocomApp']] },
    res: { prompt: 'Get-Counter (CPU / MEM / DISK)', lines: [['t-ok', 'CPU 15%   MEM 58%   DISK C: 54%']] },
    log: { prompt: `tail -n 4 /var/log/${host}/app.log`, lines: [
      ['t-muted', `${ts()} INFO  [http] GET /health 200 9ms`],
      ['t-muted', `${ts()} INFO  [db] pool: 12/50`],
      ['t-ok', L('✔ Sin errores en los últimos 15 minutos.', '✔ No errors in the last 15 minutes.')]] },
    sql: { prompt: 'sqlcmd -S sql-prod-01,1433 -Q "SELECT @@SERVERNAME, GETDATE();"', lines: [
      ['t-white', `SQL-PROD-01       ${ts()}`],
      ['t-ok', L('(1 fila) ✔ Consulta OK en 11 ms', '(1 row) ✔ Query OK in 11 ms')]] },
    ping: { prompt: `ipconfig && ping -n 4 ${host}`, lines: [
      ['t-white', '   IPv4 Address. . . . : 10.20.3.21'],
      ['t-white', '   Default Gateway . . : 10.20.3.1'],
      ['t-ok', 'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)']] },
    port: { prompt: `Test-NetConnection ${host} -Port 443`, lines: [
      ['t-ok', 'TcpTestSucceeded : True']] }
  })[cmd];

  // 6d. Línea de tiempo y barra de estado
  const stepOrder = ['detect', 'triage', 'ticket', 'escalate', 'resolve'];
  function updateSteps() {
    const done = {
      detect: lab.phase !== 'idle',
      triage: lab.triaged,
      ticket: ['ticket', 'escalated', 'resolved'].includes(lab.phase),
      escalate: ['escalated', 'resolved'].includes(lab.phase),
      resolve: lab.phase === 'resolved'
    };
    const current = stepOrder.find(s => !done[s]);
    $$('#incidentSteps li').forEach(li => {
      const s = li.dataset.step;
      li.classList.toggle('done', done[s]);
      li.classList.toggle('current', lab.phase !== 'idle' && s === current);
    });
  }

  const incidentActive = () => ['detected', 'ticket', 'escalated'].includes(lab.phase);

  function updateGlobal() {
    const crit = $$('.svc[data-state="crit"]').length;
    const warn = $$('.svc[data-state="warn"], .svc[data-state="recovering"]').length;
    const total = $$('.svc').length;
    $('#svcOkCount').textContent = `${total - crit - warn}/${total}`;
    $('#openIncidents').textContent = incidentActive() ? 1 : 0;
    const dot = $('#globalDot');
    const status = $('#globalStatus');
    if (crit) {
      dot.className = 'h-2.5 w-2.5 rounded-full bg-cc-crit animate-pulse';
      status.className = 'text-cc-crit';
      status.textContent = L('MAJOR OUTAGE · 1 SERVICIO CRÍTICO', 'MAJOR OUTAGE · 1 CRITICAL SERVICE');
    } else if (warn) {
      dot.className = 'h-2.5 w-2.5 rounded-full bg-cc-warn animate-pulse';
      status.className = 'text-cc-warn';
      status.textContent = L('DEGRADED · 1 SERVICIO EN ALERTA', 'DEGRADED · 1 SERVICE IN WARNING');
    } else {
      dot.className = 'h-2.5 w-2.5 rounded-full bg-cc-ok';
      status.className = 'text-cc-ok';
      status.textContent = 'ALL SYSTEMS OPERATIONAL';
    }
    $('#jiraBadge').classList.toggle('hidden', !['detected', 'ticket'].includes(lab.phase));
    $('#consoleHost').textContent = incidentActive() ? sc().host : 'srv-app-biocom';
  }

  function renderDashHint() {
    const hint = $('#dashHint');
    if (!hint) return;
    if (lab.phase === 'idle') {
      hint.innerHTML = L('<span class="text-cc-cyan">tip:</span> elegí un escenario y presioná <b class="text-white">Simular Evento de Caída</b>. Después seguí el incidente por las pestañas.',
        '<span class="text-cc-cyan">tip:</span> pick a scenario and press <b class="text-white">Simulate Outage Event</b>. Then follow the incident through the tabs.');
    } else if (lab.phase === 'resolved') {
      hint.innerHTML = L('<span class="text-cc-ok">ok:</span> incidente resuelto. Podés reiniciar el escenario desde la pestaña Tickets.',
        '<span class="text-cc-ok">ok:</span> incident resolved. You can reset the scenario from the Tickets tab.');
    } else {
      hint.innerHTML = L(`<span class="text-cc-crit">alerta:</span> hacé clic en <b class="text-white">${svcName(sc().svc)}</b> para registrar y escalar el incidente.`,
        `<span class="text-cc-crit">alert:</span> click <b class="text-white">${svcName(sc().svc)}</b> to log and escalate the incident.`);
    }
  }

  // 6e. Widget 1: tarjetas de servicio con métricas en vivo
  const services = $$('.svc').map(card => {
    const base = { web: 42, api: 88, sql: 12, biocom: 65, holter: 30, turnos: 75 }[card.dataset.svc] || 50;
    return {
      card,
      base,
      values: Array.from({ length: 30 }, () => base + (Math.random() - 0.5) * base * 0.3),
      line: $('.spark polyline', card),
      lat: $('.svc-lat', card),
      hostEl: $('.svc-host', card),
      badge: $('.svc-badge', card)
    };
  });
  const svcBy = (id) => services.find(s => s.card.dataset.svc === id);

  function tickServices() {
    services.forEach(s => {
      const state = s.card.dataset.state;
      const max = s.base * 2.6;
      let v;
      if (state === 'crit') v = max;
      else if (state === 'warn') v = s.base * (2 + Math.random() * 0.4);
      else if (state === 'recovering') v = s.base * (1.4 + Math.random() * 0.3);
      else v = s.base + (Math.random() - 0.5) * s.base * 0.35;
      s.values.shift();
      s.values.push(v);
      s.line.setAttribute('points', toPoints(s.values, 200, 40, max));
      s.lat.textContent = (state === 'crit' || state === 'warn') && lab.scenario === s.card.dataset.svc
        ? sc().lat
        : `${Math.round(v)} ms`;
    });
  }
  if (services.length) {
    tickServices();
    setInterval(tickServices, prefersReducedMotion ? 4000 : 2000);
  }

  function setServiceState(s, state) {
    s.card.dataset.state = state;
    const scen = sc();
    if (state === 'crit' || state === 'warn') {
      s.badge.textContent = scen.badge;
      s.hostEl.textContent = `${s.card.dataset.host} · ${scen.detail}`;
    } else if (state === 'recovering') {
      s.badge.textContent = 'RECOVERING';
      s.hostEl.textContent = `${s.card.dataset.host} · ${L('normalizando', 'recovering')}`;
    } else {
      s.badge.textContent = 'OK';
      s.hostEl.textContent = `${s.card.dataset.host} · ${s.card.dataset.detail}`;
    }
  }

  // "Beep" visual + sonoro (opcional)
  let audioCtx = null;
  function beep(critical) {
    const flash = $('#alertFlash');
    if (flash && !prefersReducedMotion) {
      flash.classList.remove('on');
      void flash.offsetWidth;
      flash.classList.add('on');
    }
    if (!lab.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      (critical ? [0, 0.28] : [0]).forEach(offset => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = critical ? 880 : 660;
        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + offset + 0.2);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + offset);
        osc.stop(audioCtx.currentTime + offset + 0.22);
      });
    } catch (e) { /* sin audio disponible */ }
  }

  const soundToggle = $('#soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      lab.sound = !lab.sound;
      soundToggle.setAttribute('aria-pressed', String(lab.sound));
      soundToggle.querySelector('i').className = lab.sound ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    });
  }

  const simulateBtn = $('#simulateBtn');
  const scenarioSelect = $('#scenarioSelect');
  const openIncidentBtn = $('#openIncidentBtn');

  function simulateOutage(forced) {
    if (lab.phase !== 'idle') return false;
    let id = forced || (scenarioSelect ? scenarioSelect.value : 'random');
    if (!SCENARIOS[id]) {
      const ids = Object.keys(SCENARIOS);
      id = ids[Math.floor(Math.random() * ids.length)];
    }
    lab.scenario = id;
    lab.phase = 'detected';
    lab.detectedAt = Date.now();
    const scen = sc();
    const s = svcBy(scen.svc);
    setServiceState(s, scen.state);
    s.card.classList.add('shake');
    setTimeout(() => s.card.classList.remove('shake'), 500);
    s.card.appendChild(openIncidentBtn);
    openIncidentBtn.classList.remove('hidden');
    tickServices();
    beep(scen.state === 'crit');
    simulateBtn.disabled = true;
    if (scenarioSelect) scenarioSelect.disabled = true;
    addEvent('WARN', scen.warnEvent);
    setTimeout(() => addEvent(scen.state === 'crit' ? 'CRIT' : 'WARN', scen.critEvent, openIncident), 350);
    updateGlobal();
    updateSteps();
    renderDashHint();
    countLab('lab-simulations', showLabStats);
    return true;
  }

  function openIncident() {
    if (lab.phase === 'detected') {
      const scen = sc();
      lab.phase = 'ticket';
      lab.ticketNum++;
      lab.ticketStatus = 'open';
      $('#ticketKey').textContent = `MON-${lab.ticketNum}`;
      $('#jPriority').value = scen.priority;
      $('#jImpact').value = scen.impact;
      $('#jiraEmpty').classList.add('hidden');
      $('#jiraForm').classList.remove('hidden');
      $('#escalateBtn').disabled = false;
      $('#chatMsg').classList.add('hidden');
      renderTicket();
      addEvent('INFO', L(`Ticket MON-${lab.ticketNum} creado en Jira · Prioridad ${scen.priority}`, `Ticket MON-${lab.ticketNum} created in Jira · Priority ${scen.priority}`));
      updateGlobal();
      updateSteps();
    }
    if (lab.phase !== 'idle') gotoTab('jira');
  }

  if (simulateBtn) simulateBtn.addEventListener('click', () => simulateOutage());
  if (openIncidentBtn) openIncidentBtn.addEventListener('click', (e) => { e.stopPropagation(); openIncident(); });
  services.forEach(s => s.card.addEventListener('click', () => {
    if (incidentActive() && lab.scenario === s.card.dataset.svc) openIncident();
  }));

  // Botones "Reproducir en el LAB" de los casos reales
  $$('.case-lab[data-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.scenario;
      if (scenarioSelect) scenarioSelect.value = id;
      if (lab.phase === 'resolved') resetScenario(true);
      gotoTab('dash');
      scrollToEl($('#lab'));
      if (lab.phase === 'idle') setTimeout(() => simulateOutage(id), prefersReducedMotion ? 0 : 700);
    });
  });

  // 6f. Widget 2: ticket de Jira y escalamiento
  const selectedTeam = () => ($('input[name="jTeam"]:checked') || {}).value || 'infra';
  const selectedText = (sel) => { const el = $(sel); return el && el.selectedOptions[0] ? el.selectedOptions[0].textContent.trim() : ''; };

  function updateDescription() {
    const desc = $('#jDesc');
    const scen = sc();
    if (!desc || !scen) return;
    const detected = lab.detectedAt ? new Date(lab.detectedAt).toLocaleTimeString('es-AR', { hour12: false }) : '--';
    const evidence = lab.evidence.length
      ? lab.evidence.map(e => `  - ${e.text()}`).join('\n')
      : L('  - (pendiente: adjuntar desde la Consola de Diagnóstico)', '  - (pending: attach from the Diagnostics Console)');
    desc.value =
`[${L('Detección', 'Detection')}] ${detected} · Grafana: ${scen.badge} ${L('en', 'on')} ${scen.host}
[${L('Síntoma', 'Symptom')}] ${scen.symptom}
[${L('Impacto', 'Impact')}] ${selectedText('#jImpact')}
[${L('Evidencia', 'Evidence')}]
${evidence}
[${L('Acción L1', 'L1 action')}] ${scen.l1} ${L('Se escala a', 'Escalating to')} ${teams()[selectedTeam()].name}.`;
  }

  function updateEvidenceHint() {
    const hint = $('#evidenceHint');
    if (!hint) return;
    if (lab.evidence.length) {
      hint.className = 'mt-2 font-mono text-xs text-cc-ok';
      hint.innerHTML = `<i class="fa-solid fa-paperclip" aria-hidden="true"></i> ${L(`${lab.evidence.length} evidencia(s) adjunta(s) desde la consola.`, `${lab.evidence.length} piece(s) of evidence attached from the console.`)}`;
    } else {
      hint.className = 'mt-2 font-mono text-xs text-cc-warn';
      hint.innerHTML = `<i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${L('Sin evidencia adjunta.', 'No evidence attached.')} <button type="button" class="underline hover:text-white" data-goto="console">${L('Ir a la Consola de Diagnóstico', 'Go to the Diagnostics Console')}</button> ${L('para justificar el escalamiento.', 'to justify the escalation.')}`;
    }
  }

  function renderTicket() {
    const scen = sc();
    if (!scen) return;
    $('#jSummary').value = scen.summary;
    const status = $('#ticketStatus');
    status.dataset.status = lab.ticketStatus === 'reassign' ? 'open' : lab.ticketStatus;
    status.textContent = {
      open: L('ABIERTO', 'OPEN'),
      reassign: L('REASIGNAR', 'REASSIGN'),
      escalated: `${L('ESCALADO', 'ESCALATED')} · ${lab.escalatedTeam ? teams()[lab.escalatedTeam].name.toUpperCase() : ''}`,
      resolved: L('RESUELTO', 'RESOLVED')
    }[lab.ticketStatus];
    updateDescription();
    updateEvidenceHint();
  }

  ['#jImpact', '#jPriority'].forEach(sel => $(sel) && $(sel).addEventListener('change', updateDescription));
  $$('input[name="jTeam"]').forEach(r => r.addEventListener('change', updateDescription));

  const fmtDuration = (ms) => {
    const s = Math.max(1, Math.round(ms / 1000));
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  function renderChat({ app, channel, author, avatar, color, html, card }) {
    const chat = $('#chatMsg');
    chat.dataset.app = app;
    chat.innerHTML = `
      <div class="chat-top"><i class="${app === 'teams' ? 'fa-brands fa-microsoft' : 'fa-brands fa-slack'}" aria-hidden="true"></i> ${app === 'teams' ? 'Microsoft Teams' : 'Slack'} · #${channel}</div>
      <div class="chat-body">
        <div class="chat-avatar" style="background:${color}">${avatar}</div>
        <div class="min-w-0 flex-1">
          <p><b class="text-white">${author}</b> <span class="text-xs text-cc-muted">${timeNow()}</span></p>
          <p class="mt-1">${html}</p>
          ${card ? '<div class="chat-card"></div>' : ''}
        </div>
      </div>`;
    if (card) $('.chat-card', chat).textContent = card;
    chat.classList.remove('hidden');
  }

  const jiraForm = $('#jiraForm');
  if (jiraForm) {
    jiraForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (lab.phase !== 'ticket') return;
      const scen = sc();
      const teamId = selectedTeam();
      const team = teams()[teamId];
      const app = $('#jChannel').value;
      const key = `MON-${lab.ticketNum}`;
      const priority = $('#jPriority').value;

      // Equipo equivocado: el ticket rebota, como pasa en la vida real
      if (teamId !== scen.team) {
        lab.ticketStatus = 'reassign';
        renderTicket();
        renderChat({
          app, channel: team.channel, author: team.name, avatar: teamId === 'devs' ? 'DV' : 'N2', color: '#64748b',
          html: `<span class="mention">@Command-Center-L1</span> ${scen.wrongTeam.replace(/</g, '&lt;')}`
        });
        addEvent('WARN', L(`${key} rebotado por ${team.name}: reasignar`, `${key} bounced by ${team.name}: reassign`));
        return;
      }

      lab.phase = 'escalated';
      lab.escalatedAt = Date.now();
      lab.ticketStatus = 'escalated';
      lab.escalatedTeam = teamId;
      renderTicket();
      $('#escalateBtn').disabled = true;
      $('#resolveBtn').classList.remove('hidden');
      $('#mttaValue').textContent = fmtDuration(lab.escalatedAt - lab.detectedAt);

      const evidenceLine = lab.evidence.length
        ? `${L('Evidencia', 'Evidence')}: ${lab.evidence[lab.evidence.length - 1].text()}`
        : `${L('Evidencia', 'Evidence')}: ${L('pendiente', 'pending')}`;
      const mentions = `<span class="mention">${team.mention}</span>${scen.notify ? ` <span class="mention">${scen.notify}</span>` : ''}`;
      renderChat({
        app, channel: team.channel, author: 'Command Center L1', avatar: 'CC', color: scen.state === 'crit' ? '#ef4444' : '#f59e0b',
        html: `${mentions} ${scen.state === 'crit' ? '🚨' : '⚠️'} <b>${L('Incidente', 'Incident')} ${priority} ${L('escalado', 'escalated')}</b>: ${scen.summary.replace(/^\[P\d\]\s*/, '')}. ${L('Por favor confirmar toma del ticket; sigo monitoreando y actualizo el hilo.', 'Please confirm you are taking the ticket; I keep monitoring and will update the thread.')}`,
        card: `Ticket: ${key} · ${priority}\n${L('Servicio', 'Service')}: ${scen.host}\n${L('Impacto', 'Impact')}: ${selectedText('#jImpact')}\n${evidenceLine}\n${L('Asignado a', 'Assigned to')}: ${team.name}`
      });

      addEvent('ESC', L(`${key} escalado a ${team.name} vía ${app === 'teams' ? 'Teams' : 'Slack'}`, `${key} escalated to ${team.name} via ${app === 'teams' ? 'Teams' : 'Slack'}`));
      setTimeout(() => {
        if (lab.phase === 'escalated') addEvent('INFO', L(`${team.name}: ticket ${key} tomado ✔`, `${team.name}: ticket ${key} acknowledged ✔`));
      }, 1800);
      countLab('lab-escalations');
      updateGlobal();
      updateSteps();
    });
  }

  const resolveBtn = $('#resolveBtn');
  if (resolveBtn) {
    resolveBtn.addEventListener('click', () => {
      if (lab.phase !== 'escalated') return;
      const scen = sc();
      const s = svcBy(scen.svc);
      resolveBtn.disabled = true;
      setServiceState(s, 'recovering');
      addEvent('INFO', scen.resolving);
      updateGlobal();
      setTimeout(() => {
        lab.phase = 'resolved';
        lab.ticketStatus = 'resolved';
        setServiceState(s, 'ok');
        openIncidentBtn.classList.add('hidden');
        renderTicket();
        addEvent('OK', L(`${scen.host} recuperado · MON-${lab.ticketNum} resuelto · MTTR ${fmtDuration(Date.now() - lab.detectedAt)}`, `${scen.host} recovered · MON-${lab.ticketNum} resolved · MTTR ${fmtDuration(Date.now() - lab.detectedAt)}`));
        resolveBtn.classList.add('hidden');
        resolveBtn.disabled = false;
        $('#resetBtn').classList.remove('hidden');
        renderDashHint();
        updateGlobal();
        updateSteps();
      }, 2600);
    });
  }

  function resetScenario(silent) {
    if (lab.scenario) setServiceState(svcBy(sc().svc), 'ok');
    lab.phase = 'idle';
    lab.scenario = null;
    lab.detectedAt = lab.escalatedAt = null;
    lab.evidence = [];
    lab.lastOutput = null;
    lab.triaged = false;
    lab.ticketStatus = 'open';
    lab.escalatedTeam = null;
    simulateBtn.disabled = false;
    if (scenarioSelect) scenarioSelect.disabled = false;
    openIncidentBtn.classList.add('hidden');
    $('#jiraForm').classList.add('hidden');
    $('#jiraEmpty').classList.remove('hidden');
    $('#resetBtn').classList.add('hidden');
    $('#attachEvidenceBtn').classList.add('hidden');
    $('#attachMsg').textContent = '';
    $('#mttaValue').textContent = '—';
    $('input[name="jTeam"][value="infra"]').checked = true;
    if (!silent) addEvent('INFO', L('Escenario reiniciado · todos los servicios operativos', 'Scenario reset · all services operational'));
    renderDashHint();
    updateGlobal();
    updateSteps();
    gotoTab('dash');
  }
  if ($('#resetBtn')) $('#resetBtn').addEventListener('click', () => resetScenario());

  // 6g. Widget 3: consola de diagnóstico
  const termOut = $('#termOut');
  const terminal = termOut ? termOut.parentElement : null;
  const attachBtn = $('#attachEvidenceBtn');
  let termBusy = false;

  function appendLine(cls, text) {
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    termOut.append('\n', span);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function runCommand(name) {
    if (!termOut || termBusy) return;
    if (name === 'clear') {
      termOut.innerHTML = '';
      return;
    }
    const active = incidentActive();
    const host = active ? sc().host : 'srv-app-biocom';
    const def = name === 'ad' ? adCheck() : (active ? sc().console[name] : healthyOutput(name, host));
    const lines = typeof def.lines === 'function' ? def.lines() : def.lines;
    termBusy = true;
    $$('.cmd-btn').forEach(b => { b.disabled = true; });
    appendLine('t-cyan', `ops@${host}:~$ ${def.prompt}`);
    let i = 0;
    const next = () => {
      if (i < lines.length) {
        appendLine(lines[i][0], lines[i][1]);
        i++;
        setTimeout(next, prefersReducedMotion ? 0 : 160);
        return;
      }
      termBusy = false;
      $$('.cmd-btn').forEach(b => { b.disabled = false; });
      if (active && def.evidence) {
        lab.lastOutput = { id: `${lab.scenario}-${name}`, text: def.evidence };
        if (!lab.triaged) {
          lab.triaged = true;
          addEvent('INFO', sc().triage);
          updateSteps();
        }
        const already = lab.evidence.some(e => e.id === lab.lastOutput.id);
        attachBtn.classList.toggle('hidden', already);
        $('#attachMsg').textContent = already ? L('✔ Esta evidencia ya está en el ticket', '✔ This evidence is already in the ticket') : '';
      } else {
        attachBtn.classList.add('hidden');
        $('#attachMsg').textContent = '';
      }
    };
    setTimeout(next, prefersReducedMotion ? 0 : 220);
  }

  $$('.cmd-btn').forEach(btn => btn.addEventListener('click', () => runCommand(btn.dataset.cmd)));

  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      if (!lab.lastOutput || lab.evidence.some(e => e.id === lab.lastOutput.id)) return;
      lab.evidence.push(lab.lastOutput);
      attachBtn.classList.add('hidden');
      updateDescription();
      updateEvidenceHint();
      const where = lab.phase === 'detected'
        ? L('se adjuntará al abrir el ticket', 'will be attached when the ticket is opened')
        : L(`adjuntada a MON-${lab.ticketNum}`, `attached to MON-${lab.ticketNum}`);
      $('#attachMsg').textContent = `✔ ${L('Evidencia', 'Evidence')} ${where}`;
      addEvent('INFO', `${L('Evidencia', 'Evidence')} ${where}`);
    });
  }

  // ==========================================================
  // 7. ASISTENTE ABI (chat, contexto del LAB, acciones y bilingüe)
  // ==========================================================
  const abiLog = $('#abiLog');
  const abiForm = $('#abiForm');
  const abiInput = $('#abiInput');
  const abiChips = $('#abiChips');
  const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function downloadCV() { openCvDialog(); }

  const chip = {
    lab: () => L('¿Qué hago en el LAB?', 'What do I do in the LAB?'),
    sim: () => L('Simular caída', 'Simulate outage'),
    holter: () => L('Simular caso Holter', 'Simulate Holter case'),
    exp: () => L('Experiencia', 'Experience'),
    cases: () => L('Casos reales', 'Real cases'),
    stack: () => L('Stack técnico', 'Tech stack'),
    cv: () => L('Descargar CV', 'Download CV'),
    contact: () => L('Contacto', 'Contact'),
    console: () => L('Ir a la consola', 'Go to console'),
    ticket: () => L('Abrir ticket', 'Open ticket'),
    flow: () => L('¿Cómo es tu flujo?', 'What is your workflow?'),
    available: () => L('¿Está disponible?', 'Is he available?'),
    linkedin: () => 'LinkedIn'
  };

  function labGuide() {
    const scen = sc();
    switch (lab.phase) {
      case 'idle':
        return { text: L('El LAB simula un turno en un Command Center con 4 escenarios: App Biocom caída, servidor Holter de Cardiología, disco SQL casi lleno y memoria/caché saturadas. Elegí uno en el Dashboard y presioná "Simular Evento de Caída". ¿Querés que lo dispare yo?',
          'The LAB simulates a Command Center shift with 4 scenarios: Biocom app down, Cardiology Holter server, SQL disk almost full and saturated memory/cache. Pick one on the Dashboard and press "Simulate Outage Event". Want me to trigger it?'), chips: [chip.sim(), chip.holter(), chip.flow()] };
      case 'detected':
        return { text: L(`🚨 Hay un evento en ${svcName(scen.svc)}. Te recomiendo: 1) validar en la consola (log, SQL o ipconfig + ping), 2) adjuntar la evidencia y 3) hacer clic en la tarjeta para abrir el ticket.`,
          `🚨 There is an event on ${svcName(scen.svc)}. I suggest: 1) validate in the console (log, SQL or ipconfig + ping), 2) attach the evidence and 3) click the card to open the ticket.`), chips: [chip.console(), chip.ticket()] };
      case 'ticket':
        if (!lab.evidence.length) {
          return { text: L(`El ticket MON-${lab.ticketNum} está abierto pero sin evidencia. Antes de escalar, adjuntá algo desde la consola: así el equipo no tiene que volver a preguntar.`,
            `Ticket MON-${lab.ticketNum} is open but has no evidence. Before escalating, attach something from the console so the team does not have to ask again.`), chips: [chip.console()] };
        }
        return { text: L(`Con la evidencia que juntaste, ¿a quién escalarías? Pista: si el problema es de red, servidor o espacio en disco va a ${teams().infra.name}; si es la aplicación consumiendo memoria, va a ${teams().devs.name}. Si elegís mal, el ticket rebota.`,
          `With the evidence you collected, who would you escalate to? Hint: network, server or disk space issues go to ${teams().infra.name}; an application eating memory goes to ${teams().devs.name}. Pick wrong and the ticket bounces.`), chips: [L('Ir a tickets', 'Go to tickets')] };
      case 'escalated':
        return { text: L(`MON-${lab.ticketNum} está escalado y notificado por chat. En la vida real ahora sigo monitoreando y actualizo el hilo. Podés simular la resolución desde la pestaña Tickets.`,
          `MON-${lab.ticketNum} is escalated and notified via chat. In real life I keep monitoring and update the thread. You can simulate the resolution from the Tickets tab.`), chips: [L('Ir a tickets', 'Go to tickets')] };
      default:
        return { text: L('✅ Incidente resuelto de punta a punta: detección, triage, ticket con evidencia y escalamiento al equipo correcto. Ese es el trabajo diario de Manuel. ¿Lo hablamos?',
          '✅ Incident resolved end to end: detection, triage, ticket with evidence and escalation to the right team. That is Manuel\'s daily job. Shall we talk?'), chips: [chip.contact(), chip.cv()] };
    }
  }

  function startSim(id) {
    if (lab.phase === 'resolved') resetScenario(true);
    if (lab.phase !== 'idle') return labGuide();
    if (id && scenarioSelect) scenarioSelect.value = id;
    simulateOutage(id);
    gotoTab('dash');
    return { text: L(`⚡ Listo, disparé el evento en ${svcName(sc().svc)}. Mirá el Dashboard y hacé clic en la tarjeta en alerta para abrir el ticket.`,
      `⚡ Done, I triggered the event on ${svcName(sc().svc)}. Check the Dashboard and click the alerting card to open the ticket.`), chips: [chip.lab(), chip.console()] };
  }

  const abiKnowledge = [
    { keys: ['simular caso holter', 'simulate holter case', 'holter', 'cardiolog', 'ritmo cardiaco', 'heart'], answer: () => {
        if (lab.phase === 'idle' || lab.phase === 'resolved') {
          if (/simul|reproduc|replay|prob|try/.test(lastQuery)) return startSim('holter');
        }
        return { text: L('En Sanatorio Otamendi, los Holters registran el ritmo cardíaco del paciente y envían el estudio a un servidor que lo transfiere a las PCs de Cardiología. Si ese servidor se cae, el estudio no se puede hacer y el paciente no puede ser atendido. Manuel verifica esas señales y transacciones y escala como P1. Podés reproducirlo en el LAB.',
          'At Sanatorio Otamendi, Holters record the patient\'s heart rhythm and send the study to a server that transfers it to the Cardiology PCs. If that server goes down, the study cannot be done and the patient cannot be seen. Manuel checks those signals and transactions and escalates as P1. You can replay it in the LAB.'), chips: [chip.holter(), chip.cases()] };
      } },
    { keys: ['simular', 'disparar', 'generar evento', 'caida', 'probar', 'demo', 'simulate', 'trigger', 'outage'], answer: () => startSim() },
    { keys: ['que hago', 'ahora', 'siguiente', 'paso', 'ayuda', 'como funciona', 'lab', 'laboratorio', 'simulador', 'estado', 'what do i do', 'next', 'help', 'how does', 'status'], answer: labGuide },
    { keys: ['ir a la consola', 'consola', 'log', 'diagnostico', 'console', 'go to console'], answer: () => { gotoTab('console'); return { text: L('Te llevé a la Consola de Diagnóstico. Tenés logs, SQL, health check de API, ipconfig + ping, nslookup, tracert, estado del servicio y recursos.', 'I took you to the Diagnostics Console. You have logs, SQL, API health check, ipconfig + ping, nslookup, tracert, service status and resources.') }; } },
    { keys: ['abrir ticket', 'ir a tickets', 'ticket', 'jira', 'open ticket', 'go to tickets'], answer: () => {
        if (lab.phase === 'detected') { openIncident(); return { text: L('Abrí el ticket en Jira con los datos precargados según el escenario.', 'I opened the Jira ticket with the data prefilled for this scenario.'), chips: [chip.lab()] }; }
        if (lab.phase === 'idle') return { text: L('Todavía no hay incidentes. Primero simulá una caída.', 'There are no incidents yet. Simulate an outage first.'), chips: [chip.sim()] };
        gotoTab('jira'); return { text: L(`Te llevé al ticket MON-${lab.ticketNum}.`, `I took you to ticket MON-${lab.ticketNum}.`) };
      } },
    { keys: ['flujo', 'proceso', 'escal', 'triage', 'n2', 'n3', 'itil', 'incidente', 'workflow', 'process', 'incident', 'l2', 'l3'],
      answer: () => ({ text: L('Su flujo L1 tiene 4 pasos:\n1) Detección en dashboards (Grafana/Zabbix)\n2) Triage con ipconfig, ping, logs y SQL\n3) Ticket en Jira/Redmine con prioridad, impacto y evidencia\n4) Escalamiento a N2/N3 por chat y seguimiento hasta el cierre dentro del SLA.',
        'His L1 workflow has 4 steps:\n1) Detection on dashboards (Grafana/Zabbix)\n2) Triage with ipconfig, ping, logs and SQL\n3) Jira/Redmine ticket with priority, impact and evidence\n4) Escalation to L2/L3 via chat and follow-up until closure within SLA.'), chips: [chip.sim(), chip.exp()] }) },
    { keys: ['caso', 'casos', 'ejemplo', 'case', 'cases', 'example'],
      answer: () => { setTimeout(() => scrollToEl($('#casos')), 900); return { text: L('Algunos casos reales: el servidor de Holters de Cardiología, la memoria y caché de las APIs en Otamendi, ~10 casos cada 20 minutos en Medicus (blanqueo de claves, ABM en AD, corrección de DNI/nombre/apellido de pacientes) y validación de APIs con Postman y árboles IVR en Sondeos Global. Te llevo a la sección 👇',
        'Some real cases: the Cardiology Holter server, API memory and cache at Otamendi, ~10 cases every 20 minutes at Medicus (password resets, AD provisioning, fixing patient ID/name records) and API checks with Postman plus IVR trees at Sondeos Global. Taking you there 👇') }; } },
    { keys: ['medicus', 'volumen', 'blanqueo', 'clave', 'password', 'dni', 'paciente', 'patient', 'documenta'],
      answer: () => ({ text: L('En Medicus atiende alrededor de 10 casos cada 20 minutos. Los más típicos: blanqueo de claves y ABM en Active Directory, y corrección de datos de pacientes mal cargados (DNI, nombre, apellido). Además documenta todo lo que pasa en cada jornada, para auditoría y futuras prácticas.',
        'At Medicus he handles around 10 cases every 20 minutes. Most common: password resets and Active Directory provisioning, and fixing patient records loaded with errors (ID number, first and last name). He also documents everything that happens each shift, for audits and future reference.') }) },
    { keys: ['postman', 'renaper', 'ivr', 'sondeos', 'llamad', 'cobranza', 'api'],
      answer: () => ({ text: L('En Sondeos Global hacía y verificaba consultas a servicios externos como RENAPER con Postman, revisaba los logs de llamadas de cada ruta y armaba árboles IVR para los llamadores hacia consultoras y estudios de cobranza.',
        'At Sondeos Global he ran and verified queries against external services such as RENAPER with Postman, reviewed call logs for each route and built IVR trees for callers to consulting firms and collection agencies.') }) },
    { keys: ['memoria', 'cache', 'memory', 'otamendi'],
      answer: () => ({ text: L('En Sanatorio Otamendi monitorea paneles con el estado de las APIs y el porcentaje de memoria y caché. Cuando hace falta, hace la limpieza para que no se sature el sistema hospitalario. También verifica las señales de equipos médicos como los Holters.',
        'At Sanatorio Otamendi he monitors dashboards with API status and memory and cache usage. When needed, he runs the cleanup so the hospital system does not get saturated. He also checks signals from medical equipment such as Holters.'), chips: [chip.holter(), chip.cases()] }) },
    { keys: ['experiencia', 'trabajo', 'trayectoria', 'empresa', 'claro', 'beretta', 'anos', 'experience', 'work', 'career', 'years', 'job history'],
      answer: () => ({ text: L('Más de 7 años en IT. Hoy es Operador de Monitoreo en Sanatorio Otamendi e IT Analyst en Medicus. Antes: Sondeos Global, Beretta Galarce & Asociados y Claro Argentina.',
        '7+ years in IT. Currently Monitoring Operator at Sanatorio Otamendi and IT Analyst at Medicus. Before: Sondeos Global, Beretta Galarce & Asociados and Claro Argentina.'), chips: [chip.cases(), chip.stack()] }) },
    { keys: ['formacion', 'estudi', 'educacion', 'titulo', 'carrera', 'curso', 'utn', 'iutai', 'data science', 'ingles', 'idioma', 'education', 'degree', 'english', 'language'],
      answer: () => ({ text: L('Técnico Superior en Informática (IUTAI). En curso: Automatización con IA (UTN), Data Science y Redes (EducaciónIT; Redes comenzó este cuatrimestre). Idiomas: español nativo e inglés B1 orientado a documentación técnica 🎓',
        'Higher Technical Degree in Computer Science (IUTAI). In progress: Automation with AI (UTN), Data Science and Networking (EducaciónIT; Networking started this term). Languages: native Spanish and B1 English focused on technical documentation 🎓') }) },
    { keys: ['stack', 'habilidad', 'skill', 'sabe', 'herramienta', 'redmine', 'active directory', 'grafana', 'zabbix', 'monitoreo', 'sql', 'mongo', 'tecnologia', 'tools', 'monitoring', 'tech'],
      answer: () => ({ text: L('Monitoreo con Grafana y Zabbix, incidentes ITIL con Jira y Redmine, SQL Server y MongoDB, Postman, Windows Server, Active Directory y PowerShell, Application Support (Thinksoft, Biocom, Binary), IVR, redes (TCP/IP, DNS, DHCP, VPN, ipconfig, ping, tracert) y Teams/Slack.',
        'Monitoring with Grafana and Zabbix, ITIL incidents with Jira and Redmine, SQL Server and MongoDB, Postman, Windows Server, Active Directory and PowerShell, Application Support (Thinksoft, Biocom, Binary), IVR, networking (TCP/IP, DNS, DHCP, VPN, ipconfig, ping, tracert) and Teams/Slack.'), chips: [chip.sim()] }) },
    { keys: ['servicio', 'ofrece', 'independiente', 'cableado', 'hardware', 'qa', 'testing', 'services', 'offer'],
      answer: () => ({ text: L('Ofrece: monitoreo y operaciones IT, mesa de ayuda L1/L2, gestión de accesos, testing funcional/QA, soporte de hardware y redes. Podés cotizar desde el formulario 📋',
        'He offers: monitoring and IT operations, L1/L2 help desk, access management, functional testing/QA, hardware and network support. You can request a quote from the form 📋'), chips: [L('Cotizar', 'Get a quote')] }) },
    { keys: ['cv', 'curriculum', 'descargar', 'pdf', 'resume', 'download'], answer: () => { setTimeout(downloadCV, 700); return { text: L('¡Claro! Dejame tu correo en la ventana y se descarga el CV 📄', 'Sure! Leave your email in the window and the CV will download 📄') }; } },
    { keys: ['precio', 'costo', 'cotiz', 'presupuesto', 'cuanto', 'tarifa', 'valor', 'price', 'quote', 'cost', 'rate'],
      answer: () => { setTimeout(() => scrollToEl($('#contacto')), 700); return { text: L('El presupuesto depende del servicio y la cantidad de usuarios. Te llevo al cotizador: elegí el servicio, mové el slider de usuarios y Manuel te responde a la brevedad 💬', 'The price depends on the service and number of users. Taking you to the quote form: pick the service, move the users slider and Manuel will reply shortly 💬') }; } },
    { keys: ['linkedin', 'perfil', 'profile'], answer: () => ({ text: L('Acá tenés el LinkedIn de Manuel 👉', 'Here is Manuel\'s LinkedIn 👉'), link: { href: LINKEDIN_URL, text: 'linkedin.com/in/manuelmolina01' } }) },
    { keys: ['contact', 'mail', 'correo', 'hablar', 'escrib', 'whatsapp', 'telefono', 'email', 'talk', 'reach'],
      answer: () => { setTimeout(() => scrollToEl($('#contacto')), 900); return { text: L('Podés escribirle desde el formulario de contacto o por LinkedIn. ¡Te llevo al formulario! 📲', 'You can write to him from the contact form or on LinkedIn. Taking you to the form! 📲'), link: { href: LINKEDIN_URL, text: 'linkedin.com/in/manuelmolina01' } }; } },
    { keys: ['disponib', 'busca', 'empleo', 'freelance', 'auditoria', 'audit', 'propuesta', 'contrat', 'remoto', 'hibrido', 'puesto', 'rol', 'available', 'hire', 'hiring', 'remote', 'role', 'position'],
      answer: () => ({ text: L('Sí: Manuel busca un rol de Operador de Monitoreo de Servidores y Servicios / Command Center Operator, 100% remoto. También toma proyectos freelance y de auditoría. Elegí "Propuesta laboral" o "Freelance / Auditoría" en el formulario 🚀', 'Yes: Manuel is looking for a Server & Service Monitoring Operator / Command Center Operator role, 100% remote. He also takes freelance and audit projects. Choose "Job offer" or "Freelance / Audit" in the form 🚀'), chips: [chip.contact(), chip.cv()] }) },
    { keys: ['hola', 'buenas', 'hey', 'buen dia', 'que tal', 'hello', 'hi', 'good morning'], answer: () => ({ text: L('¡Hola! Soy Abi 🤖. Puedo contarte sobre Manuel o guiarte en el LAB de Monitoreo.', 'Hi! I am Abi 🤖. I can tell you about Manuel or guide you through the Monitoring LAB.'), chips: [chip.lab(), chip.exp(), chip.cases()] }) },
    { keys: ['gracias', 'genial', 'buenisimo', 'excelente', 'thanks', 'thank you', 'great', 'awesome'], answer: () => ({ text: L('¡De nada! Si te sirvió el perfil, Manuel estaría feliz de hablar con vos 😊', 'You are welcome! If the profile was useful, Manuel would be happy to talk 😊'), chips: [chip.contact(), chip.linkedin()] }) },
    { keys: ['quien sos', 'que sos', 'abi', 'bot', 'ia', 'who are you', 'ai'], answer: () => ({ text: L('Soy Abi, un asistente hecho en JavaScript vanilla (sin servidores ni APIs). Conozco el perfil de Manuel y sigo en tiempo real lo que pasa en el LAB 😄', 'I am Abi, an assistant built with vanilla JavaScript (no servers or APIs). I know Manuel\'s profile and follow what happens in the LAB in real time 😄') }) }
  ];

  // Puntúa cada respuesta por la cantidad de coincidencias (al inicio de palabra) y elige la mejor.
  let lastQuery = '';
  function findAnswer(query) {
    const q = normalize(query);
    lastQuery = q;
    let best = null;
    let bestScore = 0;
    abiKnowledge.forEach(item => {
      const score = item.keys.reduce((acc, k) => acc + (new RegExp(`\\b${k}`).test(q) ? k.length : 0), 0);
      if (score > bestScore) { best = item; bestScore = score; }
    });
    return best;
  }

  function addAbiMsg(who, text, link) {
    const div = document.createElement('div');
    div.className = `abi-msg ${who}`;
    div.textContent = text;
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = ` ${link.text}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      div.appendChild(a);
    }
    abiLog.appendChild(div);
    abiLog.scrollTop = abiLog.scrollHeight;
    return div;
  }

  const defaultChips = () => [chip.lab(), chip.sim(), chip.cases(), chip.exp(), chip.stack(), chip.cv(), chip.contact()];
  let currentChips = null;
  function renderChips(list) {
    currentChips = list && list.length ? list : null;
    abiChips.innerHTML = '';
    (currentChips || defaultChips()).forEach(label => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ai-chip';
      b.textContent = label;
      b.addEventListener('click', () => askAbi(label));
      abiChips.appendChild(b);
    });
  }

  let abiBusy = false;
  function askAbi(query) {
    query = (query || '').trim();
    if (!query || abiBusy) return;
    abiBusy = true;
    addAbiMsg('user', query);
    const typing = addAbiMsg('bot', '');
    typing.innerHTML = '<span class="abi-typing" aria-label="Abi..."><span></span><span></span><span></span></span>';
    setTimeout(() => {
      typing.remove();
      const match = findAnswer(query);
      const res = match ? match.answer() : {
        text: L('Esa no la sé 🤔. Probá preguntar por "experiencia", "casos", "stack", "qué hago en el LAB" o "contacto". Y si es algo puntual, Manuel te responde por el formulario.',
          'I do not know that one 🤔. Try asking about "experience", "cases", "stack", "what do I do in the LAB" or "contact". For anything specific, Manuel will reply through the form.')
      };
      addAbiMsg('bot', res.text, res.link);
      renderChips(res.chips);
      abiBusy = false;
    }, prefersReducedMotion ? 100 : 650);
  }

  const abiGreeting = () => L('¡Hola! Soy Abi 🤖, la asistente del Command Center. Te puedo contar sobre la experiencia de Manuel o guiarte paso a paso en el LAB. ¿Por dónde empezamos?',
    'Hi! I am Abi 🤖, the Command Center assistant. I can tell you about Manuel\'s experience or guide you step by step through the LAB. Where do we start?');

  if (abiLog && abiForm) {
    abiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      askAbi(abiInput.value);
      abiInput.value = '';
    });
  }

  const abiFab = $('#abiFab');
  if (abiFab) {
    abiFab.addEventListener('click', () => {
      gotoTab('abi');
      scrollToEl($('#lab'));
      setTimeout(() => abiInput && abiInput.focus({ preventScroll: true }), 600);
    });
  }

  // ==========================================================
  // 8. COTIZADOR & CONTACTO DIRECTO
  // ==========================================================
  const userSlider = $('#user_count_range');
  const userCountDisplay = $('#userCountDisplay');

  function updateUserCount() {
    const val = parseInt(userSlider.value, 10);
    userCountDisplay.innerText = val >= 500
      ? L('500+ usuarios (Enterprise)', '500+ users (Enterprise)')
      : `${val} ${L(val > 1 ? 'usuarios' : 'usuario', val > 1 ? 'users' : 'user')}`;
  }
  if (userSlider && userCountDisplay) userSlider.addEventListener('input', updateUserCount);

  // Preselección de servicio desde las tarjetas
  const serviceSelect = $('#service_type');
  $$('.service-cta[data-service]').forEach(link => {
    link.addEventListener('click', () => { if (serviceSelect) serviceSelect.value = link.dataset.service; });
  });

  // Envío y validación del formulario (Formspree)
  const form = $('#portfolioForm');
  const fullname = $('#fullname');
  const email = $('#email');
  const message = $('#message');
  const formAlert = $('#formAlert');
  const submitText = () => $('#submitBtn .btn-text');
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function setError(inputElement) {
    inputElement.closest('.form-group').classList.add('error');
    inputElement.setAttribute('aria-invalid', 'true');
  }

  [fullname, email, message].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.closest('.form-group').classList.remove('error');
      input.removeAttribute('aria-invalid');
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      $$('.form-group', form).forEach(group => group.classList.remove('error'));
      formAlert.className = 'form-alert';
      formAlert.innerText = '';

      if (fullname.value.trim().length < 3) { setError(fullname); isValid = false; }
      if (!emailRegex.test(email.value.trim())) { setError(email); isValid = false; }
      if (message.value.trim().length < 5) { setError(message); isValid = false; }

      if (!isValid) {
        form.querySelector('.form-group.error input, .form-group.error textarea')?.focus();
        return;
      }

      const submitBtn = $('#submitBtn');
      submitBtn.disabled = true;
      submitText().innerText = L('Enviando mensaje...', 'Sending message...');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formAlert.classList.add('success');
          formAlert.innerText = L(`¡Muchas gracias, ${fullname.value.trim()}! Tu mensaje fue enviado con éxito. Te responderé a la brevedad.`,
            `Thank you, ${fullname.value.trim()}! Your message was sent successfully. I will get back to you shortly.`);
          form.reset();
          if (userSlider && userCountDisplay) updateUserCount();
        } else {
          const data = await response.json().catch(() => null);
          throw new Error(data && data.errors
            ? data.errors.map(error => error.message).join(', ')
            : L('Ocurrió un error al enviar el formulario.', 'There was an error sending the form.'));
        }
      } catch (err) {
        formAlert.classList.add('error');
        formAlert.innerText = err.message || L('Error de conexión. Intentalo nuevamente.', 'Connection error. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitText().innerText = L('Enviar Mensaje', 'Send Message');
      }
    });
  }

  // 8b. DESCARGA DEL CV: se pide un correo antes (filtro contra bots y spam)
  const cvDialog = $('#cvDialog');
  const cvForm = $('#cvForm');
  const cvEmail = $('#cvEmail');
  const cvConsent = $('#cvConsent');
  const cvError = $('#cvError');

  function saveCvFile() {
    const link = document.createElement('a');
    link.href = 'Manuel_Molina_CV.pdf';
    link.download = 'Manuel_Molina_CV.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function openCvDialog() {
    if (store.get('cvEmailOk', sessionStorage) === '1') { saveCvFile(); return; }
    if (!cvDialog || typeof cvDialog.showModal !== 'function') { scrollToEl($('#contacto')); return; }
    cvError.classList.add('hidden');
    cvDialog.showModal();
    setTimeout(() => cvEmail.focus(), 50);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.cv-link');
    if (!link) return;
    e.preventDefault();
    openCvDialog();
  });
  if ($('#cvClose')) $('#cvClose').addEventListener('click', () => cvDialog.close());

  if (cvForm) {
    cvForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const showErr = (msg) => { cvError.textContent = msg; cvError.classList.remove('hidden'); };
      if (!emailRegex.test(cvEmail.value.trim())) return showErr(L('Ingresá un correo válido.', 'Please enter a valid email.'));
      if (!cvConsent.checked) return showErr(L('Tenés que aceptar la política de privacidad.', 'You need to accept the privacy policy.'));
      // Si el campo trampa tiene contenido, es un bot: no se descarga nada
      if (cvForm.querySelector('[name="_gotcha"]').value) { cvDialog.close(); return; }
      const btn = $('#cvSubmit');
      btn.disabled = true;
      const data = new FormData();
      data.append('email', cvEmail.value.trim());
      data.append('motivo', 'Descarga de CV');
      data.append('idioma', lang);
      data.append('_subject', 'Descarga de CV desde el portafolio');
      try {
        await fetch(form ? form.action : 'https://formspree.io/f/maeypvry', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
      } catch (err) { /* aunque falle el aviso, el visitante ya dejó un correo válido */ }
      btn.disabled = false;
      store.set('cvEmailOk', '1', sessionStorage);
      cvDialog.close();
      cvForm.reset();
      saveCvFile();
    });
  }

  // Enlaces a las políticas: abren el bloque desplegable del pie
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.open-policies');
    if (!link) return;
    e.preventDefault();
    if (cvDialog && cvDialog.open) cvDialog.close();
    const det = $('#politicas');
    det.open = true;
    scrollToEl(det);
  });

  // 8c. STACK TÉCNICO: carga animada al entrar en pantalla
  const stackPanel = $('.stack-panel');
  if (stackPanel) {
    const total = $$('.stack-chip', stackPanel).length;
    const stackCount = $('#stackCount');
    const load = () => {
      stackPanel.classList.add('loaded');
      if (prefersReducedMotion) { stackCount.textContent = total; return; }
      let n = 0;
      const t = setInterval(() => { stackCount.textContent = ++n; if (n >= total) clearInterval(t); }, 55);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        if (entries.some(en => en.isIntersecting)) { load(); obs.disconnect(); }
      }, { threshold: 0.2 }).observe(stackPanel);
    } else load();
  }

  // 9. HEADER, "VOLVER ARRIBA" Y AÑO DEL FOOTER
  const header = $('#header');
  const backToTop = $('#backToTop');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (backToTop) backToTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const currentYear = $('#currentYear');
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  // 10. TEXTOS QUE DEPENDEN DEL IDIOMA Y ARRANQUE
  langListeners.push(() => {
    renderDashHint();
    updateGlobal();
    if (lab.phase !== 'idle') {
      const scen = sc();
      const s = svcBy(scen.svc);
      if (s.card.dataset.state !== 'ok') setServiceState(s, s.card.dataset.state);
      renderTicket();
    }
    if (userSlider && userCountDisplay) updateUserCount();
    if (submitText() && !$('#submitBtn').disabled) submitText().innerText = L('Enviar Mensaje', 'Send Message');
    if (abiChips) renderChips();
    // Si todavía no hubo conversación, el saludo de Abi cambia de idioma
    if (abiLog && abiLog.children.length === 1) abiLog.firstElementChild.textContent = abiGreeting();
    if (backToTop) backToTop.setAttribute('aria-label', L('Volver arriba', 'Back to top'));
  });

  applyLang(lang);
  if (abiLog) addAbiMsg('bot', abiGreeting());
  updateSteps();
  addEvent('OK', L('Monitoreo iniciado · 6 servicios en producción OK', 'Monitoring started · 6 production services OK'));
});
