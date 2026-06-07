'use client'

import { UserWithRole } from '@/lib/auth'

interface DashboardNavProps {
  user: UserWithRole | null
  activeView: string
  onViewChange: (view: string) => void
  onNewTicket: () => void
}

type NavButton = {
  id: string
  label: string
  visibleFor: string[]
}

const navButtons: NavButton[] = [
  {
    id: 'nueva-solicitud',
    label: '+ NUEVA SOLICITUD',
    visibleFor: ['SOLICITANTE', 'SOLICITANTE+', 'JEFEING', 'JEFE'],
  },
  {
    id: 'mis-solicitudes',
    label: 'MIS SOLICITUDES',
    visibleFor: ['SOLICITANTE', 'SOLICITANTE+', 'JEFEING', 'JEFE'],
  },
  {
    id: 'todas-las-solicitudes',
    label: 'TODAS LAS SOLICITUDES',
    visibleFor: ['JEFEING', 'JEFE'],
  },
  {
    id: 'mis-tareas',
    label: 'MIS TAREAS',
    visibleFor: ['ING', 'SOLICITANTE+', 'JEFEING'],
  },
  {
    id: 'pendientes-asignar',
    label: 'PENDIENTES DE ASIGNAR',
    visibleFor: ['JEFEING'],
  },
  {
    id: 'cronograma',
    label: 'CRONOGRAMA',
    visibleFor: ['SOLICITANTE', 'SOLICITANTE+', 'ING', 'JEFEING', 'JEFE'],
  },
]

export function DashboardNav({
  user,
  activeView,
  onViewChange,
  onNewTicket,
}: DashboardNavProps) {
  if (!user) return null;

  const visibleButtons = navButtons.filter((button) =>
    button.visibleFor.includes(user.rol)
  );

  return (
    <div className="flex flex-wrap gap-2 border-b pb-4">
      {visibleButtons.map((button) => {
        const isActive = activeView === button.id;

        if (button.id === 'nueva-solicitud') {
          return (
            <button
              key={button.id}
              onClick={onNewTicket}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 shadow-sm flex items-center gap-1"
            >
              {button.label}
            </button>
          );
        }

        return (
          <button
            key={button.id}
            onClick={() => onViewChange(button.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all border ${
              isActive
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {button.label}
          </button>
        );
      })}
    </div>
  )
}
