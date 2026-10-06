document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. CONTADOR DE VISITAS REALES
  // Solo suma una visita por sesión para no inflar el número al recargar.
  const realViewsCount = document.getElementById('realViewsCount');
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
        if (badge) badge.hidden = true;
      });
  }

  // 2. MODO OSCURO / MODO DÍA
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlElement = document.documentElement;
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('theme') || 'light'; } catch (e) {}
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      try { localStorage.setItem('theme', newTheme); } catch (e) {}
    });
  }

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Activar modo día' : 'Activar modo oscuro');
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  }

  // 3. MENÚ MOBILE
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const navLinks = document.getElementById('navLinks');

  function setMenu(open) {
    if (!menuToggleBtn || !navLinks) return;
    navLinks.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuToggleBtn.setAttribute('aria-expanded', String(open));
    menuToggleBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menuToggleBtn.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }

  if (menuToggleBtn && navLinks) {
    menuToggleBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1100) setMenu(false); });
  }

  // 4. MÁQUINA DE ESCRIBIR
  const typedTextSpan = document.getElementById('typedText');
  const textArray = [
    'IT Monitoring Operator',
    'Command Center & IT Operations',
    'Application Support Analyst'
  ];
  const typingDelay = 100;
  const erasingDelay = 50;
  const newTextDelay = 2000;
  let textArrayIndex = 0;
  let charIndex = 0;

  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (charIndex > 0) {
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      textArrayIndex = (textArrayIndex + 1) % textArray.length;
      setTimeout(type, typingDelay + 500);
    }
  }

  if (typedTextSpan) {
    if (prefersReducedMotion) {
      typedTextSpan.textContent = textArray[0];
    } else {
      setTimeout(type, 600);
    }
  }

  // 5. NAVEGACIÓN ACTIVA SEGÚN LA SECCIÓN VISIBLE
  const navLinkEls = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinkEls)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
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
  }

  // 6. ANIMACIONES AL HACER SCROLL
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    document.documentElement.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  // 7. CONTADORES ANIMADOS DE ESTADÍSTICAS
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.6 });
    statNumbers.forEach(el => statObserver.observe(el));
  }

  // 8. SLIDER DINÁMICO DE CANTIDAD DE USUARIOS
  const userSlider = document.getElementById('user_count_range');
  const userCountDisplay = document.getElementById('userCountDisplay');

  function updateUserCount() {
    const val = parseInt(userSlider.value, 10);
    userCountDisplay.innerText = val >= 500
      ? '500+ usuarios (Enterprise)'
      : `${val} usuario${val > 1 ? 's' : ''}`;
  }

  if (userSlider && userCountDisplay) {
    userSlider.addEventListener('input', updateUserCount);
  }

  // 9. CONSOLA PING INTERACTIVA
  const runPingBtn = document.getElementById('runPingBtn');
  const pingOutput = document.getElementById('pingOutput');

  if (runPingBtn && pingOutput) {
    runPingBtn.addEventListener('click', () => {
      runPingBtn.disabled = true;
      pingOutput.innerText = '> Pinging 192.168.1.1 with 32 bytes of data...';
      const times = [];
      let sent = 0;
      const sendPing = () => {
        const ms = Math.floor(Math.random() * 13) + 8;
        times.push(ms);
        sent++;
        pingOutput.innerText += `\n> Reply from 192.168.1.1: bytes=32 time=${ms}ms TTL=64`;
        if (sent < 4) {
          setTimeout(sendPing, 450);
        } else {
          const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
          pingOutput.innerText += `\n> Sent = 4, Received = 4, Lost = 0 (0% loss) · avg ${avg}ms ✔`;
          runPingBtn.disabled = false;
        }
      };
      setTimeout(sendPing, 500);
    });
  }

  // 9b. PANEL DE MONITOREO (DEMO): simula un evento, su escalamiento y la recuperación
  const statusList = document.getElementById('statusList');
  const statusLog = document.getElementById('statusLog');
  const statusClock = document.getElementById('statusClock');

  if (statusList && statusLog) {
    const items = Array.from(statusList.querySelectorAll('li'));
    const timeNow = () => new Date().toLocaleTimeString('es-AR', { hour12: false });
    let ticket = 1040;

    if (statusClock) {
      statusClock.textContent = timeNow();
      setInterval(() => { statusClock.textContent = timeNow(); }, 1000);
    }

    const setState = (li, state, label) => {
      li.dataset.state = state;
      li.querySelector('.status-value').textContent = label;
    };

    const runIncident = () => {
      const li = items[Math.floor(Math.random() * items.length)];
      const name = li.dataset.service;
      ticket++;
      setState(li, 'warn', 'WARN');
      statusLog.innerText = `> ${timeNow()} Alerta: latencia alta en ${name}`;
      setTimeout(() => {
        statusLog.innerText = `> ${timeNow()} Ticket #${ticket} creado y escalado al sector responsable`;
      }, 2200);
      setTimeout(() => {
        setState(li, 'up', 'UP');
        statusLog.innerText = `> ${timeNow()} ${name} recuperado · Ticket #${ticket} resuelto ✔`;
      }, 5000);
    };

    if (!prefersReducedMotion) {
      setTimeout(runIncident, 4000);
      setInterval(runIncident, 11000);
    }
  }

  // 10. ASISTENTE ABI (respuestas por palabras clave)
  const aiSendBtn = document.getElementById('aiSendBtn');
  const aiInput = document.getElementById('aiInput');
  const aiResponse = document.getElementById('aiResponse');

  const LINKEDIN_URL = 'https://www.linkedin.com/in/manuelmolina01';

  const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const abiKnowledge = [
    {
      keys: ['experiencia', 'trabajo', 'trayectoria', 'empresa', 'medicus', 'otamendi', 'claro', 'sondeos', 'beretta', 'anos'],
      answer: 'Más de 7 años en IT. Hoy es Operador de Monitoreo en Sanatorio Otamendi e IT Analyst en Medicus. Antes: Sondeos Global, Beretta Galarce & Asociados y Claro Argentina. Mirá la sección "Experiencia" 👆'
    },
    {
      keys: ['formacion', 'estudi', 'educacion', 'titulo', 'carrera', 'curso', 'utn', 'iutai', 'data science', 'ingles', 'idioma'],
      answer: 'Técnico Superior en Informática (IUTAI). En curso: Automatización con IA (UTN) y Data Science (EducaciónIT). Idiomas: español nativo e inglés B1 orientado a documentación técnica 🎓'
    },
    {
      keys: ['habilidad', 'skill', 'sabe', 'herramienta', 'jira', 'redmine', 'itil', 'active directory', 'grafana', 'zabbix', 'monitoreo', 'sql', 'mongo', 'tecnologia'],
      answer: 'Monitoreo con Grafana y Zabbix, gestión de incidentes ITIL con Jira y Redmine, Application Support (Thinksoft, Biocom, Binary), SQL y MongoDB, Active Directory y redes (TCP/IP, DNS, DHCP, VPN).'
    },
    {
      keys: ['servicio', 'ofrece', 'freelance', 'independiente', 'red', 'cableado', 'hardware', 'qa', 'testing'],
      answer: 'Ofrece: monitoreo y operaciones IT, mesa de ayuda L1/L2, gestión de accesos, testing funcional/QA, soporte de hardware y redes. Podés cotizar desde el formulario 📋'
    },
    {
      keys: ['cv', 'curriculum', 'descargar', 'pdf', 'resume'],
      answer: '¡Claro! Te descargo el CV de Manuel en PDF 📄',
      action: () => {
        const link = document.createElement('a');
        link.href = 'Manuel_Molina_CV.pdf';
        link.download = 'Manuel_Molina_CV.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    },
    {
      keys: ['precio', 'costo', 'cotiz', 'presupuesto', 'cuanto', 'tarifa', 'valor'],
      answer: 'El presupuesto depende del servicio y la cantidad de usuarios. Completá el cotizador de abajo con el slider de usuarios y Manuel te responde a la brevedad 💬'
    },
    {
      keys: ['linkedin', 'perfil'],
      answer: 'Acá tenés el LinkedIn de Manuel, escribile o conectá con él 👉 ',
      link: { href: LINKEDIN_URL, text: 'linkedin.com/in/manuelmolina01' }
    },
    {
      keys: ['contact', 'mail', 'correo', 'hablar', 'escrib', 'whatsapp', 'telefono'],
      answer: 'Podés escribirle desde el formulario de contacto al final de la página o por LinkedIn: linkedin.com/in/manuelmolina01. ¡Te llevo al formulario! 📲',
      action: () => document.getElementById('contacto')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    },
    {
      keys: ['disponib', 'busca', 'empleo', 'propuesta', 'contrat', 'remoto', 'hibrido', 'puesto', 'rol'],
      answer: 'Sí: Manuel busca crecer como IT Monitoring Operator o Command Center Operator, con foco en disponibilidad, detección de eventos e incidentes. Elegí "Propuesta laboral" en el formulario 🚀'
    },
    {
      keys: ['hola', 'buenas', 'hey', 'buen dia', 'que tal'],
      answer: '¡Hola! Soy Abi 🤖. Preguntame por la experiencia, habilidades, formación o cómo contactar a Manuel.'
    },
    {
      keys: ['quien sos', 'que sos', 'abi', 'bot', 'ia'],
      answer: 'Soy Abi, un asistente sencillo hecho con JavaScript para guiarte por este portafolio 😄'
    }
  ];

  const fallbackResponses = [
    'No estoy segura de eso 🤔. Probá preguntar por "experiencia", "formación" o "contacto".',
    'Esa no la sé, pero Manuel sí: escribile desde el formulario de contacto 😉'
  ];

  function getAbiAnswer(query) {
    const q = normalize(query);
    // Coincidencia al inicio de palabra para evitar falsos positivos (ej: "ia" dentro de "experiencia")
    return abiKnowledge.find(item => item.keys.some(k => new RegExp(`\\b${k}`).test(q)));
  }

  function processAiQuery(presetQuery) {
    const query = (presetQuery || aiInput.value).trim();
    if (!query) return;

    aiResponse.innerText = '> Abi está pensando...';
    aiInput.value = '';

    setTimeout(() => {
      const match = getAbiAnswer(query);
      if (match) {
        aiResponse.innerText = `> Abi: ${match.answer}`;
        if (match.link) {
          const a = document.createElement('a');
          a.href = match.link.href;
          a.textContent = match.link.text;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'inline-link';
          aiResponse.appendChild(a);
        }
        if (match.action) setTimeout(match.action, 900);
      } else {
        aiResponse.innerText = `> Abi: ${fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]}`;
      }
    }, 500);
  }

  if (aiSendBtn && aiInput && aiResponse) {
    aiSendBtn.addEventListener('click', () => processAiQuery());
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') processAiQuery();
    });
    document.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => processAiQuery(chip.dataset.q));
    });
  }

  // 11. PRESELECCIÓN DE SERVICIO DESDE LAS TARJETAS
  const serviceSelect = document.getElementById('service_type');
  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', () => {
      if (serviceSelect) serviceSelect.value = link.dataset.service;
    });
  });

  // 12. ENVÍO Y VALIDACIÓN DEL FORMULARIO DE CONTACTO (FORMSPREE)
  const form = document.getElementById('portfolioForm');
  const fullname = document.getElementById('fullname');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  const formAlert = document.getElementById('formAlert');

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function setError(inputElement) {
    inputElement.closest('.form-group').classList.add('error');
    inputElement.setAttribute('aria-invalid', 'true');
  }

  // Quita el error de un campo apenas el usuario lo corrige
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

      form.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
      formAlert.className = 'form-alert';
      formAlert.innerText = '';

      if (fullname.value.trim().length < 3) {
        setError(fullname);
        isValid = false;
      }

      if (!emailRegex.test(email.value.trim())) {
        setError(email);
        isValid = false;
      }

      if (message.value.trim().length < 5) {
        setError(message);
        isValid = false;
      }

      if (!isValid) {
        form.querySelector('.form-group.error input, .form-group.error textarea')?.focus();
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
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

  // 13. HEADER Y BOTÓN "VOLVER ARRIBA" AL SCROLLEAR
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 50);
    if (backToTop) backToTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 14. AÑO DEL FOOTER
  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = new Date().getFullYear();
});
