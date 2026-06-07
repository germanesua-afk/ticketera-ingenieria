'use client'

import { useState } from 'react'
import { calculateSemaphoreColor, getSemaphoreIcon } from '@/lib/semaphore'

interface Ticket {
  id: string
  numero: string
  solicitante: string
  descripcion: string
  proyecto: string
  dueno: string
  estadoDueno: string
  estadoPM: string
  fechaTargetING?: string
  fechaFin?: string
  [key: string]: any
}

interface CalendarViewProps {
  tickets: any[]
  currentUserName: string
  currentRole: string
  onTicketClick: (ticket: any) => void
}

type CalendarMode = 'tareas' | 'solicitudes' | 'todas'

export function CalendarView({
  tickets,
  currentUserName,
  currentRole,
  onTicketClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)) // Junio 2025 — año del dataset de demostración (los tickets seed usan 2025)

  // Para JEFEING y JEFE, por defecto mostramos "Todas las Solicitudes"
  const initialMode: CalendarMode = ['JEFEING', 'JEFE'].includes(currentRole) ? 'todas' : 'tareas'
  const [mode, setMode] = useState<CalendarMode>(initialMode)

  // Determinar qué cronogramas puede ver el usuario
  const canSeeTareas = ['ING', 'SOLICITANTE+', 'JEFEING'].includes(currentRole)
  const canSeeSolicitudes = ['SOLICITANTE', 'SOLICITANTE+', 'JEFEING', 'JEFE'].includes(currentRole)

  // JEFEING y JEFE pueden ver también "Todas las Solicitudes"
  const canSeeTodas = ['JEFEING', 'JEFE'].includes(currentRole)

  const hasPersonalOptions = canSeeTareas || canSeeSolicitudes
  const hasGlobalOption = canSeeTodas

  // Mostrar el selector si tiene más de una opción disponible
  const showModeSelector = hasPersonalOptions || hasGlobalOption

  // Filtrar tickets según el modo seleccionado
  const getFilteredTickets = (): any[] => {
    if (mode === 'todas') {
      // Modo global: todas las solicitudes (solo para jefes)
      return tickets
    }

    if (mode === 'tareas' && canSeeTareas) {
      return tickets.filter(t => t.dueno === currentUserName)
    }

    if (mode === 'solicitudes' && canSeeSolicitudes) {
      return tickets.filter(t => t.solicitante === currentUserName)
    }

    // Fallback: si no hay modo válido, mostrar todo (para seguridad)
    return tickets
  }

  const filteredTickets = getFilteredTickets()

  const isSolicitudView = mode === 'solicitudes' || mode === 'todas'

  // ============================================
  // HELPERS NUEVOS
  // ============================================

  // Color estable por tarea (usado en vista "Mis Tareas")
  const getTaskColor = (ticket: any): string => {
    const key = ticket.numero || ticket.id || ''
    const palette = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
      '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#0ea5e9'
    ]
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash)
    }
    return palette[Math.abs(hash) % palette.length]
  }

  // Color por DUEÑO (usado en "Mis Solicitudes" y "Todas las Solicitudes")
  // Esto permite identificar rápidamente qué tickets pertenecen al mismo dueño
  const getOwnerColor = (dueno: string): string => {
    if (!dueno) return '#64748b' // gris para sin asignar
    const key = dueno.toUpperCase()
    const palette = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308',
      '#22c55e', '#14b8a6', '#6366f1', '#a855f7', '#ef4444'
    ]
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash)
    }
    return palette[Math.abs(hash) % palette.length]
  }

  // Calcular días hábiles entre dos fechas (excluye sábados y domingos)
  const calculateBusinessDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    let count = 0
    const current = new Date(start)

    while (current <= end) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) { // 0 = domingo, 6 = sábado
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  // Tickets con rango completo (usado por ambas vistas)
  const ticketsWithRange = filteredTickets.filter((t: any) => t.fechaAsignacion && t.fechaTargetING)
  const ticketsWithoutRange = filteredTickets.filter((t: any) => !t.fechaAsignacion || !t.fechaTargetING)

  // Generar estructura del mes
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Ajuste para que la semana empiece en Lunes (0 = Lunes ... 6 = Domingo)
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7 // 0 = Lunes
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  // Crear array de días del calendario (incluyendo celdas vacías del principio)
  const calendarDays: Array<{
    day: number | null
    dateStr: string | null
    tickets: Ticket[]
  }> = []

  // Celdas vacías antes del día 1
  for (let i = 0; i < startWeekday; i++) {
    calendarDays.push({ day: null, dateStr: null, tickets: [] })
  }

  // Helper: verifica si un día está dentro del rango de una tarea
  const isDateInRange = (dayStr: string, start?: string, end?: string): boolean => {
    if (!start || !end) return false
    return dayStr >= start && dayStr <= end
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    // Tickets cuyo rango de trabajo cubre este día
    const dayTickets = ticketsWithRange.filter((t: any) =>
      isDateInRange(dateStr, t.fechaAsignacion, t.fechaTargetING)
    )

    calendarDays.push({ day, dateStr, tickets: dayTickets })
  }

  // Navegación de meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const isToday = (dateStr: string | null) => {
    if (!dateStr) return false
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return dateStr === todayStr
  }

  return (
    <div className="space-y-4">
      {/* Selector de tipo de cronograma - ahora incluye "Todas las Solicitudes" para JEFEING/JEFE */}
      {showModeSelector && (
        <div className="flex flex-wrap gap-2">
          {canSeeTareas && (
            <button
              onClick={() => setMode('tareas')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                mode === 'tareas'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-blue-50 border-slate-300 text-slate-700'
              }`}
            >
              📅 Cronograma de Mis Tareas
            </button>
          )}

          {canSeeSolicitudes && (
            <button
              onClick={() => setMode('solicitudes')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                mode === 'solicitudes'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white hover:bg-purple-50 border-slate-300 text-slate-700'
              }`}
            >
              📅 Cronograma de Mis Solicitudes
            </button>
          )}

          {canSeeTodas && (
            <button
              onClick={() => setMode('todas')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                mode === 'todas'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-emerald-50 border-slate-300 text-slate-700'
              }`}
            >
              📅 Cronograma de Todas las Solicitudes
            </button>
          )}
        </div>
      )}

      <div className="text-xs text-slate-500 px-1">
        {isSolicitudView 
          ? 'Las barras están coloreadas por DUEÑO para identificar fácilmente qué tickets tiene cada persona.'
          : 'Cada tarea se muestra desde la fecha de asignación del dueño hasta la Fecha Target ING.'}
      </div>

      {/* ==================== CRONOGRAMA GANTT ==================== */}


      {/* ==================== CRONOGRAMA GANTT ==================== */}
        <div className="border rounded-lg bg-white overflow-hidden">
          <div className="p-3 border-b bg-slate-50">
            <div className="text-sm font-medium text-slate-700">
              {mode === 'todas' 
                ? 'Cronograma Gantt — Todas las Solicitudes (Global)' 
                : 'Cronograma Gantt — Rango global de tus tareas'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {mode === 'todas' 
                ? 'Vista completa de todas las solicitudes del sistema (solo JEFEING / JEFE).' 
                : 'El eje va desde la asignación más temprana hasta el Target más lejano de las tareas visibles.'}
            </div>
          </div>

          {/* Gantt Content */}
          <div className="p-4">
            {ticketsWithRange.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay tareas con rango de fechas completo.<br />
                <span className="text-xs">Asegúrate de que las tareas tengan Fecha de Asignación + Fecha Target ING.</span>
              </div>
            )}

            {ticketsWithRange.length > 0 && (() => {
              // Calcular rango global (min fechaAsignacion - max fechaTarget)
              const starts = ticketsWithRange.map((t: any) => t.fechaAsignacion).filter(Boolean)
              const ends = ticketsWithRange.map((t: any) => t.fechaTargetING).filter(Boolean)

              const globalStart = new Date(Math.min(...starts.map((d: string) => new Date(d).getTime())))
              const globalEnd = new Date(Math.max(...ends.map((d: string) => new Date(d).getTime())))

              // Normalizamos a medianoche para evitar problemas de timezone/horas
              globalStart.setHours(0, 0, 0, 0)
              globalEnd.setHours(0, 0, 0, 0)

              const totalDays = Math.ceil((globalEnd.getTime() - globalStart.getTime()) / (1000 * 3600 * 24)) + 1
              const denominator = Math.max(1, totalDays - 1)

              // Generar marcas de días para el encabezado (cada ~5-7 días para no saturar)
              // =============================================
              // Nuevo encabezado Gantt: Meses + Números de día
              // =============================================

              // 1. Generar segmentos de meses
              const monthSegments = []
              let current = new Date(globalStart)
              current.setDate(1) // empezar al 1 de cada mes

              while (current <= globalEnd) {
                const monthStart = new Date(current)
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

                // Recortar al rango global
                const visibleStart = monthStart < globalStart ? globalStart : monthStart
                const visibleEnd = monthEnd > globalEnd ? globalEnd : monthEnd

                const startOffset = Math.floor((visibleStart.getTime() - globalStart.getTime()) / (1000 * 3600 * 24))
                const endOffset = Math.floor((visibleEnd.getTime() - globalStart.getTime()) / (1000 * 3600 * 24))

                const left = (startOffset / denominator) * 100
                const width = ((endOffset - startOffset + 1) / denominator) * 100

                monthSegments.push({
                  name: current.toLocaleDateString('es-AR', { month: 'long' }),
                  left: Math.max(0, left),
                  width: Math.min(100 - left, width),
                })

                // Avanzar al siguiente mes
                current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
              }

              // 2. Generar números de día - TODOS los días del rango (sin muestreo)
              const dayLabels: any[] = []
              const weekdayMap = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // Domingo a Sábado

              for (let i = 0; i < totalDays; i++) {
                const d = new Date(globalStart)
                d.setDate(d.getDate() + i)
                let percent = (i / denominator) * 100

                // Forzamos bordes exactos
                if (i === 0) percent = 0
                if (i === totalDays - 1) percent = 100

                dayLabels.push({
                  percent: Math.min(100, Math.max(0, percent)),
                  day: d.getDate(),
                  weekday: weekdayMap[d.getDay()],
                })
              }

              return (
                <div className="space-y-1">
                  {/* Encabezado de tiempo limpio (sin rayitas ni guiones) */}
                  <div className="flex text-[10px] mb-0.5">
                    <div className="w-56 flex-shrink-0"></div>

                    <div className="flex-1 relative">
                      {/* Fila de MESES */}
                      <div className="flex h-5 mb-0.5 border-b border-slate-300">
                        {monthSegments.map((seg, idx) => (
                          <div
                            key={idx}
                            className="absolute text-center text-slate-700 font-medium capitalize"
                            style={{
                              left: `${seg.left}%`,
                              width: `${seg.width}%`,
                            }}
                          >
                            {seg.name}
                          </div>
                        ))}
                      </div>

                      {/* Fila de NÚMEROS DE DÍA + Letra del día (L M M J V S D) - todos los días (alineados a la izquierda) */}
                      {(() => {
                        const isDense = totalDays > 35
                        const containerHeight = isDense ? 'h-8' : 'h-7'
                        const numberSize = isDense ? 'text-[7px]' : 'text-[8px]'
                        const letterSize = isDense ? 'text-[6.5px]' : 'text-[7.5px]'

                        return (
                          <div className={`relative ${containerHeight} text-slate-600 -mt-0.5`}>
                            {dayLabels.map((label, idx) => {
                              const isFirst = idx === 0
                              const isLast = idx === dayLabels.length - 1

                              let style: any = { left: `${label.percent}%` }

                              if (isFirst) {
                                style = { left: '0%' }
                              } else if (isLast) {
                                style = { right: '0%' }
                              }

                              return (
                                <div
                                  key={idx}
                                  className={`absolute leading-none ${isFirst ? 'text-left' : isLast ? 'text-right' : 'text-left'}`}
                                  style={style}
                                >
                                  <div className={`font-semibold text-slate-700 ${numberSize}`}>{label.day}</div>
                                  <div className={`${letterSize} mt-px ${['S','D'].includes(label.weekday) ? 'text-orange-500 font-medium' : 'text-slate-500'}`}>
                                    {label.weekday}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {ticketsWithRange.map((ticket: any) => {
                    const taskColor = isSolicitudView 
                      ? getOwnerColor(ticket.dueno) 
                      : getTaskColor(ticket)

                    const startDate = new Date(ticket.fechaAsignacion)
                    const endDate = new Date(ticket.fechaTargetING)

                    // Calcular posición y ancho relativo al rango global
                    // Usamos (totalDays - 1) para que las barras se alineen correctamente con las etiquetas del encabezado
                    const offsetDays = Math.floor((startDate.getTime() - globalStart.getTime()) / (1000 * 3600 * 24))
                    const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1

                    const leftPercent = Math.max(0, (offsetDays / denominator) * 100)
                    const widthPercent = Math.max(1, ((durationDays - 1) / denominator) * 100)

                    const businessDays = calculateBusinessDays(ticket.fechaAsignacion, ticket.fechaTargetING)

                    return (
                      <div key={ticket.id} className="flex items-center gap-3 group">
                        {/* Columna izquierda con info de la tarea */}
                        <div
                          onClick={() => onTicketClick(ticket)}
                          className="w-52 flex-shrink-0 cursor-pointer hover:bg-slate-50 p-2 rounded border text-sm"
                        >
                          <div className="flex items-center gap-1.5 font-medium">
                            {isSolicitudView && (
                              <span 
                                className="inline-block w-3 h-3 rounded-sm flex-shrink-0" 
                                style={{ backgroundColor: taskColor }}
                              />
                            )}
                            <span>{ticket.numero}</span>
                          </div>
                          <div className="text-xs text-slate-600 truncate mt-0.5">
                            {ticket.proyecto || ticket.descripcion.slice(0, 40)}
                          </div>

                          {/* Dueño - muy importante en vistas de solicitudes */}
                          <div className={`text-[10px] mt-0.5 font-medium ${isSolicitudView ? 'text-slate-800' : 'text-slate-600'}`}>
                            Dueño: {ticket.dueno || 'Sin asignar'}
                          </div>

                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Solicitante: {ticket.solicitante}
                          </div>
                        </div>

                        {/* Área del timeline + Barra */}
                        <div className="flex-1 relative h-9 bg-slate-100 rounded border border-t-0 overflow-hidden">
                          {/* Líneas guía verticales sutiles (para ayudar a alinear encabezado con barras) */}
                          <div className="absolute inset-0 pointer-events-none">
                            {dayLabels.map((label, idx) => (
                              <div
                                key={idx}
                                className="absolute top-0 bottom-0 w-px bg-slate-300/30"
                                style={{ left: `${label.percent}%` }}
                              />
                            ))}
                          </div>

                          {/* Barra de la tarea */}
                          <div
                            onClick={() => onTicketClick(ticket)}
                            className="absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer flex items-center justify-center text-white text-[10px] font-medium shadow-sm hover:brightness-95 z-10"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              backgroundColor: taskColor,
                            }}
                            title={`${ticket.numero} | Dueño: ${ticket.dueno || 'Sin asignar'} | ${ticket.fechaAsignacion} → ${ticket.fechaTargetING} | ${businessDays} días hábiles`}
                          >
                            {/* Solo mostramos días hábiles, sin número de ticket */}
                            <span className="px-1 drop-shadow-sm">
                              {businessDays} días hábiles
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>


      {/* Tickets sin rango completo - visible en ambas vistas */}
      {ticketsWithoutRange.length > 0 && (
        <div className="rounded-lg border p-4 bg-amber-50">
          <div className="text-sm font-medium text-amber-800 mb-2">
            ⚠️ Tickets sin rango de fechas completo ({ticketsWithoutRange.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {ticketsWithoutRange.map((ticket: any) => {
              const color = calculateSemaphoreColor(
                ticket.estadoDueno,
                ticket.estadoPM,
                ticket.fechaTargetING,
                ticket.dueno
              )
              const icon = getSemaphoreIcon(color)

              const missing = !ticket.fechaAsignacion 
                ? "Falta fecha de asignación del dueño" 
                : "Falta Fecha Target ING"

              return (
                <button
                  key={ticket.id}
                  onClick={() => onTicketClick(ticket)}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-white hover:bg-white/80 transition-colors"
                  title={missing}
                >
                  <span>{icon}</span>
                  <span className="font-medium">{ticket.numero}</span>
                  <span className="text-muted-foreground">— {missing}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-amber-700 mt-2">
            Estos tickets solo aparecerán en el Cronograma cuando el JEFEING les asigne Dueño + Fecha Target.
          </p>
        </div>
      )}

      {filteredTickets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-white">
          No tenés {mode === 'tareas' ? 'tareas' : 'solicitudes'} en este período.
        </div>
      )}
    </div>
  )
}
