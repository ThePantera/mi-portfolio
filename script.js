document.addEventListener('DOMContentLoaded', () => {

  // 1. CONTADOR DE VISITAS REALES
  const realViewsCount = document.getElementById('realViewsCount');
  if (realViewsCount) {
    const namespace = 'manuel-molina-portfolio-2026';
    const key = 'pageviews';

    fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
      .then(res => res.json())
      .then(data => {
        if (data && data.count) {
          realViewsCount.innerText = data.count.toLocaleString();
        } else {
          realViewsCount.innerText = '1';
        }
      })
      .catch(() => {
        realViewsCount.innerText = '1';
      });
  }

  // 2. MODO OSCURO / MODO DÍA
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
    }
  }

  // 3. MÁQUINA DE ESCRIBIR
  const typedTextSpan = document.getElementById("typedText");
  const textArray = [
    "Analista de Soporte IT L1/L2",
    "Application Support Specialist",
    "Gestión de Incidentes & ITIL"
  ];
  const typingDelay = 100;
  const erasingDelay = 50;
  const newTextDelay = 2000;
  let textArrayIndex = 0;
  let charIndex = 0;

  function type() {
    if (!typedTextSpan) return;
    if (charIndex < textArray[textArrayIndex].length) {
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (!typedTextSpan) return;
    if (charIndex > 0) {
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      textArrayIndex++;
      if (textArrayIndex >= textArray.length) textArrayIndex = 0;
      setTimeout(type, typingDelay + 500);
    }
  }

  if (typedTextSpan && textArray.length) setTimeout(type, newTextDelay + 250);

  // 4. SLIDER DINÁMICO DE CANTIDAD DE USUARIOS
  const userSlider = document.getElementById('user_count_range');
  const userCountDisplay = document.getElementById('userCountDisplay');

  if (userSlider && userCountDisplay) {
    userSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val >= 500) {
        userCountDisplay.innerText = '500+ usuarios (Enterprise)';
      } else {
        userCountDisplay.innerText = `${val} usuario${val > 1 ? 's' : ''}`;
      }
    });
  }

  // 5. CONSOLA PING INTERACTIVA
  const runPingBtn = document.getElementById('runPingBtn');
  const pingOutput = document.getElementById('pingOutput');

  if(runPingBtn && pingOutput) {
    runPingBtn.addEventListener('click', () => {
      pingOutput.innerText = '> Executing ICMP Ping to gateway...';
      setTimeout(() => {
        const ms = Math.floor(Math.random() * (20 - 8 + 1)) + 8;
        pingOutput.innerText = `> Reply from 192.168.1.1: bytes=32 time=${ms}ms TTL=64\n> Connection: OPTIMAL (0% loss)`;
      }, 800);
    });
  }

  // 6. ASISTENTE ABI
  const aiSendBtn = document.getElementById('aiSendBtn');
  const aiInput = document.getElementById('aiInput');
  const aiResponse = document.getElementById('aiResponse');

  const randomResponses = [
    "¿Ya me contactaste? 🤔",
    "¿Qué estás esperando? ¡Contáctame! 🚀",
    "Todavía estoy esperando que me contactes... ⏳",
    "Acá sigo esperando tu mensaje en el formulario de abajo 😉",
    "No lo pienses más, bajá hasta la sección de contacto y hablemos 📲"
  ];

  if(aiSendBtn && aiInput && aiResponse) {
    aiSendBtn.addEventListener('click', processAiQuery);
    aiInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') processAiQuery();
    });
  }

  function processAiQuery() {
    const query = aiInput.value.trim();
    if(!query) return;

    aiResponse.innerText = '> Abi procesando...';
    aiInput.value = '';

    setTimeout(() => {
      const randomMsg = randomResponses[Math.floor(Math.random() * randomResponses.length)];
      aiResponse.innerText = `> Abi: ${randomMsg}`;
    }, 600);
  }

  // 7. ENVÍO Y VALIDACIÓN DEL FORMULARIO DE CONTACTO (FORMSPREE)
  const form = document.getElementById('portfolioForm');
  const fullname = document.getElementById('fullname');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  const formAlert = document.getElementById('formAlert');

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
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

      if (isValid) {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').innerText = 'Enviando mensaje...';

        const formData = new FormData(form);

        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            formAlert.classList.add('success');
            formAlert.innerText = `¡Muchas gracias, ${fullname.value.trim()}! Tu mensaje fue enviado con éxito. Te responderé a la brevedad.`;
            form.reset();
            if (userCountDisplay) userCountDisplay.innerText = '10 usuarios';
          } else {
            const data = await response.json();
            if (data && data.errors) {
              throw new Error(data.errors.map(error => error.message).join(", "));
            } else {
              throw new Error('Ocurrió un error al enviar el formulario.');
            }
          }
        } catch (err) {
          formAlert.classList.add('error');
          formAlert.innerText = err.message || 'Error de conexión. Intentalo nuevamente.';
        } finally {
          submitBtn.disabled = false;
          submitBtn.querySelector('.btn-text').innerText = 'Enviar Mensaje';
        }
      }
    });
  }

  function setError(inputElement) {
    inputElement.closest('.form-group').classList.add('error');
  }

  // 8. SOMBRA EN HEADER AL SCROLLEAR
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
      } else {
        header.style.boxShadow = 'none';
      }
    }
  });
});
