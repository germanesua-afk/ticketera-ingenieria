# Ticketera - Despliegue de Obras

Sistema de gestión de tickets para el equipo de Ingeniería (reemplazo de Google Sheets).

Este proyecto está siendo desarrollado de forma personalizada según las reglas y necesidades específicas del equipo.

---

## Para Empezar (Usuarios)

### Cómo correr el proyecto localmente

```powershell
cd "C:\grok p"

# Instalar dependencias (solo la primera vez)
npm install

# Copiar variables de entorno
copy .env.example .env.local

# Editar el archivo .env.local con tus credenciales de Supabase

# Iniciar la aplicación
npm run dev
```

Luego abrí en el navegador: **http://localhost:3000**

---

## Documentación Importante (Leé esto primero)

Toda la información importante del proyecto está en la carpeta **`docs/`**.

Archivos recomendados para leer:

| Archivo | Para qué sirve |
|---------|----------------|
| `docs/REGLAS_DEL_SISTEMA.md` | **Lo más importante.** Todas las reglas de negocio, roles, flujos y permisos definidos. |
| `docs/PROJECT_STRUCTURE.md` | Explicación clara de cómo está organizado el código (ideal para navegar en VS Code). |
| `docs/PLAN_DE_DESARROLLO.md` | En qué orden se va a ir construyendo el sistema. |

**Consejo:** Cuando abras el proyecto en VS Code, empezá por la carpeta `docs/`.

---

## Estructura del Proyecto (Versión Simple)

```
C:\grok p\
├── app/                    → Pantallas y rutas de la aplicación
├── components/             → Componentes visuales reutilizables
├── features/               → Lógica por módulo (tickets, proyectos, usuarios...)
├── lib/                    → Funciones de apoyo (conexión a base de datos, auth, etc.)
├── supabase/               → Migraciones de la base de datos
├── docs/                   → Toda la documentación (leé esto)
├── types/                  → Definiciones de datos
└── README.md               → Este archivo
```

Para una explicación más detallada y amigable de cada carpeta, leé:

→ **`docs/PROJECT_STRUCTURE.md`**

---

## Estado Actual del Proyecto

- El proyecto está en desarrollo activo.
- Todavía hay bastante código de ejemplo y datos de prueba (mock).
- La base de datos y las reglas están siendo actualizadas para coincidir con `REGLAS_DEL_SISTEMA.md`.
- La prioridad actual es sentar una buena base de datos + control de roles y visibilidad.

---

## Cómo Explorar el Proyecto en VS Code

1. Abrí la carpeta completa `C:\grok p` en VS Code.
2. En la barra lateral izquierda expandí primero la carpeta **`docs`**.
3. Leé `PROJECT_STRUCTURE.md` para entender dónde está cada cosa.
4. Usá la búsqueda de VS Code (Ctrl + P) para encontrar archivos rápido.

---

## Contacto / Responsable

Este proyecto se está desarrollando en conjunto. Toda la definición de reglas y prioridades se encuentra documentada en la carpeta `docs/`.

---

**Última actualización:** Mayo 2026## Despliegue a Producción (Acceso Web Público)

Este proyecto está listo para publicarse en **Vercel** (la forma más fácil y recomendada para Next.js).

### Pasos para publicar:

1. **Crea una cuenta en Vercel** (gratis): https://vercel.com

2. **Instala Vercel CLI** (una sola vez):
   `ash
   npm i -g vercel
   `

3. **Desde la carpeta del proyecto**:
   `ash
   vercel
   `

4. **Configura las variables de entorno** (obligatorio):
   En el dashboard de Vercel (o durante el deploy) agregá estas 4 variables de entorno (tomadas de tu .env.local):

   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (opcional por ahora)
   - NEXT_PUBLIC_APP_URL = https://tu-proyecto.vercel.app

5. **Deploy**:
   `ash
   vercel --prod
   `

Una vez desplegado tendrás una URL pública tipo:
https://ticketera-ingenieria-despliegue-obras.vercel.app

**Nota importante sobre el demo:**
- El sistema usa un switcher de usuarios de prueba (barra amarilla) para simular todos los roles sin necesidad de login real.
- Esto es intencional mientras se completa la integración completa con Supabase Auth + tabla de usuarios.

**Alternativa recomendada (más profesional):**
- Subí el código a un repositorio de GitHub.
- Conectá el repo en Vercel (Import Project).
- Configurá las mismas variables de entorno en el dashboard de Vercel.
- Cada push a main hará deploy automático.

