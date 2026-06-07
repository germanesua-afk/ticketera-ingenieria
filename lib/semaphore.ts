import { TicketEstado } from '@/types/database'

export type SemaphoreColor = 'red' | 'orange' | 'yellow' | 'green' | 'gray' | 'white'

/**
 * Lógica de semáforo basada en la fórmula real del Google Sheet del usuario.
 *
 * Prioridades:
 * - Dueño en OK FINALIZADO → VERDE (siempre gana, independientemente del estado del PM)
 * - Sin datos clave → sin luz
 * - Estado Dueño = FALTA INFO → NARANJA
 * - Sin Fecha Target ING o sin Dueño asignado → AMARILLO (aún no está listo para trabajar)
 * - Fecha Target ING vencida Y Dueño no está en OK FINALIZADO / EN VERIFICACION → ROJO
 * - Cualquier otro caso → BLANCO / sin color fuerte
 */
export function calculateSemaphoreColor(
  estadoDueno: string,
  estadoPM: string,
  fechaTargetING: string | null | Date | undefined,
  dueno: string | undefined
): SemaphoreColor {
  // VERDE tiene prioridad absoluta: si el Dueño pone OK FINALIZADO, el semáforo queda verde
  // independientemente del estado del PM (el PM pasa automáticamente a REVISAR)
  if (estadoDueno === 'OK FINALIZADO') {
    return 'green'
  }

  // Normalizamos el estado del dueño para ser más robustos
  // (por si alguna vez viene con espacios en vez de guiones bajos)
  const ed = (estadoDueno || '').trim().toUpperCase().replace(/ /g, '_')

  // FALTA INFO → NARANJA (prioridad alta, siempre debe ganar si el dueño lo marcó así)
  if (ed === 'FALTA INFO') {
    return 'orange'
  }

  // Sin datos clave → sin luz
  if (!estadoDueno && !dueno && !fechaTargetING) {
    return 'white'
  }

  // Sin Fecha Target ING o sin Dueño → AMARILLO (aún no está listo para trabajar)
  if (!fechaTargetING || !dueno) {
    return 'yellow'
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  let fechaTarget: Date | null = null
  if (fechaTargetING) {
    fechaTarget = new Date(fechaTargetING)
    fechaTarget.setHours(0, 0, 0, 0)
  }

  const fechaVencida = fechaTarget && fechaTarget < hoy

  // ROJO: vencido y el Dueño no está en estados de "trabajo avanzado"
  if (fechaVencida && estadoDueno !== 'OK FINALIZADO' && estadoDueno !== 'EN VERIFICACION') {
    return 'red'
  }

  // Todo lo demás → sin color fuerte (blanco/gris claro)
  return 'white'
}

export function getSemaphoreLabel(color: SemaphoreColor): string {
  // Ya no mostramos texto, solo luz de color
  return ''
}

export function getSemaphoreClasses(color: SemaphoreColor): string {
  // Devolvemos clases vacías porque ahora usamos emoji en su lugar
  return ''
}

export function getSemaphoreIcon(color: SemaphoreColor): string {
  switch (color) {
    case 'red':
      return '🔴'
    case 'orange':
      return '🟠'
    case 'yellow':
      return '🟡'
    case 'green':
      return '🟢'
    case 'gray':
      return '⚪'
    case 'white':
    default:
      return '⚫'   // o '🔘' si preferís algo más neutro
  }
}
