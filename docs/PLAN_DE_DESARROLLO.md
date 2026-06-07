# Plan de Desarrollo - Ticketera Despliegue de Obras

**Fecha:** 27 de mayo de 2026  
**Estado:** En definición  
**Basado en:** `REGLAS_DEL_SISTEMA.md`

---

## Fase 0: Alineación (Completada)

- [x] Relevamiento y definición de reglas reales con el usuario
- [x] Documento consolidado de reglas (`REGLAS_DEL_SISTEMA.md`)
- [x] Diagnóstico del estado actual del proyecto

---

## Fase 1: Fundación de Datos y Autenticación (Próxima)

**Objetivo:** Tener una base de datos sólida que refleje las reglas actuales + sistema de autenticación básico.

### Tareas principales:

1. **Actualizar Esquema de Base de Datos**
   - Crear tabla `proyectos`
   - Mejorar tabla `tickets` (agregar `proyecto_id`, ajustar estados según flujo real)
   - Crear tabla de historial de dueños (`ticket_duenos_historial`)
   - Ajustar/Mejorar tabla `comentarios` para funcionar como log mezclado
   - Revisar y actualizar enums de estados según flujo real (FALTA INFO, EN VERIFICACION, OK FINALIZADO, etc.)
   - Actualizar RLS policies según las reglas de visibilidad definidas

2. **Sistema de Usuarios y Autenticación**
   - Flujo de registro / invitación de usuarios (por JEFEING)
   - Pantalla de gestión de usuarios (solo JEFEING)
   - Middleware y protección de rutas según rol

3. **Seed de datos inicial**
   - Crear usuarios de prueba con todos los roles
   - Crear algunos proyectos de ejemplo
   - Crear tickets de prueba con diferentes estados

**Entregable esperado:**  
Base de datos funcional + poder loguearse con diferentes roles y ver que la visibilidad respeta las reglas.

---

## Fase 2: Creación y Gestión Básica de Tickets

**Objetivo:** Poder crear tickets y que el JEFEING pueda asignarlos.

### Tareas:

- Formulario de creación de ticket (para SOLICITANTE y SOLICITANTE+)
- Pantalla de "Mis Solicitudes" con datos reales
- Pantalla de "Mis Tareas" para dueños
- Vista de "Pendientes de Asignar" (solo JEFEING)
- Pantalla para que JEFEING asigne Dueño + Proyecto + Fecha Target
- Implementación básica de Log/Comentarios en el detalle del ticket

---

## Fase 3: Flujo de Cierre y Aceptación

**Objetivo:** Implementar el flujo bidireccional de OK FINALIZADO.

### Tareas:

- Lógica de cierre en dos pasos (Dueño → Solicitante)
- Notificaciones (inicialmente por email simple)
- Actualización de estados y visibilidad según reglas
- Evaluación con estrellas (opcional)

---

## Fase 4: Vistas Avanzadas y Proyectos

- Administración de Proyectos (solo JEFEING)
- Vista de Calendario / Cronograma (barras de duración)
- Filtros y búsqueda avanzada
- Dashboard con datos reales y KPIs

---

## Fase 5: Pulido y Producción

- Notificaciones más robustas
- Adjuntos de archivos
- Mejoras de UX/UI
- Manejo de errores y validaciones
- Preparación para despliegue

---

## Orden Recomendado Actual (Mayo 2026)

1. **Fase 1** → Base de datos + Auth + Visibilidad por rol (crítico)
2. **Fase 2** → Creación de tickets + Asignación por JEFEING
3. **Fase 3** → Flujo de cierre
4. **Fase 4 y 5** → Después

---

**Nota:** Este plan puede ajustarse según feedback del usuario durante el desarrollo.