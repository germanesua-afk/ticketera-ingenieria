'use client'

import { Badge } from '@/components/ui/badge'
import { calculateSemaphoreColor, getSemaphoreIcon, getSemaphoreLabel } from '@/lib/semaphore'
import { TicketEstado } from '@/types/database'

interface Ticket {
  id: string
  numero: string
  solicitante: string
  descripcion: string
  proyecto: string
  dueno: string
  estadoDueno: string
  estadoPM: string
  prioridad: string
  fechaGeneracion: string
  fechaTargetSolicitante?: string
  fechaTargetING?: string
  fechaAsignacion?: string
  fechaFinalizacion?: string
}

interface TicketTableProps {
  view: string
  tickets: Ticket[]
  currentUserId: string
  currentUserRole: string
  currentUserName: string
  onAssign?: (ticket: any) => void
  onView?: (ticket: any) => void
  onDelete?: (ticket: any) => void
  onQuickChangeEstadoDueno?: (ticketId: string, nuevoEstado: string) => void
  onQuickChangeEstadoPM?: (ticketId: string, nuevoEstado: string) => void
}

export function TicketTable({ 
  view, 
  tickets, 
  currentUserId, 
  currentUserRole, 
  currentUserName,
  onAssign, 
  onView, 
  onDelete,
  onQuickChangeEstadoDueno,
  onQuickChangeEstadoPM
}: TicketTableProps) {
  return (
    <div className="rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">N°</th>
            <th className="p-3 text-left font-medium">Solicitante</th>
            <th className="p-3 text-left font-medium">Descripción</th>
            <th className="p-3 text-left font-medium">Proyecto</th>
            <th className="p-3 text-left font-medium">Fecha Target Solicitante</th>
            <th className="p-3 text-left font-medium">Fecha Target ING</th>
            <th className="p-3 text-left font-medium">Dueño</th>
            <th className="p-3 text-left font-medium">Estado Dueño</th>
            <th className="p-3 text-left font-medium">Estado PM</th>
            <th className="p-3 text-center font-medium">Semáforo</th>
            <th className="p-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            // Lógica de semáforo según la fórmula real del Google Sheet del usuario
            const color = calculateSemaphoreColor(
              ticket.estadoDueno,
              ticket.estadoPM,
              ticket.fechaTargetING,
              ticket.dueno
            )
            return (
              <tr key={ticket.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-mono text-xs text-muted-foreground">{ticket.numero}</td>
                <td className="p-3">{ticket.solicitante}</td>
                <td className="p-3 font-medium max-w-xs whitespace-pre-line" title={ticket.descripcion}>
                  {ticket.descripcion}
                </td>
                <td className="p-3">{ticket.proyecto}</td>
                <td className="p-3 text-muted-foreground">
                  {ticket.fechaTargetSolicitante || '—'}
                </td>
                <td className="p-3 text-muted-foreground">
                  {ticket.fechaTargetING || '—'}
                </td>
                <td className="p-3">{ticket.dueno || '— Sin asignar —'}</td>
                <td className="p-3">
                  {/* Si el usuario puede editar → solo mostramos el dropdown (el valor actual ya se ve dentro del select) */}
                  {(onQuickChangeEstadoDueno && (ticket.dueno === currentUserName || currentUserRole === 'JEFEING')) ? (
                    <select
                      className="text-xs border rounded px-1.5 py-0.5 bg-white min-w-[90px]"
                      value={ticket.estadoDueno}
                      onChange={(e) => onQuickChangeEstadoDueno(ticket.id, e.target.value)}
                    >
                      {/* Orden: ROJO → AMARILLO → VERDE (mostramos sin guiones bajos) */}
                      <option value="">—</option>
                      <option value="FALTA INFO">FALTA INFO</option>
                      <option value="EN STANDBY">EN STANDBY</option>
                      <option value="EN PROCESO">EN PROCESO</option>
                      <option value="REVISAR">REVISAR</option>
                      <option value="EN VERIFICACION">EN VERIFICACION</option>
                      <option value="OK FINALIZADO">OK FINALIZADO</option>
                    </select>
                  ) : (
                    <Badge variant="outline">{ticket.estadoDueno}</Badge>
                  )}
                </td>

                <td className="p-3">
                  {/* Si el usuario puede editar Estado PM → solo mostramos el dropdown */}
                  {(onQuickChangeEstadoPM && (ticket.solicitante === currentUserName || currentUserRole === 'JEFE' || currentUserRole === 'JEFEING')) ? (
                    <select
                      className="text-xs border rounded px-1.5 py-0.5 bg-white min-w-[90px]"
                      value={ticket.estadoPM || ''}
                      onChange={(e) => onQuickChangeEstadoPM(ticket.id, e.target.value)}
                    >
                      {/* Orden: ROJO → AMARILLO → VERDE */}
                      <option value="">Pendiente</option>
                      <option value="CORREGIR">CORREGIR</option>           {/* ROJO */}
                      <option value="REVISAR">REVISAR</option>             {/* AMARILLO */}
                      <option value="OK FINALIZADO">OK FINALIZADO</option> {/* VERDE */}
                    </select>
                  ) : (
                    <div>
                      {ticket.estadoPM ? (
                        <Badge variant="outline">{ticket.estadoPM}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-3 text-center text-lg leading-none">
                  {/* Icono de color del semáforo (más visible que un círculo) */}
                  <span title={getSemaphoreLabel(color) || color}>
                    {getSemaphoreIcon(color)}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button 
                    className="text-primary hover:text-primary/80"
                    onClick={() => onView ? onView(ticket) : alert('Detalle del ticket (próximamente)')}
                  >
                    Ver
                  </button>
                  {onAssign && (
                    <button
                      onClick={() => onAssign(ticket)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {ticket.dueno ? 'Reasignar' : 'Asignar'}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(ticket)}
                      className="text-red-600 hover:text-red-700 font-medium"
                      title="Eliminar ticket"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="p-4 text-center text-xs text-muted-foreground border-t">
        Versión limpia inicial basada en tu planilla. Podemos ajustar columnas por vista (Mis Solicitudes / Mis Tareas / Pendientes) después.
      </div>
    </div>
  )
}
