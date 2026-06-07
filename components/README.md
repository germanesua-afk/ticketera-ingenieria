# Carpeta /components

Aquí viven todos los **componentes visuales** de la aplicación (piezas de interfaz reutilizables).

## Estructura

- `ui/` → Componentes básicos y genéricos (Button, Badge, Input, Dialog, etc.). Estos vienen principalmente de shadcn/ui.
- `dashboard/` → Componentes específicos del tablero y la ticketera (tablas de tickets, semáforos, etc.).

## Recomendación

- Si necesitás cambiar el estilo o comportamiento de un botón o tabla básica → mirá en `ui/`.
- Si querés modificar algo específico del sistema de tickets (la tabla de tickets, las tarjetas del dashboard, etc.) → mirá en `dashboard/`.

**Nota:** A medida que el proyecto crezca, podemos crear más carpetas aquí (ej: `components/tickets/`, `components/projects/`).