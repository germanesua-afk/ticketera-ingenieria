# Carpeta /app

Esta carpeta contiene **todas las pantallas y rutas** de la aplicación (usando Next.js App Router).

## Cómo leerla

- Cada carpeta dentro de `app/` representa generalmente una URL.
- Ejemplo: `app/login/page.tsx` → se ve en `http://localhost:3000/login`
- La carpeta `(dashboard)` agrupa las páginas que requieren estar logueado.

## Regla importante

Si querés cambiar algo que el usuario ve en pantalla (un menú, un formulario, el dashboard, etc.), lo más probable es que el archivo esté dentro de esta carpeta `app/`.

Para entender mejor la relación entre lo que ves en la aplicación y los archivos, leé:

→ `docs/PROJECT_STRUCTURE.md`