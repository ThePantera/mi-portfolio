# Portafolio · Manuel Molina

Sitio personal de **Manuel Molina**, IT Monitoring & Command Center Operator en Buenos Aires.

🔗 **https://thepantera.github.io/mi-portfolio/**

## Qué tiene

- **Proyecto propio:** MeContaron, portal de noticias de Argentina (Next.js, TypeScript, PostgreSQL), con demo y código.
- **Experiencia** en Sanatorio Otamendi, Medicus, Sondeos Global, Beretta Galarce & Asociados y Claro Argentina.
- **Flujo de trabajo** y **casos reales** de monitoreo y Application Support (datos anonimizados).
- **LAB de Monitoreo:** un simulador de Command Center para vivir un incidente de punta a punta (detección, diagnóstico, ticket y escalamiento). Es una simulación: no se conecta a ningún sistema real.
- **Abi:** asistente que responde por palabras clave, hecho en JavaScript.
- Versión en **español e inglés**, descarga directa del **CV** y formulario de **contacto**.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Estructura y textos (cada texto lleva su traducción en `data-en`) |
| `script.js` | Idioma, LAB, Abi, formulario y contadores |
| `style.css` | Estilos propios |
| `en/index.html` | Versión en inglés (estática, para buscadores). **Se genera**: no editar a mano |
| `tools/build-en.html` y `tools/build-en.ps1` | Generador de `en/index.html` a partir de `index.html` |
| `icons.css` | Íconos propios (subset de Font Awesome Free 6.4.0 como máscaras CSS). Para sumar uno: bajar su SVG de `fontawesome-free@6.4.0/svgs/` y agregar una regla igual a las existentes |
| `tailwind.css` | Tailwind compilado a partir de `tailwind.input.css` y `tailwind.config.js` |
| `Manuel_Molina_CV.pdf` | CV que se descarga desde el sitio |
| `og-image.png` | Imagen de vista previa para LinkedIn y otras redes |

## Mantenimiento

- **Actualizar el CV:** reemplazar `Manuel_Molina_CV.pdf` manteniendo el mismo nombre.
- **Recompilar Tailwind** después de usar clases nuevas en `index.html` o `script.js`:

  ```bash
  npx tailwindcss@3 -i tailwind.input.css -o tailwind.css --minify
  ```

- **Evitar caché vieja:** al cambiar CSS o JS, actualizar el `?v=` de los enlaces en `index.html`.
- **Regenerar la versión en inglés:** la página `/en/` se genera a partir de `index.html` (usa las traducciones `data-en`). **Hay que regenerarla después de cualquier cambio en `index.html`** (textos, enlaces o el `?v=`). Desde la carpeta del proyecto:

  ```powershell
  powershell -ExecutionPolicy Bypass -File tools\build-en.ps1
  ```

  Necesita Edge o Chrome instalado. Si agregás un `aria-label` o `title` nuevo en español, sumá su traducción a `ATTR_EN` en `tools/build-en.html`. Después, subir `index.html` y `en/index.html` juntos.
- **Idioma:** el botón ES/EN lleva de una página a la otra. Cada página fija su idioma (`<html lang>`); el navegador del visitante ya no lo cambia solo.

## Publicación

El sitio se publica con GitHub Pages desde la rama `main`: cada merge se publica en uno o dos minutos.

---

© Manuel Molina. El diseño, los textos y el código pertenecen a su autor; no se permite copiarlos para uso comercial sin autorización.
