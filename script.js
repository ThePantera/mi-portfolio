document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const timeNow = () => new Date().toLocaleTimeString('es-AR', { hour12: false });
  const scrollToEl = (el) => el && el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  const LINKEDIN_URL = 'https://www.linkedin.com/in/manuelmolina01';

  // 1. CONTADOR DE VISITAS REALES
  // Solo suma una visita por sesión para no inflar el número al recargar.
  const realViewsCount = $('#realViewsCount');
  if (realViewsCount) {
    const namespace = 'manuel-molina-portfolio-2026';
    const key = 'pageviews';
    let alreadyCounted = false;
    try { alreadyCounted = sessionStorage.getItem('viewCounted') === '1'; } catch (e) {}
    const endpoint = `https://api.counterapi.dev/v1/${namespace}/${key}${alreadyCounted ? '' : '/up'}`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data && data.count) {
          realViewsCount.innerText = data.count.toLocaleString('es-AR');
          try { sessionStorage.setItem('viewCounted', '1'); } catch (e) {}
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
    menuToggleBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
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
  const textArray = [
    'tail -f eventos.log | grep CRITICAL',
    'Detección → Triage → Ticket → Escalamiento N2/N3',
    'Grafana · Zabbix · Jira · Redmine · SQL · AD · ITIL'
  ];
  let textArrayIndex = 0;
  let charIndex = 0;

  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex++);
      setTimeout(type, 55);
    } else {
      setTimeout(erase, 2200);
    }
  }
  function erase() {
    if (charIndex > 0) {
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, --charIndex);
      setTimeout(erase, 25);
    } else {
      textArrayIndex = (textArrayIndex + 1) % textArray.length;
      setTimeout(type, 400);
    }
  }
  if (typedTextSpan) {
    if (prefersReducedMotion) typedTextSpan.textContent = textArray[1];
    else setTimeout(type, 500);
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

  // ==========================================================
  // 6. LAB: SIMULADOR DE COMMAND CENTER
  // ==========================================================
  const lab = {
    phase: 'idle',          // idle → detected → ticket → escalated → resolved
    detectedAt: null,
    escalatedAt: null,
    ticketNum: 1041,
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
  $$('[data-goto]').forEach(btn => btn.addEventListener('click', () => gotoTab(btn.dataset.goto)));

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

  // 6c. Línea de tiempo y barra de estado
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

  const globalDot = $('#globalDot');
  const globalStatus = $('#globalStatus');
  function updateGlobal() {
    const crit = $$('.svc[data-state="crit"]').length;
    const total = $$('.svc').length;
    $('#svcOkCount').textContent = `${total - crit}/${total}`;
    const open = ['detected', 'ticket', 'escalated'].includes(lab.phase) ? 1 : 0;
    $('#openIncidents').textContent = open;
    if (crit) {
      globalDot.className = 'h-2.5 w-2.5 rounded-full bg-cc-crit animate-pulse';
      globalStatus.className = 'text-cc-crit';
      globalStatus.textContent = 'MAJOR OUTAGE · 1 SERVICIO CRÍTICO';
    } else {
      globalDot.className = 'h-2.5 w-2.5 rounded-full bg-cc-ok';
      globalStatus.className = 'text-cc-ok';
      globalStatus.textContent = 'ALL SYSTEMS OPERATIONAL';
    }
    $('#jiraBadge').classList.toggle('hidden', !['detected', 'ticket'].includes(lab.phase));
  }

  // 6d. Widget 1: tarjetas de servicio con métricas en vivo
  const services = $$('.svc').map(card => {
    const base = { web: 42, api: 88, sql: 12, biocom: 65 }[card.dataset.svc] || 50;
    return {
      card,
      base,
      values: Array.from({ length: 30 }, () => base + (Math.random() - 0.5) * base * 0.3),
      line: $('.spark polyline', card),
      lat: $('.svc-lat', card)
    };
  });
  const biocom = services.find(s => s.card.dataset.svc === 'biocom');

  function tickServices() {
    services.forEach(s => {
      const state = s.card.dataset.state;
      let v;
      if (state === 'crit') v = 300 + Math.random() * 40;              // timeouts
      else if (state === 'recovering') v = s.base * (1.6 + Math.random() * 0.4);
      else v = s.base + (Math.random() - 0.5) * s.base * 0.35;
      s.values.shift();
      s.values.push(v);
      s.line.setAttribute('points', toPoints(s.values, 200, 40, s.base * 2.2 > 300 ? s.base * 2.2 : 320));
      s.lat.textContent = state === 'crit' ? 'TIMEOUT' : `${Math.round(v)} ms`;
    });
  }
  if (services.length) {
    tickServices();
    setInterval(tickServices, prefersReducedMotion ? 4000 : 2000);
  }

  function setServiceState(s, state) {
    const card = s.card;
    card.dataset.state = state;
    const badge = $('.svc-badge', card);
    const row = $('.svc-row span', card);
    if (state === 'crit') {
      badge.textContent = 'CRITICAL 500';
      row.textContent = `${card.dataset.host} · HTTP 500`;
    } else if (state === 'recovering') {
      badge.textContent = 'RECOVERING';
      row.textContent = `${card.dataset.host} · HTTP 200 (warming up)`;
    } else {
      badge.textContent = 'OK';
      row.textContent = `${card.dataset.host} · HTTP 200`;
    }
  }

  // "Beep" visual + sonoro (opcional)
  let audioCtx = null;
  function beep() {
    const flash = $('#alertFlash');
    if (flash && !prefersReducedMotion) {
      flash.classList.remove('on');
      void flash.offsetWidth;
      flash.classList.add('on');
    }
    if (!lab.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.28].forEach(offset => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 880;
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
  const openIncidentBtn = $('#openIncidentBtn');

  function simulateOutage() {
    if (lab.phase !== 'idle' || !biocom) return false;
    lab.phase = 'detected';
    lab.detectedAt = Date.now();
    setServiceState(biocom, 'crit');
    biocom.card.classList.add('shake');
    setTimeout(() => biocom.card.classList.remove('shake'), 500);
    tickServices();
    beep();
    simulateBtn.disabled = true;
    openIncidentBtn.classList.remove('hidden');
    $('#dashHint').innerHTML = '<span class="text-cc-crit">alerta:</span> hacé clic en <b class="text-white">Servidor App Biocom</b> para registrar y escalar el incidente.';
    addEvent('WARN', 'srv-app-biocom: latencia > 2000 ms (umbral superado)');
    setTimeout(() => {
      addEvent('CRIT', 'srv-app-biocom: HTTP 500 Internal Server Error · health-check 3/3 fallidos. Clic para abrir incidente', openIncident);
    }, 350);
    updateGlobal();
    updateSteps();
    return true;
  }

  function openIncident() {
    if (lab.phase === 'detected') {
      lab.phase = 'ticket';
      lab.ticketNum++;
      $('#ticketKey').textContent = `MON-${lab.ticketNum}`;
      $('#jSummary').value = '[P1] Servidor App Biocom caído · CRITICAL HTTP 500 en producción';
      $('#jPriority').value = 'P1';
      $('#jImpact').selectedIndex = 0;
      $('#ticketStatus').dataset.status = 'open';
      $('#ticketStatus').textContent = 'ABIERTO';
      $('#jiraEmpty').classList.add('hidden');
      $('#jiraForm').classList.remove('hidden');
      $('#escalateBtn').disabled = false;
      $('#chatMsg').classList.add('hidden');
      updateDescription();
      updateEvidenceHint();
      addEvent('INFO', `Ticket MON-${lab.ticketNum} creado en Jira · Prioridad P1`);
      updateGlobal();
      updateSteps();
    }
    if (lab.phase !== 'idle') gotoTab('jira');
  }

  if (simulateBtn) simulateBtn.addEventListener('click', simulateOutage);
  if (openIncidentBtn) openIncidentBtn.addEventListener('click', (e) => { e.stopPropagation(); openIncident(); });
  if (biocom) biocom.card.addEventListener('click', () => { if (biocom.card.dataset.state === 'crit') openIncident(); });

  // 6e. Widget 2: ticket de Jira y escalamiento
  const teamLabels = {
    infra: { name: 'Equipo de Infraestructura N2', channel: 'infra-n2-guardia', mention: '@Infra-N2' },
    devs: { name: 'Equipo Devs (N3)', channel: 'devs-biocom', mention: '@Devs-Biocom' }
  };
  const selectedTeam = () => ($('input[name="jTeam"]:checked') || {}).value || 'infra';

  function updateDescription() {
    const desc = $('#jDesc');
    if (!desc) return;
    const detected = lab.detectedAt ? new Date(lab.detectedAt).toLocaleTimeString('es-AR', { hour12: false }) : '--';
    const evidence = lab.evidence.length
      ? lab.evidence.map(e => `  - ${e}`).join('\n')
      : '  - (pendiente: adjuntar desde la Consola de Diagnóstico)';
    desc.value =
`[Detección] ${detected} · Grafana: CRITICAL en srv-app-biocom
[Síntoma] HTTP 500 Internal Server Error · health-check 3/3 fallidos
[Impacto] ${$('#jImpact').value}
[Evidencia]
${evidence}
[Acción L1] Evento validado (no es falso positivo). Se escala a ${teamLabels[selectedTeam()].name}.`;
  }

  function updateEvidenceHint() {
    const hint = $('#evidenceHint');
    if (!hint) return;
    if (lab.evidence.length) {
      hint.className = 'mt-2 font-mono text-xs text-cc-ok';
      hint.innerHTML = `<i class="fa-solid fa-paperclip" aria-hidden="true"></i> ${lab.evidence.length} evidencia(s) adjunta(s) desde la consola.`;
    } else {
      hint.className = 'mt-2 font-mono text-xs text-cc-warn';
      hint.innerHTML = '<i class="fa-solid fa-circle-info" aria-hidden="true"></i> Sin evidencia adjunta. <button type="button" class="underline hover:text-white" data-goto="console">Ir a la Consola de Diagnóstico</button> para justificar el escalamiento.';
      $('[data-goto]', hint).addEventListener('click', () => gotoTab('console'));
    }
  }

  ['#jImpact', '#jPriority'].forEach(sel => $(sel) && $(sel).addEventListener('change', updateDescription));
  $$('input[name="jTeam"]').forEach(r => r.addEventListener('change', updateDescription));

  const fmtDuration = (ms) => {
    const s = Math.max(1, Math.round(ms / 1000));
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const jiraForm = $('#jiraForm');
  if (jiraForm) {
    jiraForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (lab.phase !== 'ticket') return;
      lab.phase = 'escalated';
      lab.escalatedAt = Date.now();
      const team = teamLabels[selectedTeam()];
      const app = $('#jChannel').value;
      const key = `MON-${lab.ticketNum}`;
      const priority = $('#jPriority').value;

      $('#ticketStatus').dataset.status = 'escalated';
      $('#ticketStatus').textContent = `ESCALADO · ${team.name.toUpperCase()}`;
      $('#escalateBtn').disabled = true;
      $('#resolveBtn').classList.remove('hidden');
      $('#mttaValue').textContent = fmtDuration(lab.escalatedAt - lab.detectedAt);

      const evidenceLine = lab.evidence.length
        ? `Evidencia: ${lab.evidence[lab.evidence.length - 1]}`
        : 'Evidencia: pendiente (health-check 3/3 fallidos)';
      const chat = $('#chatMsg');
      chat.dataset.app = app;
      chat.innerHTML = `
        <div class="chat-top"><i class="${app === 'teams' ? 'fa-brands fa-microsoft' : 'fa-brands fa-slack'}" aria-hidden="true"></i> ${app === 'teams' ? 'Microsoft Teams' : 'Slack'} · #${team.channel}</div>
        <div class="chat-body">
          <div class="chat-avatar">CC</div>
          <div class="min-w-0 flex-1">
            <p><b class="text-white">Command Center L1</b> <span class="text-xs text-cc-muted">${timeNow()}</span></p>
            <p class="mt-1"><span class="mention">${team.mention}</span> 🚨 <b>Incidente ${priority} escalado</b>: Servidor App Biocom devuelve HTTP 500 en producción.</p>
            <div class="chat-card"></div>
            <p class="mt-2 text-xs text-cc-muted">Por favor confirmar toma del ticket. Sigo monitoreando y actualizo el hilo ante cualquier cambio.</p>
          </div>
        </div>`;
      $('.chat-card', chat).textContent =
        `Ticket: ${key} · ${priority}\nServicio: srv-app-biocom\nImpacto: ${$('#jImpact').value}\n${evidenceLine}\nAsignado a: ${team.name}`;
      chat.classList.remove('hidden');

      addEvent('ESC', `${key} escalado a ${team.name} vía ${app === 'teams' ? 'Teams' : 'Slack'}`);
      setTimeout(() => {
        if (lab.phase === 'escalated') addEvent('INFO', `${team.name}: ticket ${key} tomado ✔`);
      }, 1800);
      updateGlobal();
      updateSteps();
    });
  }

  const resolveBtn = $('#resolveBtn');
  if (resolveBtn) {
    resolveBtn.addEventListener('click', () => {
      if (lab.phase !== 'escalated') return;
      resolveBtn.disabled = true;
      setServiceState(biocom, 'recovering');
      addEvent('INFO', 'N2: regla de firewall restaurada hacia sql-prod-01:1433. Reiniciando pool de conexiones');
      updateGlobal();
      setTimeout(() => {
        lab.phase = 'resolved';
        setServiceState(biocom, 'ok');
        openIncidentBtn.classList.add('hidden');
        $('#ticketStatus').dataset.status = 'resolved';
        $('#ticketStatus').textContent = 'RESUELTO';
        addEvent('OK', `srv-app-biocom recuperado · MON-${lab.ticketNum} resuelto · MTTR ${fmtDuration(Date.now() - lab.detectedAt)}`);
        resolveBtn.classList.add('hidden');
        resolveBtn.disabled = false;
        $('#resetBtn').classList.remove('hidden');
        $('#dashHint').innerHTML = '<span class="text-cc-ok">ok:</span> incidente resuelto. Podés reiniciar el escenario desde la pestaña Tickets.';
        updateGlobal();
        updateSteps();
      }, 2600);
    });
  }

  function resetScenario() {
    lab.phase = 'idle';
    lab.detectedAt = lab.escalatedAt = null;
    lab.evidence = [];
    lab.lastOutput = null;
    lab.triaged = false;
    setServiceState(biocom, 'ok');
    simulateBtn.disabled = false;
    openIncidentBtn.classList.add('hidden');
    $('#jiraForm').classList.add('hidden');
    $('#jiraEmpty').classList.remove('hidden');
    $('#resetBtn').classList.add('hidden');
    $('#attachEvidenceBtn').classList.add('hidden');
    $('#attachMsg').textContent = '';
    $('#mttaValue').textContent = '—';
    $('#dashHint').innerHTML = '<span class="text-cc-cyan">tip:</span> presioná <b class="text-white">Simular Evento de Caída</b> y seguí el incidente por las pestañas.';
    addEvent('INFO', 'Escenario reiniciado · todos los servicios operativos');
    updateGlobal();
    updateSteps();
    gotoTab('dash');
  }
  if ($('#resetBtn')) $('#resetBtn').addEventListener('click', resetScenario);

  // 6f. Widget 3: consola de diagnóstico
  const termOut = $('#termOut');
  const terminal = termOut ? termOut.parentElement : null;
  const attachBtn = $('#attachEvidenceBtn');
  let termBusy = false;
  const incidentActive = () => ['detected', 'ticket', 'escalated'].includes(lab.phase);

  const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
  const commands = {
    log: {
      prompt: 'tail -n 8 /var/log/biocom/app.log',
      healthy: () => [
        ['t-muted', `${ts()} INFO  [http] GET /api/turnos 200 61ms`],
        ['t-muted', `${ts()} INFO  [db] pool: 12/50 conexiones activas`],
        ['t-muted', `${ts()} INFO  [http] GET /health 200 9ms`],
        ['t-ok', '✔ Sin errores en los últimos 15 minutos.']
      ],
      incident: () => [
        ['t-muted', `${ts()} INFO  [http] GET /api/turnos 200 64ms`],
        ['t-warn', `${ts()} WARN  [db] pool: esperando conexión libre (30s)...`],
        ['t-err', `${ts()} ERROR [db] Connection TimeOut: Database unreachable on Port 1433 (sql-prod-01)`],
        ['t-err', `${ts()} ERROR [db] java.sql.SQLException: Login timeout expired`],
        ['t-err', `${ts()} ERROR [http] GET /api/turnos 500 Internal Server Error 30012ms`],
        ['t-err', `${ts()} ERROR [http] GET /health 500 Internal Server Error`],
        ['t-warn', '⚠ 214 errores HTTP 500 en los últimos 5 minutos.']
      ],
      evidence: 'app.log: "Connection TimeOut: Database unreachable on Port 1433" + 214 HTTP 500 en 5 min'
    },
    sql: {
      prompt: 'sqlcmd -S sql-prod-01,1433 -Q "SELECT @@SERVERNAME, GETDATE();"',
      healthy: () => [
        ['t-white', 'SERVERNAME        FECHA'],
        ['t-white', '----------------- -----------------------'],
        ['t-white', `SQL-PROD-01       ${ts()}`],
        ['t-ok', '(1 row affected) ✔ Consulta OK en 11 ms']
      ],
      incident: () => [
        ['t-err', 'Sqlcmd: Error: Microsoft ODBC Driver 17 for SQL Server : TCP Provider: Timeout error [258].'],
        ['t-err', 'Sqlcmd: Error: Login timeout expired.'],
        ['t-err', 'Connection TimeOut: Database unreachable on Port 1433'],
        ['t-warn', '→ La BD responde en su consola local (Grafana: OK), pero no es alcanzable desde srv-app-biocom.'],
        ['t-cyan', '→ Sospecha: red / firewall entre app y BD. Corresponde escalar a Infraestructura N2.']
      ],
      evidence: 'sqlcmd desde srv-app-biocom: "Login timeout expired · Database unreachable on Port 1433"'
    },
    port: {
      prompt: 'Test-NetConnection sql-prod-01 -Port 1433',
      healthy: () => [
        ['t-white', 'ComputerName     : sql-prod-01'],
        ['t-white', 'RemotePort       : 1433'],
        ['t-ok', 'TcpTestSucceeded : True']
      ],
      incident: () => [
        ['t-warn', 'WARNING: TCP connect to (10.20.4.15 : 1433) failed'],
        ['t-white', 'ComputerName     : sql-prod-01'],
        ['t-white', 'RemotePort       : 1433'],
        ['t-white', 'PingSucceeded    : True'],
        ['t-err', 'TcpTestSucceeded : False']
      ],
      evidence: 'Test-NetConnection sql-prod-01:1433 → Ping OK, TcpTestSucceeded: False'
    }
  };

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
      termOut.innerHTML = '<span class="t-cyan">ops@srv-app-biocom:~$</span> ';
      return;
    }
    const cmd = commands[name];
    const active = incidentActive();
    const lines = active ? cmd.incident() : cmd.healthy();
    termBusy = true;
    $$('.cmd-btn').forEach(b => { b.disabled = true; });
    appendLine('t-cyan', `ops@srv-app-biocom:~$ ${cmd.prompt}`);
    let i = 0;
    const next = () => {
      if (i < lines.length) {
        appendLine(lines[i][0], lines[i][1]);
        i++;
        setTimeout(next, prefersReducedMotion ? 0 : 180);
        return;
      }
      termBusy = false;
      $$('.cmd-btn').forEach(b => { b.disabled = false; });
      if (active) {
        lab.lastOutput = cmd.evidence;
        if (!lab.triaged) {
          lab.triaged = true;
          addEvent('INFO', 'Triage: causa probable identificada (BD no alcanzable desde la app)');
          updateSteps();
        }
        const already = lab.evidence.includes(cmd.evidence);
        attachBtn.classList.toggle('hidden', already || lab.phase === 'resolved');
        $('#attachMsg').textContent = already ? '✔ Esta evidencia ya está en el ticket' : '';
      } else {
        attachBtn.classList.add('hidden');
        $('#attachMsg').textContent = '';
      }
    };
    setTimeout(next, prefersReducedMotion ? 0 : 250);
  }

  $$('.cmd-btn').forEach(btn => btn.addEventListener('click', () => runCommand(btn.dataset.cmd)));

  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      if (!lab.lastOutput || lab.evidence.includes(lab.lastOutput)) return;
      lab.evidence.push(lab.lastOutput);
      attachBtn.classList.add('hidden');
      updateDescription();
      updateEvidenceHint();
      const where = lab.phase === 'detected' ? 'se adjuntará al abrir el ticket' : `adjuntada a MON-${lab.ticketNum}`;
      $('#attachMsg').textContent = `✔ Evidencia ${where}`;
      addEvent('INFO', `Evidencia ${where}`);
    });
  }

  updateGlobal();
  updateSteps();
  addEvent('OK', 'Monitoreo iniciado · 4 servicios en producción OK');

  // ==========================================================
  // 7. ASISTENTE ABI (mejorado: chat, contexto del LAB, acciones)
  // ==========================================================
  const abiLog = $('#abiLog');
  const abiForm = $('#abiForm');
  const abiInput = $('#abiInput');
  const abiChips = $('#abiChips');
  const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function downloadCV() {
    const link = document.createElement('a');
    link.href = 'Manuel_Molina_CV.pdf';
    link.download = 'Manuel_Molina_CV.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function labGuide() {
    switch (lab.phase) {
      case 'idle':
        return { text: 'El LAB simula un turno en un Command Center. Paso 1: andá al Dashboard y presioná "Simular Evento de Caída". ¿Querés que lo dispare yo?', chips: ['Simular caída', '¿Cómo es tu flujo?'] };
      case 'detected':
        return { text: '🚨 Hay un evento CRITICAL en Servidor App Biocom. Te recomiendo: 1) correr "Verificar Log de Caída" en la consola para validar, 2) hacer clic en la tarjeta roja para abrir el ticket.', chips: ['Ir a la consola', 'Abrir ticket'] };
      case 'ticket':
        return { text: lab.evidence.length
          ? `El ticket MON-${lab.ticketNum} ya tiene evidencia. Como la BD no es alcanzable por el puerto 1433, lo correcto es escalar a Infraestructura N2. Presioná "Escalar Ticket".`
          : `El ticket MON-${lab.ticketNum} está abierto pero sin evidencia. Antes de escalar, adjuntá el log o la consulta SQL desde la consola: así N2 no tiene que volver a preguntar.`, chips: lab.evidence.length ? ['Ir a tickets'] : ['Ir a la consola'] };
      case 'escalated':
        return { text: `MON-${lab.ticketNum} está escalado y notificado por chat. En la vida real ahora sigo monitoreando y actualizo el hilo. Podés simular la resolución de N2 desde la pestaña Tickets.`, chips: ['Ir a tickets'] };
      default:
        return { text: '✅ Incidente resuelto de punta a punta: detección, triage, ticket con evidencia y escalamiento. Ese es el trabajo diario de Manuel. ¿Lo hablamos?', chips: ['Contacto', 'Descargar CV'] };
    }
  }

  const abiKnowledge = [
    {
      keys: ['simular', 'disparar', 'generar evento', 'caida', 'probar lab', 'demo'],
      answer: () => {
        if (simulateOutage()) {
          gotoTab('dash');
          return { text: '⚡ Listo, disparé una caída en Servidor App Biocom. Mirá el Dashboard: está en CRITICAL 500. Hacé clic en la tarjeta roja para abrir el ticket.', chips: ['¿Qué hago ahora?', 'Ir a la consola'] };
        }
        return labGuide();
      }
    },
    { keys: ['que hago', 'ahora', 'siguiente', 'paso', 'ayuda', 'como funciona', 'lab', 'laboratorio', 'simulador', 'estado'], answer: labGuide },
    { keys: ['ir a la consola', 'consola', 'log', 'diagnostico'], answer: () => { gotoTab('console'); return { text: 'Te llevé a la Consola de Diagnóstico. Probá "Verificar Log de Caída" o la consulta SQL.' }; } },
    { keys: ['abrir ticket', 'ir a tickets', 'ticket', 'jira'], answer: () => {
        if (lab.phase === 'detected') { openIncident(); return { text: 'Abrí el ticket en Jira con los datos precargados: P1, producción, usuarios afectados.' }; }
        if (lab.phase === 'idle') return { text: 'Todavía no hay incidentes. Primero simulá una caída en el Dashboard.', chips: ['Simular caída'] };
        gotoTab('jira'); return { text: `Te llevé al ticket MON-${lab.ticketNum}.` };
      } },
    {
      keys: ['flujo', 'proceso', 'escal', 'triage', 'n2', 'n3', 'itil', 'incidente', 'workflow'],
      answer: () => ({ text: 'Su flujo L1 tiene 4 pasos:\n1) Detección en dashboards (Grafana/Zabbix)\n2) Triage y validación con logs y SQL\n3) Ticket en Jira/Redmine con prioridad, impacto y evidencia\n4) Escalamiento a N2/N3 por chat y seguimiento hasta el cierre dentro del SLA.', chips: ['Simular caída', 'Experiencia'] })
    },
    {
      keys: ['experiencia', 'trabajo', 'trayectoria', 'empresa', 'medicus', 'otamendi', 'claro', 'sondeos', 'beretta', 'anos'],
      answer: () => ({ text: 'Más de 7 años en IT. Hoy es Operador de Monitoreo en Sanatorio Otamendi e IT Analyst en Medicus. Antes: Sondeos Global, Beretta Galarce & Asociados y Claro Argentina.', chips: ['Ver experiencia', 'Stack técnico'] })
    },
    { keys: ['ver experiencia'], answer: () => { scrollToEl($('#experiencia')); return { text: 'Te llevo a la sección Experiencia 👇' }; } },
    {
      keys: ['formacion', 'estudi', 'educacion', 'titulo', 'carrera', 'curso', 'utn', 'iutai', 'data science', 'ingles', 'idioma'],
      answer: () => ({ text: 'Técnico Superior en Informática (IUTAI). En curso: Automatización con IA (UTN) y Data Science (EducaciónIT). Idiomas: español nativo e inglés B1 orientado a documentación técnica 🎓' })
    },
    {
      keys: ['stack', 'habilidad', 'skill', 'sabe', 'herramienta', 'redmine', 'active directory', 'grafana', 'zabbix', 'monitoreo', 'sql', 'mongo', 'tecnologia'],
      answer: () => ({ text: 'Monitoreo con Grafana y Zabbix, gestión de incidentes ITIL con Jira y Redmine, Application Support (Thinksoft, Biocom, Binary), SQL y MongoDB, Active Directory y redes (TCP/IP, DNS, DHCP, VPN).', chips: ['Simular caída'] })
    },
    {
      keys: ['servicio', 'ofrece', 'freelance', 'independiente', 'red', 'cableado', 'hardware', 'qa', 'testing'],
      answer: () => ({ text: 'Ofrece: monitoreo y operaciones IT, mesa de ayuda L1/L2, gestión de accesos, testing funcional/QA, soporte de hardware y redes. Podés cotizar desde el formulario 📋', chips: ['Cotizar'] })
    },
    { keys: ['cv', 'curriculum', 'descargar', 'pdf', 'resume'], answer: () => { setTimeout(downloadCV, 700); return { text: '¡Claro! Te descargo el CV de Manuel en PDF 📄' }; } },
    {
      keys: ['precio', 'costo', 'cotiz', 'presupuesto', 'cuanto', 'tarifa', 'valor'],
      answer: () => { setTimeout(() => scrollToEl($('#contacto')), 700); return { text: 'El presupuesto depende del servicio y la cantidad de usuarios. Te llevo al cotizador: elegí el servicio, mové el slider de usuarios y Manuel te responde a la brevedad 💬' }; }
    },
    { keys: ['linkedin', 'perfil'], answer: () => ({ text: 'Acá tenés el LinkedIn de Manuel, escribile o conectá con él 👉', link: { href: LINKEDIN_URL, text: 'linkedin.com/in/manuelmolina01' } }) },
    {
      keys: ['contact', 'mail', 'correo', 'hablar', 'escrib', 'whatsapp', 'telefono'],
      answer: () => { setTimeout(() => scrollToEl($('#contacto')), 900); return { text: 'Podés escribirle desde el formulario de contacto o por LinkedIn. ¡Te llevo al formulario! 📲', link: { href: LINKEDIN_URL, text: 'linkedin.com/in/manuelmolina01' } }; }
    },
    {
      keys: ['disponib', 'busca', 'empleo', 'propuesta', 'contrat', 'remoto', 'hibrido', 'puesto', 'rol'],
      answer: () => ({ text: 'Sí: Manuel busca un rol de Operador de Monitoreo de Servidores y Servicios / Command Center Operator, 100% remoto. Elegí "Propuesta laboral" en el formulario 🚀', chips: ['Contacto', 'Descargar CV'] })
    },
    { keys: ['hola', 'buenas', 'hey', 'buen dia', 'que tal'], answer: () => ({ text: '¡Hola! Soy Abi 🤖. Puedo contarte sobre Manuel o guiarte en el LAB de Monitoreo.', chips: ['¿Qué hago en el LAB?', 'Experiencia', 'Stack técnico'] }) },
    { keys: ['gracias', 'genial', 'buenisimo', 'excelente'], answer: () => ({ text: '¡De nada! Si te sirvió el perfil, Manuel estaría feliz de hablar con vos 😊', chips: ['Contacto', 'LinkedIn'] }) },
    { keys: ['quien sos', 'que sos', 'abi', 'bot', 'ia'], answer: () => ({ text: 'Soy Abi, un asistente hecho en JavaScript vanilla (sin servidores ni APIs). Conozco el perfil de Manuel y sigo en tiempo real lo que pasa en el LAB 😄' }) }
  ];

  // Puntúa cada respuesta por la cantidad de coincidencias (al inicio de palabra) y elige la mejor.
  function findAnswer(query) {
    const q = normalize(query);
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

  const defaultChips = ['¿Qué hago en el LAB?', 'Simular caída', 'Experiencia', 'Stack técnico', 'Descargar CV', 'Contacto'];
  function renderChips(list) {
    abiChips.innerHTML = '';
    (list && list.length ? list : defaultChips).forEach(label => {
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
    typing.innerHTML = '<span class="abi-typing" aria-label="Abi está escribiendo"><span></span><span></span><span></span></span>';
    setTimeout(() => {
      typing.remove();
      const match = findAnswer(query);
      const res = match ? match.answer() : {
        text: 'Esa no la sé 🤔. Probá preguntar por "experiencia", "stack", "qué hago en el LAB" o "contacto". Y si es algo puntual, Manuel te responde por el formulario.',
        chips: defaultChips
      };
      addAbiMsg('bot', res.text, res.link);
      renderChips(res.chips);
      abiBusy = false;
    }, prefersReducedMotion ? 100 : 650);
  }

  if (abiLog && abiForm) {
    addAbiMsg('bot', '¡Hola! Soy Abi 🤖, la asistente del Command Center. Te puedo contar sobre la experiencia de Manuel o guiarte paso a paso en el LAB. ¿Por dónde empezamos?');
    renderChips();
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
    userCountDisplay.innerText = val >= 500 ? '500+ usuarios (Enterprise)' : `${val} usuario${val > 1 ? 's' : ''}`;
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
      submitBtn.querySelector('.btn-text').innerText = 'Enviando mensaje...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formAlert.classList.add('success');
          formAlert.innerText = `¡Muchas gracias, ${fullname.value.trim()}! Tu mensaje fue enviado con éxito. Te responderé a la brevedad.`;
          form.reset();
          if (userSlider && userCountDisplay) updateUserCount();
        } else {
          const data = await response.json().catch(() => null);
          throw new Error(data && data.errors
            ? data.errors.map(error => error.message).join(', ')
            : 'Ocurrió un error al enviar el formulario.');
        }
      } catch (err) {
        formAlert.classList.add('error');
        formAlert.innerText = err.message || 'Error de conexión. Intentalo nuevamente.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').innerText = 'Enviar Mensaje';
      }
    });
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
});
