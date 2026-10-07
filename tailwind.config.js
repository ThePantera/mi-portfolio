// Configuración de Tailwind. Para regenerar tailwind.css después de cambiar clases:
//   npx tailwindcss@3 -i tailwind.input.css -o tailwind.css --minify
module.exports = {
  content: ['./index.html', './script.js'],
  theme: {
    extend: {
      colors: {
        cc: {
          bg: '#070b12',
          panel: '#0c1422',
          panel2: '#101a2b',
          line: '#1c2b40',
          muted: '#8ba0b8',
          text: '#dbe7f3',
          cyan: '#22d3ee',
          blue: '#3b82f6',
          ok: '#22c55e',
          warn: '#f59e0b',
          crit: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    }
  }
};
