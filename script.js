document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar íconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Alternar Tema (Modo Oscuro / Claro)
    const themeToggleBtn = document.getElementById("themeToggle");
    const htmlElement = document.documentElement;

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = htmlElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            htmlElement.setAttribute("data-theme", newTheme);
            
            // Actualizar icono de la luna/sol
            const icon = themeToggleBtn.querySelector("i");
            if (icon) {
                if (newTheme === "light") {
                    icon.setAttribute("data-lucide", "sun");
                } else {
                    icon.setAttribute("data-lucide", "moon");
                }
                lucide.createIcons();
            }
        });
    }

    // 3. Manejo del envío del formulario con Formspree (Limpieza automática al enviar)
    const portfolioForm = document.getElementById("portfolioForm");

    if (portfolioForm) {
        portfolioForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i data-lucide="loader"></i> Enviando...';
            submitBtn.disabled = true;
            if (typeof lucide !== 'undefined') lucide.createIcons();

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert("¡Mensaje enviado con éxito! Me pondré en contacto pronto.");
                    form.reset();
                } else {
                    alert("Hubo un problema al enviar tu mensaje. Por favor, intentalo de nuevo.");
                }
            } catch (error) {
                alert("Error de conexión al enviar el mensaje.");
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    // 4. Marcar en la barra de navegación la sección visible al hacer scroll
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });
});
