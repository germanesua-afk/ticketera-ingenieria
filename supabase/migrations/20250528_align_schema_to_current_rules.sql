-- ============================================================================
-- MIGRACIÓN: Alineación del esquema a las reglas actuales (REGLAS_DEL_SISTEMA.md)
-- Fecha: 28 de mayo de 2026
-- Objetivo: Actualizar la estructura para que coincida con las premisas reales definidas
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE PROYECTOS
-- Solo el JEFEING puede administrar proyectos.
-- Un ticket pertenece a exactamente un proyecto.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proyectos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL UNIQUE,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.proyectos IS 'Proyectos / Obras / Clientes grandes. Solo JEFEING puede crear y administrar.';

-- Trigger para updated_at
CREATE TRIGGER trg_proyectos_updated_at
BEFORE UPDATE ON public.proyectos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 2. AGREGAR proyecto_id Y CAMPOS DE LA PLANILLA ACTUAL A TICKETS
-- ============================================================================

ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS proyecto_id uuid REFERENCES public.proyectos(id);

-- Campos que vienen del formulario del solicitante
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS fecha_target_original date;           -- "Fecha Target" del formulario
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS link_red_info text;                   -- Link de la red con info

-- Campos gestionados por JEFEING
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS prioridad public.ticket_prioridad NOT NULL DEFAULT 'MEDIA';

-- Campos gestionados por el Dueño
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS estado_dueno public.estado_dueno;
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS fecha_finalizacion date;              -- Fecha en que el dueño pone OK FINALIZADO
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS link_archivo_terminado text;
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS cantidad_documentos integer DEFAULT 0;

-- Campos gestionados por el PM / Solicitante
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS estado_pm public.estado_pm;

-- ============================================================================
-- EVALUACIONES (Calificaciones 1-5)
-- Existen dos evaluaciones independientes: una del JEFEING y otra del PM/Solicitante
-- ============================================================================

-- Evaluación del JEFEING
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS calificacion_jefe_tiempo smallint CHECK (calificacion_jefe_tiempo BETWEEN 1 AND 5);
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS calificacion_jefe_calidad smallint CHECK (calificacion_jefe_calidad BETWEEN 1 AND 5);
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS calificacion_jefe_presentacion smallint CHECK (calificacion_jefe_presentacion BETWEEN 1 AND 5);

-- Evaluación del PM / Solicitante
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS calificacion_pm_tiempo smallint CHECK (calificacion_pm_tiempo BETWEEN 1 AND 5);
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS calificacion_pm_calidad smallint CHECK (calificacion_pm_calidad BETWEEN 1 AND 5);
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS calificacion_pm_presentacion smallint CHECK (calificacion_pm_presentacion BETWEEN 1 AND 5);

COMMENT ON COLUMN public.tickets.proyecto_id IS 'Proyecto al que pertenece el ticket. Asignado y modificable solo por JEFEING.';
COMMENT ON COLUMN public.tickets.estado_dueno IS 'Estado que pone el Dueño (ING).';
COMMENT ON COLUMN public.tickets.estado_pm IS 'Estado que pone el Solicitante/PM para aceptar o pedir correcciones.';
COMMENT ON COLUMN public.tickets.calificacion_jefe_tiempo IS 'Calificación del JEFEING (1-5) - Tiempo';
COMMENT ON COLUMN public.tickets.calificacion_pm_tiempo IS 'Calificación del PM/Solicitante (1-5) - Tiempo';

-- ============================================================================
-- 3. HISTORIAL DE DUEÑOS (Soporte para múltiples dueños a lo largo del tiempo)
-- Según reglas: al reasignar, se agrega el nuevo dueño. El anterior NO se elimina.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_duenos_historial (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    dueno_id uuid NOT NULL REFERENCES public.usuarios(id),
    asignado_por uuid NOT NULL REFERENCES public.usuarios(id), -- Casi siempre JEFEING
    fecha_asignacion timestamptz NOT NULL DEFAULT now(),
    activo boolean NOT NULL DEFAULT true, -- true = es el dueño actual
    comentario text, -- Opcional: motivo de la asignación/reasignación
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ticket_duenos_historial IS 
'Historial completo de dueños asignados a cada ticket. Permite múltiples dueños a lo largo del tiempo.';

CREATE INDEX IF NOT EXISTS idx_ticket_duenos_historial_ticket 
ON public.ticket_duenos_historial(ticket_id, fecha_asignacion DESC);

-- ============================================================================
-- 4. ESTADOS REALES SEGÚN PLANILLA ACTUAL (Mayo 2026)
-- ============================================================================

-- Creamos enums separados porque los estados del Dueño y del PM tienen significados diferentes.

CREATE TYPE public.estado_dueno AS ENUM (
    'EN_STANDBY',
    'FALTA_INFO',
    'EN_PROCESO',
    'EN_VERIFICACION',
    'OK_FINALIZADO',
    'REVISAR'
);

CREATE TYPE public.estado_pm AS ENUM (
    'OK_FINALIZADO',
    'CORREGIR',
    'REVISAR'
);

COMMENT ON TYPE public.estado_dueno IS 'Estados que puede poner el Dueño (ING) según planilla actual.';
COMMENT ON TYPE public.estado_pm IS 'Estados que puede poner el Solicitante/PM según planilla actual.';

-- ============================================================================
-- 5. COMENTARIOS / LOG UNIFICADO (Chat)
-- Usaremos la tabla comentarios como un solo chat mezclado (comentarios manuales + eventos del sistema).
-- Según reglas actuales: solo pueden escribir el solicitante, el dueño actual y el JEFEING.
-- ============================================================================

ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS es_evento_sistema boolean NOT NULL DEFAULT false;

COMMENT ON TABLE public.comentarios IS 
'Log/Chat unificado del ticket. Contiene tanto comentarios escritos por personas como eventos automáticos del sistema.';

COMMENT ON COLUMN public.comentarios.es_evento_sistema IS 
'True = fue generado automáticamente por el sistema (ej: cambio de estado, reasignación de dueño, etc.). 
False = comentario escrito manualmente por un usuario.';

-- ============================================================================
-- 6. ACTUALIZACIÓN DE FUNCIÓN DE VISIBILIDAD (can_view_ticket)
-- Esta función es crítica. Debe reflejar exactamente las reglas actuales:
-- - Solicitante: solo ve sus propios tickets (como solicitante)
-- - Solicitante+: ve sus tickets + los que tiene como dueño actual
-- - ING: solo ve los tickets donde es dueño actual
-- - JEFEING / ADMIN: ven todo
-- ============================================================================

-- Primero eliminamos la función anterior para poder recrearla con la nueva lógica
DROP FUNCTION IF EXISTS public.can_view_ticket(uuid);

CREATE OR REPLACE FUNCTION public.can_view_ticket(p_ticket_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_solicitante_id uuid;
    v_current_dueno_id uuid;
    v_user_role public.user_role;
    v_user_id uuid := auth.uid();
BEGIN
    -- Obtener datos del ticket
    SELECT solicitante_id, dueno_id
    INTO v_solicitante_id, v_current_dueno_id
    FROM public.tickets
    WHERE id = p_ticket_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    v_user_role := public.get_current_user_role();

    -- JEFEING y ADMIN ven todo
    IF v_user_role IN ('JEFEING', 'ADMIN') THEN
        RETURN true;
    END IF;

    -- El solicitante original siempre puede ver su ticket
    IF v_solicitante_id = v_user_id THEN
        RETURN true;
    END IF;

    -- Si es el dueño actual del ticket
    IF v_current_dueno_id = v_user_id THEN
        RETURN true;
    END IF;

    -- SOLICITANTE+ puede ver tickets donde es el dueño actual (además de los suyos, que ya cubrimos arriba)
    IF v_user_role = 'SOLICITANTE+' AND v_current_dueno_id = v_user_id THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_view_ticket(uuid) TO authenticated;

COMMENT ON FUNCTION public.can_view_ticket(uuid) IS 
'Determina si el usuario actual puede ver un ticket según las reglas de visibilidad definidas en REGLAS_DEL_SISTEMA.md (Mayo 2026)';

-- ============================================================================
-- 7. ÍNDICES ADICIONALES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tickets_proyecto ON public.tickets(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_ticket_duenos_historial_dueno ON public.ticket_duenos_historial(dueno_id);
CREATE INDEX IF NOT EXISTS idx_ticket_duenos_historial_activo ON public.ticket_duenos_historial(ticket_id, activo);

-- ============================================================================
-- 8. FUNCIÓN HELPER PARA REGISTRAR EVENTOS EN EL CHAT (LOG AUTOMÁTICO)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.registrar_evento_ticket(
    p_ticket_id uuid,
    p_actor_id uuid,
    p_mensaje text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.comentarios (ticket_id, autor_id, contenido, es_evento_sistema)
    VALUES (p_ticket_id, p_actor_id, p_mensaje, true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_evento_ticket(uuid, uuid, text) TO authenticated;

-- ============================================================================
-- 9. TRIGGERS PARA GENERAR EVENTOS AUTOMÁTICOS EN EL CHAT
-- (Sin envío de mails - se pospone según indicación del usuario)
-- ============================================================================

-- Trigger: Cambio de estado del Dueño
CREATE OR REPLACE FUNCTION public.trg_ticket_estado_dueno_cambiado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_actor_id uuid;
BEGIN
    IF NEW.estado_dueno IS DISTINCT FROM OLD.estado_dueno THEN
        v_actor_id := COALESCE(NEW.dueno_id, auth.uid());
        
        PERFORM public.registrar_evento_ticket(
            NEW.id,
            v_actor_id,
            'Estado del Dueño cambiado a: ' || COALESCE(NEW.estado_dueno::text, 'sin estado')
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_after_estado_dueno_update
AFTER UPDATE OF estado_dueno ON public.tickets
FOR EACH ROW
WHEN (OLD.estado_dueno IS DISTINCT FROM NEW.estado_dueno)
EXECUTE FUNCTION public.trg_ticket_estado_dueno_cambiado();

-- Trigger: Cambio de estado del PM
CREATE OR REPLACE FUNCTION public.trg_ticket_estado_pm_cambiado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.estado_pm IS DISTINCT FROM OLD.estado_pm THEN
        PERFORM public.registrar_evento_ticket(
            NEW.id,
            auth.uid(),
            'Estado del PM cambiado a: ' || COALESCE(NEW.estado_pm::text, 'sin estado')
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_after_estado_pm_update
AFTER UPDATE OF estado_pm ON public.tickets
FOR EACH ROW
WHEN (OLD.estado_pm IS DISTINCT FROM NEW.estado_pm)
EXECUTE FUNCTION public.trg_ticket_estado_pm_cambiado();

-- Trigger: Cambio de Dueño
CREATE OR REPLACE FUNCTION public.trg_ticket_dueno_cambiado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.dueno_id IS DISTINCT FROM OLD.dueno_id THEN
        PERFORM public.registrar_evento_ticket(
            NEW.id,
            auth.uid(),
            'Dueño reasignado'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_after_dueno_update
AFTER UPDATE OF dueno_id ON public.tickets
FOR EACH ROW
WHEN (OLD.dueno_id IS DISTINCT FROM NEW.dueno_id)
EXECUTE FUNCTION public.trg_ticket_dueno_cambiado();

-- Trigger: Cambio de Proyecto
CREATE OR REPLACE FUNCTION public.trg_ticket_proyecto_cambiado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.proyecto_id IS DISTINCT FROM OLD.proyecto_id THEN
        PERFORM public.registrar_evento_ticket(
            NEW.id,
            auth.uid(),
            'Ticket reasignado a otro proyecto'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_after_proyecto_update
AFTER UPDATE OF proyecto_id ON public.tickets
FOR EACH ROW
WHEN (OLD.proyecto_id IS DISTINCT FROM NEW.proyecto_id)
EXECUTE FUNCTION public.trg_ticket_proyecto_cambiado();

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. Esta migración es aditiva. No borra datos existentes.
-- 2. La tabla ticket_duenos_historial está vacía al principio. 
--    En una migración posterior podemos poblarla con los dueños actuales de los tickets existentes.
-- 3. Las políticas RLS existentes siguen usando la función can_view_ticket, por lo que se actualizarán automáticamente.
-- 4. **ENVÍO DE MAILS POSPUESTO**: No se implementa ninguna lógica de notificaciones por email en esta migración.
-- 5. Se recomienda ejecutar esta migración primero en un proyecto de desarrollo / staging.
-- ============================================================================