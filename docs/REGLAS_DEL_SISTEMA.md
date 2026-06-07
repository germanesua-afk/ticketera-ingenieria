# Reglas y Requisitos del Sistema de Ticketera
## Despliegue de Obras - Equipo de Ingeniería

**Fecha de última actualización:** 27 de mayo de 2026  
**Estado:** En definición

---

## 1. Objetivo del Sistema

Reemplazar la planilla actual de Google Sheets por un sistema profesional de gestión de tickets que permita:

- Mejor control de roles y responsabilidades.
- Trazabilidad completa de los pedidos.
- Visibilidad clara según el rol de cada persona.
- Escalabilidad para manejar miles de tickets.
- Una experiencia más ordenada y profesional.

---

## 2. Roles del Sistema

| Rol            | Descripción                                                                 | Puede crear tickets | Puede ser asignado como Dueño | Nivel de visibilidad          |
|----------------|-----------------------------------------------------------------------------|---------------------|-------------------------------|-------------------------------|
| **JEFEING**    | Jefe de Ingeniería. Máximo nivel de control.                                | Sí                  | Sí                            | Ve **todo** el sistema        |
| **ING**        | Ingeniero / Dueño. Ejecuta las tareas asignadas.                            | No                  | Sí                            | Solo sus tareas asignadas     |
| **SOLICITANTE**| Persona que genera pedidos y hace seguimiento.                              | Sí                  | No                            | Solo sus propias solicitudes  |
| **SOLICITANTE+**| Solicitante que además puede ejecutar tareas (puede ser asignado como Dueño). | Sí               | Sí                            | Sus solicitudes + sus tareas  |

**Nota importante:**  
El **JEFEING** puede hacer **todo** dentro del sistema.

---

## 3. Reglas de Visibilidad (Muy Importante)

| Rol             | Ve "Mis Solicitudes" | Ve "Mis Tareas" (como Dueño) | Ve todos los tickets | Puede ver Proyectos |
|-----------------|----------------------|------------------------------|----------------------|---------------------|
| **JEFEING**     | Sí                   | Sí                           | Sí                   | Sí                  |
| **SOLICITANTE** | Solo las suyas       | No                           | No                   | No                  |
| **SOLICITANTE+**| Sí                   | Sí                           | No                   | No                  |
| **ING**         | No                   | Solo las suyas               | No                   | No                  |

---

## 4. Creación de Tickets

- Los tickets son creados principalmente por **Solicitantes** y **Solicitantes+** a través de un **formulario simple**.
- El JEFEING también puede crear tickets directamente.
- Al crearse un ticket, se genera automáticamente un **ID** que funciona como nombre del ticket (ejemplo: `GL-260527-003`).

---

## 5. Flujo de un Ticket

### 5.1 Asignación
- **Solo el JEFEING** puede asignar el **Dueño** de un ticket.
- El JEFEING también define:
  - La **Fecha Target ING**
  - El **Proyecto** al que pertenece el ticket

### 5.2 Ejecución y Estados
- El Dueño trabaja en la tarea y actualiza el estado según corresponda (FALTA INFO, EN VERIFICACION, OK FINALIZADO, etc.).
- Cuando el Dueño marca el estado como **OK FINALIZADO**:
  - El sistema **debe notificar** automáticamente al solicitante.
  - El ticket **no se considera cerrado** hasta que el solicitante confirme también con **OK FINALIZADO**.

### 5.3 Cierre del Ticket
- Es obligatorio que el **solicitante** acepte el cierre.
- El **JEFEING** puede intervenir y aceptar el cierre en nombre del solicitante si es necesario.
- Solo cuando **ambos** (Dueño y Solicitante/JEFEING) están en OK FINALIZADO, el ticket se considera cerrado.

### 5.4 Evaluación con Estrellas
- Una vez cerrado el ticket, se puede realizar una evaluación con estrellas (1 a 3).
- Esta evaluación es **opcional** (no obligatoria).
- Es visible para **todos los roles**.

---

## 6. Log / Historial por Ticket

- Cada ticket debe tener un **único hilo de log/chat** donde se mezclen:
  - Comentarios manuales de los participantes.
  - Cambios automáticos del sistema (cambio de estado, reasignaciones, etc.).

**Quién puede escribir comentarios:**
- El **solicitante original** del ticket.
- El **dueño actual**.
- El **JEFEING**.

**Reglas del historial:**
- Cuando se reasigna un dueño, debe quedar registrado en el log.
- Al reasignar, se **agrega** el nuevo dueño. **No se elimina** al dueño anterior (queda en el historial del ticket).

---

## 7. Proyectos

- Los proyectos representan obras o clientes grandes (ej: EDENOR, RAMON TUMA, Copaipa, etc.).
- Un ticket pertenece a **un solo proyecto**.
- Solo el **JEFEING** puede:
  - Ver la sección de Proyectos.
  - Crear, editar y eliminar proyectos.
  - Asignar o reasignar un ticket a un proyecto en cualquier momento.

---

## 8. Notificaciones

El sistema debe enviar notificaciones automáticas por mail en los siguientes casos (mínimo):

- Nueva tarea asignada a un Dueño.
- El Dueño marca un ticket como **FALTA INFO**.
- El Dueño marca un ticket como **OK FINALIZADO** (notificar al solicitante).
- Reasignación de dueño.
- Cambios importantes de fecha target.

---

## 9. Dashboard y Vistas

- Los **Solicitantes** deben tener una vista clara de **"Mis Solicitudes"**.
- Los **Dueños** deben tener una vista clara de **"Mis Tareas"**.
- El **JEFEING** debe tener una vista completa de todo el sistema.
- Debe existir una **vista de calendario / cronograma** (con barras de duración) como **vista alternativa** (no principal).

---

## 10. Reglas Adicionales

- El JEFEING puede **reasignar** un ticket a otro proyecto y **modificar la Fecha Target ING** en cualquier momento.
- El ID del ticket funciona como su nombre identificatorio.
- El sistema debe calcular días de trabajo y días de retraso para alimentar los semáforos visuales.

---

## 11. Pendientes de Definir (A futuro)

- Lista detallada de estados posibles de un ticket.
- Campos específicos que debe tener el formulario de creación.
- Comportamiento exacto de los semáforos (reglas de colores).
- Campos adicionales que se necesitan en los tickets (prioridad, tipo de trabajo, etc.).

---

**Documento generado a partir de las definiciones del usuario durante mayo 2026.**  
Se irá actualizando a medida que se definan más detalles.