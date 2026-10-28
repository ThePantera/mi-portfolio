# Portafolio · Manuel Molina

Sitio personal de **Manuel Molina**, IT Monitoring & Command Center Operator en Buenos Aires.

🔗 **https://thepantera.github.io/mi-portfolio/**

## Qué tiene

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

## Publicación

El sitio se publica con GitHub Pages desde la rama `main`: cada merge se publica en uno o dos minutos.

---

© Manuel Molina. El diseño, los textos y el código pertenecen a su autor; no se permite copiarlos para uso comercial sin autorización.
