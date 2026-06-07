# Features (Módulos de Negocio)

Esta carpeta contiene la lógica principal del sistema, organizada por dominio.

## Estructura recomendada

- `tickets/` → Todo lo relacionado con la creación, asignación, estados y flujo de tickets.
- `projects/` → Gestión de proyectos (solo JEFEING).
- `users/` → Lógica relacionada con usuarios y roles.

## Por qué existe esta carpeta

En lugar de tener toda la lógica dispersa en `lib/` o `app/`, agrupamos el código por funcionalidad real del negocio. Esto hace que sea mucho más fácil encontrar dónde está cada cosa cuando el proyecto crezca.

Ejemplo futuro:
- Si querés entender cómo se asigna un dueño a un ticket → entrás a `features/tickets/`
- Si querés modificar la lógica de Proyectos → entrás a `features/projects/`

## Estado actual

Esta carpeta está recién creada y todavía contiene poca lógica (el proyecto está en etapa temprana). Iremos moviendo código hacia acá a medida que el desarrollo avance.