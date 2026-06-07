# Estructura del Proyecto - Ticketera Despliegue de Obras

**Objetivo de este documento:**  
Explicar de forma clara y simple cómo está organizado el proyecto para que puedas navegarlo fácilmente en VS Code, incluso si no programás.

---

## 1. Cómo está organizado el proyecto (Vista General)

```
C:\grok p\
├── app/                    → Aquí viven las páginas y pantallas de la aplicación
├── components/             → Componentes de interfaz (botones, tablas, tarjetas, etc.)
├── features/               → Lógica de negocio por módulo (tickets, proyectos, usuarios...)
├── lib/                    → Funciones de ayuda y conexiones (Supabase, autenticación, etc.)
├── types/                  → Definiciones de datos (TypeScript)
├── supabase/               → Migraciones de la base de datos
├── docs/                   → Toda la documentación del proyecto (lo más importante para vos)
├── public/                 → Archivos estáticos (imágenes, íconos, etc.)
└── README.md               → Punto de entrada principal del proyecto
```

---

## 2. Carpeta por Carpeta (Explicación Simple)

### `/app` - Las Pantallas de la Aplicación
Esta es la carpeta más importante para entender qué ve el usuario.

- `app/login/` → Pantalla de inicio de sesión
- `app/(dashboard)/` → Todo lo que se ve después de loguearse (el sistema protegido)
  - `page.tsx` → El Dashboard principal
  - `tickets/[id]/page.tsx` → Página de detalle de un ticket

**Regla de Next.js:** Las carpetas dentro de `app/` generalmente representan URLs.

### `/components` - Piezas de Interfaz
Aquí están los "bloques" que se reutilizan en varias pantallas.

- `components/ui/` → Componentes básicos (Botón, Badge, Tabla, etc.). Estos casi nunca se tocan.
- `components/dashboard/` → Componentes específicos del tablero (TicketTable, SemaphoreLegend, etc.)

### `/features` (Carpeta recomendada - actualmente casi vacía)
Aquí es donde **deberíamos** poner la lógica más importante del sistema, separada por módulo:

Ejemplo futuro:
- `features/tickets/` → Todo lo relacionado con tickets
- `features/projects/` → Todo lo relacionado con proyectos
- `features/users/` → Gestión de usuarios y roles

**Ventaja:** Si querés entender cómo funciona la creación de tickets, vas directo a `features/tickets/`.

### `/lib` - Funciones de Apoyo
Código que ayuda al resto de la aplicación pero que no es una pantalla ni un componente visual.

Ejemplos actuales:
- `lib/supabase/` → Conexión con la base de datos
- `lib/auth.ts` → Funciones relacionadas con usuarios y roles
- `lib/semaphore.ts` → Lógica de los semáforos de colores

### `/docs` - La Documentación (Tu mejor amigo)
Esta carpeta es la más útil para vos:

- `REGLAS_DEL_SISTEMA.md` → Todas las reglas de negocio que definimos
- `PLAN_DE_DESARROLLO.md` → En qué orden vamos a construir el sistema
- `PROJECT_STRUCTURE.md` → Este archivo (cómo está organizado el código)

### `/supabase`
Contiene las migraciones de la base de datos (los archivos SQL que crean las tablas).

---

## 3. Dónde está cada cosa importante (Mapa Rápido)

| Lo que ves en la aplicación       | Dónde está el código principal                  |
|-----------------------------------|-------------------------------------------------|
| Pantalla de Login                 | `app/login/page.tsx`                            |
| Dashboard principal               | `app/(dashboard)/page.tsx`                      |
| Tabla de tickets                  | `components/dashboard/TicketTable.tsx`          |
| Semáforos (colores)               | `components/dashboard/SemaphoreLegend.tsx` + `lib/semaphore.ts` |
| Lógica de roles y usuarios        | `lib/auth.ts`                                   |
| Reglas de negocio                 | `docs/REGLAS_DEL_SISTEMA.md`                    |
| Estructura de la base de datos    | `supabase/migrations/`                          |

---

## 4. Recomendaciones para navegar en VS Code

1. **Abrí la carpeta** `C:\grok p` como workspace en VS Code.
2. Usá la barra lateral izquierda (Explorer) y expandí las carpetas `app`, `components` y `docs` primero.
3. La carpeta **`docs`** debería ser tu punto de partida cuando quieras entender algo.
4. Cuando veas una pantalla en la aplicación, buscá el archivo que tiene nombre similar dentro de `app/`.

---

## 5. Estado Actual de Organización (Mayo 2026)

- El proyecto todavía está en una etapa temprana.
- Hay bastante código de ejemplo/mock.
- La estructura actual es la típica de Next.js, pero **vamos a mejorarla** para que sea más fácil de entender.
- Este documento se irá actualizando a medida que reorganice el proyecto.

---

**Consejo final:**  
Si abrís VS Code y no entendés algo, abrí primero el archivo que está en `docs/` relacionado con el tema. Es mucho más fácil leer la explicación en español que tratar de entender el código directamente.

¿Querés que empecemos a reorganizar la estructura de carpetas ahora para que quede más clara? Puedo hacerlo de forma ordenada.