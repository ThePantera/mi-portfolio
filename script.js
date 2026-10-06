(function () {
  'use strict';

  const root = document.documentElement;

  /* ---------- 1. Tema claro / oscuro ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function currentTheme() {
    const explicit = root.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function syncThemeUi() {
    const theme = currentTheme();
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    }
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#0b1118' : '#f3f6f9');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* sin almacenamiento: el cambio vale para esta visita */ }
      syncThemeUi();
    });
  }
  syncThemeUi();

  /* ---------- 2. Menú en pantallas chicas ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const siteNav = document.getElementById('siteNav');

  function setMenu(open) {
    if (!menuToggle || !siteNav) return;
    siteNav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      setMenu(!siteNav.classList.contains('is-open'));
    });
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------- 3. Enlace activo según la sección visible ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  const observed = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && observed.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-current', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    observed.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- 4. Simulación de alertas (datos ficticios) ---------- */
  const STEP_LABELS = ['Detecto', 'Valido', 'Registro', 'Notifico', 'Escalo', 'Sigo'];

  const ALERTS = {
    api: {
      steps: [
        'El panel de APIs muestra respuestas HTTP 500 sostenidas en la API de turnos.',
        'Reviso desde cuándo ocurre, si el error persiste y si otras APIs o el servidor que la aloja también fallan.',
        'Abro un ticket con el servicio afectado, la hora de inicio, el síntoma y una captura del panel.',
        'Aviso por chat al sector responsable con el número de ticket.',
        'Derivo el incidente al equipo de Aplicaciones.',
        'Controlo el panel hasta que la API responda con normalidad y actualizo el ticket.'
      ],
      ticket: {
        'Título': 'API de turnos responde HTTP 500',
        'Servicio': 'API de turnos',
        'Inicio': '10:42',
        'Síntoma': 'Errores 500 sostenidos en el panel de APIs',
        'Evidencia': 'Captura del dashboard',
        'Escalado a': 'Equipo de Aplicaciones',
        'Estado': 'En seguimiento'
      }
    },
    server: {
      steps: [
        'El dashboard marca el servidor de aplicaciones sin respuesta.',
        'Confirmo que no sea un corte del propio monitoreo: reviso si otros servidores del mismo grupo reportan con normalidad.',
        'Abro un ticket con el servidor afectado, la hora de la última métrica recibida y una captura del gráfico.',
        'Aviso por chat al sector responsable y aclaro qué servicios dependen de ese servidor.',
        'Derivo el incidente al equipo de Infraestructura.',
        'Sigo el gráfico hasta que el servidor vuelva a reportar y dejo asentada la hora de recuperación.'
      ],
      ticket: {
        'Título': 'Servidor de aplicaciones sin respuesta',
        'Servicio': 'Servidor de aplicaciones',
        'Inicio': '14:05',
        'Síntoma': 'Sin métricas ni respuesta desde las 14:05',
        'Evidencia': 'Captura del gráfico del servidor',
        'Escalado a': 'Equipo de Infraestructura',
        'Estado': 'En seguimiento'
      }
    },
    wifi: {
      steps: [
        'El panel de conectividad muestra puntos de acceso del piso 3 sin conexión.',
        'Verifico cuántos puntos de acceso están afectados y si el resto de los pisos funciona con normalidad.',
        'Abro un ticket con el sector afectado, la cantidad de puntos de acceso caídos y la hora de inicio.',
        'Aviso por chat al sector responsable e indico el alcance: un piso, no todo el edificio.',
        'Derivo el incidente al equipo de Redes.',
        'Sigo el panel hasta que los puntos de acceso vuelvan a conectarse y actualizo el ticket.'
      ],
      ticket: {
        'Título': 'Wi-Fi piso 3 con puntos de acceso sin conexión',
        'Servicio': 'Wi-Fi piso 3',
        'Inicio': '08:17',
        'Síntoma': 'Puntos de acceso del piso 3 fuera de línea',
        'Evidencia': 'Captura del panel de conectividad',
        'Escalado a': 'Equipo de Redes',
        'Estado': 'En seguimiento'
      }
    },
    nodata: {
      steps: [
        'El panel de servidores dejó de mostrar métricas hace 10 minutos.',
        'Reviso si la falta de datos es de un servidor o de todos: si son todos, el problema puede estar en el monitoreo y no en los servidores.',
        'Abro un ticket que aclara que se perdió visibilidad, desde qué hora y qué paneles están afectados.',
        'Aviso por chat que el monitoreo está sin datos, para que nadie asuma que todo funciona.',
        'Derivo el incidente al equipo responsable de la herramienta de monitoreo.',
        'Sigo el panel hasta que vuelvan las métricas y reviso si en ese lapso quedó alguna alerta sin ver.'
      ],
      ticket: {
        'Título': 'Panel de servidores sin métricas',
        'Servicio': 'Monitoreo de servidores',
        'Inicio': '16:30',
        'Síntoma': 'Sin datos en el panel desde las 16:30',
        'Evidencia': 'Captura del panel vacío',
        'Escalado a': 'Responsables de la herramienta de monitoreo',
        'Estado': 'En seguimiento'
      }
    }
  };

  const simTabs = Array.prototype.slice.call(document.querySelectorAll('.sim-alert'));
  const simPanel = document.getElementById('simPanel');
  const simSteps = document.getElementById('simSteps');
  const simTicket = document.getElementById('simTicket');

  function renderAlert(key) {
    const alertData = ALERTS[key];
    if (!alertData || !simSteps || !simTicket) return;

    simSteps.textContent = '';
    alertData.steps.forEach(function (text, i) {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'sim-step-label';
      label.textContent = STEP_LABELS[i];
      const body = document.createElement('span');
      body.className = 'sim-step-text';
      body.textContent = text;
      li.appendChild(label);
      li.appendChild(body);
      simSteps.appendChild(li);
    });

    simTicket.textContent = '';
    Object.keys(alertData.ticket).forEach(function (field) {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = field;
      const dd = document.createElement('dd');
      dd.textContent = alertData.ticket[field];
      row.appendChild(dt);
      row.appendChild(dd);
      simTicket.appendChild(row);
    });
  }

  function selectAlert(tab, moveFocus) {
    simTabs.forEach(function (t) {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    if (simPanel) simPanel.setAttribute('aria-labelledby', tab.id);
    renderAlert(tab.dataset.alert);
    if (moveFocus) tab.focus();
  }

  simTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectAlert(tab, false); });
    tab.addEventListener('keydown', function (e) {
      let target = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = simTabs[(index + 1) % simTabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = simTabs[(index - 1 + simTabs.length) % simTabs.length];
      if (e.key === 'Home') target = simTabs[0];
      if (e.key === 'End') target = simTabs[simTabs.length - 1];
      if (target) {
        e.preventDefault();
        selectAlert(target, true);
      }
    });
  });

  /* ---------- 5. Formulario de contacto ---------- */
  const form = document.getElementById('contactForm');
  const fullname = document.getElementById('fullname');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(input, hasError) {
    const field = input.closest('.field');
    if (field) field.classList.toggle('has-error', hasError);
    if (hasError) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function setStatus(text, kind) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  [fullname, email, message].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () { setFieldError(input, false); });
  });

  if (form && fullname && email && message && submitBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');

      const checks = [
        [fullname, fullname.value.trim().length >= 3],
        [email, emailRegex.test(email.value.trim())],
        [message, message.value.trim().length >= 5]
      ];
      let firstInvalid = null;
      checks.forEach(function (pair) {
        setFieldError(pair[0], !pair[1]);
        if (!pair[1] && !firstInvalid) firstInvalid = pair[0];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) {
        setStatus('Esta es una vista previa: el formulario envía mensajes solo en el sitio publicado.', '');
        return;
      }

      const name = fullname.value.trim();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            setStatus('Mensaje enviado. Gracias, ' + name + ': te respondo a la brevedad.', 'ok');
            return;
          }
          return response.json().catch(function () { return null; }).then(function (data) {
            const detail = data && data.errors
              ? data.errors.map(function (err) { return err.message; }).join(', ')
              : 'El servicio de envío rechazó el mensaje.';
            throw new Error(detail);
          });
        })
        .catch(function (err) {
          const detail = err && err.message && err.message !== 'Failed to fetch'
            ? err.message
            : 'No se pudo conectar con el servicio de envío.';
          setStatus(detail + ' Probá de nuevo o escribime por LinkedIn.', 'error');
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar mensaje';
        });
    });
  }

  /* ---------- 6. Año del pie ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
