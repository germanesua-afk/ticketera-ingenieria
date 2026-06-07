'use client'

import { useState, useEffect } from 'react'
import { TicketTable } from './TicketTable'
import { DashboardNav } from './DashboardNav'
import { CalendarView } from './CalendarView'
import { UserWithRole } from '@/lib/auth'
import { calculateSemaphoreColor, getSemaphoreIcon } from '@/lib/semaphore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Tipo temporal para tickets en memoria
type Ticket = {
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
  linkRedInfo?: string
  linkArchivoTerminado?: string
  historial: Array<{
    fecha: string
    autor: string
    mensaje: string
  }>
}

const initialTickets: Ticket[] = [
  {
    id: '1',
    numero: 'TK-2025-00042',
    solicitante: 'Gastón Ledo',
    descripcion: 'EDENOR MUÑIZ - VER MAIL PARA MÁS DETALLE',
    proyecto: 'EDENOR',
    dueno: 'ELIANA LOPEZ',
    estadoDueno: 'OK FINALIZADO',
    estadoPM: 'OK FINALIZADO',
    prioridad: 'ALTA',
    fechaGeneracion: '2025-05-27',
    fechaTargetSolicitante: '2025-06-15',
    fechaTargetING: '2025-06-10',
    fechaAsignacion: '2025-05-27',
    fechaFinalizacion: '2025-05-30',
    linkRedInfo: 'M:\\Telecomunicaciones\\INGENIERÍA\\EDENOR\\01 - MANTENIMIENTO\\45 - SE Muñiz',
    linkArchivoTerminado: 'M:\\Telecomunicaciones\\INGENIERÍA\\EDENOR\\01 - MANTENIMIENTO\\45 - SE Muñiz\\FINAL\\TK-2025-00042_ENTREGA.zip',
    historial: [
      { fecha: '2025-05-27 10:53', autor: 'Gastón Ledo', mensaje: 'Ticket creado' },
      { fecha: '2025-05-27 14:20', autor: 'German Suárez (JEFEING)', mensaje: 'Asignado a Eliana Lopez - Target: 2025-06-10' },
      { fecha: '2025-05-30 09:15', autor: 'Eliana Lopez', mensaje: 'Estado Dueño cambiado a: OK FINALIZADO' },
      { fecha: '2025-05-30 11:40', autor: 'Gastón Ledo', mensaje: 'Estado PM cambiado a: OK FINALIZADO' },
    ],
  },
  {
    id: '2',
    numero: 'TK-2025-00043',
    solicitante: 'Hernán Justiniano',
    descripcion: 'LAYOUT IMPLANTACIÓN ESTRUCTURAS SALADILLO',
    proyecto: 'CES Saladillo',
    dueno: '',
    estadoDueno: 'EN STANDBY',
    estadoPM: '',
    prioridad: 'MEDIA',
    fechaGeneracion: '2025-05-27',
    linkRedInfo: '\\\\SABIN\\Labo\\Ingenieria\\LICITACIONES Y PROYECTOS\\[M.18.0011] CES SALADILLO',
    linkArchivoTerminado: '',
    historial: [
      { fecha: '2025-05-27 11:48', autor: 'Hernán Justiniano', mensaje: 'Ticket creado' },
    ],
  },
  {
    id: '3',
    numero: 'TK-2025-00044',
    solicitante: 'Gastón Ledo',
    descripcion: 'REVISIÓN DE ESTRUCTURA - RAMON TUMA',
    proyecto: 'Ramon Tuma',
    dueno: 'ELIANA LOPEZ',
    estadoDueno: 'EN PROCESO',
    estadoPM: 'REVISAR',
    prioridad: 'ALTA',
    fechaGeneracion: '2025-05-28',
    fechaTargetSolicitante: '2025-06-20',
    fechaTargetING: '2025-06-18',
    fechaAsignacion: '2025-05-28',
    linkRedInfo: '',
    linkArchivoTerminado: '',
    historial: [
      { fecha: '2025-05-28 09:10', autor: 'Gastón Ledo', mensaje: 'Ticket creado' },
      { fecha: '2025-05-28 11:30', autor: 'German Suárez (JEFEING)', mensaje: 'Asignado a Eliana Lopez - Target: 2025-06-18' },
    ],
  },
  {
    id: '4',
    numero: 'TK-2025-00045',
    solicitante: 'Valeria Pitt',
    descripcion: 'ADECUACIÓN LAYOUT - SE MUÑIZ FASE 2',
    proyecto: 'EDENOR',
    dueno: 'ANDREA BELMAR',
    estadoDueno: 'EN VERIFICACION',
    estadoPM: '',
    prioridad: 'MEDIA',
    fechaGeneracion: '2025-05-29',
    fechaTargetSolicitante: '2025-06-25',
    fechaTargetING: '2025-06-12',
    fechaAsignacion: '2025-05-29',
    linkRedInfo: '',
    linkArchivoTerminado: '',
    historial: [
      { fecha: '2025-05-29 14:00', autor: 'Valeria Pitt', mensaje: 'Ticket creado' },
      { fecha: '2025-05-29 16:45', autor: 'German Suárez (JEFEING)', mensaje: 'Asignado a Andrea Belmar - Target: 2025-06-12' },
    ],
  },
]

const teamUsers = [
  { id: 'u1', nombre: 'HERNAN JUSTINIANO', iniciales: 'HJ', email: 'german.esua2@gmail.com', rol: 'SOLICITANTE' },
  { id: 'u2', nombre: 'GASTON LEDO', iniciales: 'GL', email: 'gl@gmail.com', rol: 'SOLICITANTE' },
  { id: 'u3', nombre: 'GASTON GROUMAN', iniciales: 'GG', email: 'gg@gmail.com', rol: 'JEFE' },
  { id: 'u4', nombre: 'JONATHAN LEDO', iniciales: 'JL', email: 'jl@gmail.com', rol: 'SOLICITANTE' },
  { id: 'u5', nombre: 'VALERIA PITT', iniciales: 'VP', email: 'vp@gmail.com', rol: 'SOLICITANTE+' },
  { id: 'u6', nombre: 'FERNANDO BOUZON', iniciales: 'FB', email: 'fb@gmail.com', rol: 'JEFE' },
  { id: 'u7', nombre: 'GERMAN SUAREZ', iniciales: 'GS', email: 'german.esua@gmail.com', rol: 'JEFEING' },
  { id: 'u8', nombre: 'ELIANA LOPEZ', iniciales: 'EL', email: 'el@gmail.com', rol: 'ING' },
  { id: 'u9', nombre: 'FEDERICO ACEVEDO', iniciales: 'FA', email: 'fa@gmail.com', rol: 'ING' },
  { id: 'u10', nombre: 'RAUL LEZCANO', iniciales: 'RL', email: 'rl@gmail.com', rol: 'ING' },
  { id: 'u11', nombre: 'ANDREA BELMAR', iniciales: 'AB', email: 'andrebelmar97@gmail.com', rol: 'ING' },
  { id: 'u12', nombre: 'DYLAN GONZALEZ', iniciales: 'DG', email: 'dg@gmail.com', rol: 'ING' },
  { id: 'u13', nombre: 'LUIS CHIAPPA', iniciales: 'LC', email: 'lc@gmail.com', rol: 'ING' },
  { id: 'u14', nombre: 'FERNANDO DIAZ', iniciales: 'FD', email: 'fd@gmail.com', rol: 'ING' },
  { id: 'u15', nombre: 'MARTIN LEMA', iniciales: 'ML', email: 'ml@gmail.com', rol: 'ING' },
  { id: 'u16', nombre: 'EMILIO ECHEVERRI', iniciales: 'EE', email: 'ee@gmail.com', rol: 'ING' },
  { id: 'u17', nombre: 'JAVIER GONZALEZ', iniciales: 'JG', email: 'jg@gmail.com', rol: 'ING' },
]

const fakeDueños = teamUsers.filter(u => ['ING', 'SOLICITANTE+'].includes(u.rol))
const fakeProyectos = ['EDENOR', 'CES Saladillo', 'Ramon Tuma', 'Copaipa', 'Servimar']

const availableRoles = ['JEFEING', 'ING', 'SOLICITANTE', 'SOLICITANTE+'] as const

interface TicketDashboardProps {
  user: UserWithRole | null
}

export function TicketDashboard({ user: initialUser }: TicketDashboardProps) {
  // Persistencia en localStorage para que los tickets NO se borren en cada cambio de código / refresh
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ticketera_demo_tickets_v1')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        } catch {}
      }
    }
    return initialTickets
  })

  // Guardar automáticamente cada vez que cambian los tickets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ticketera_demo_tickets_v1', JSON.stringify(tickets))
    }
  }, [tickets])

  const [activeView, setActiveView] = useState('mis-tareas')
  const [currentSection, setCurrentSection] = useState<'home' | 'dashboard' | 'proyectos' | 'equipo'>('home')
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)

  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [ticketToAssign, setTicketToAssign] = useState<Ticket | null>(null)
  const [selectedDueno, setSelectedDueno] = useState('')
  const [selectedProyecto, setSelectedProyecto] = useState('')
  const [selectedFechaTarget, setSelectedFechaTarget] = useState('')

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [commentText, setCommentText] = useState('')

  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)



  const handleNewTicket = () => setIsNewTicketOpen(true)

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Generación de ID: Iniciales-YYMMDD-0000 (secuencial por solicitante + día)
    const cleanName = currentUserName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/\s+/g, ' ')
      .trim()

    const initials = cleanName
      .split(' ')
      .map(w => w[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 3)

    // Fecha local en formato YYMMDD (evita problemas de zona horaria con toISOString)
    const now = new Date()
    const year = String(now.getFullYear()).slice(2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const datePart = `${year}${month}${day}`

    // Número secuencial por (solicitante + día) → 0001, 0002, 0003...
    // Esto garantiza que cada persona tenga su propia numeración por fecha
    const todayForFilter = `${now.getFullYear()}-${month}-${day}`;

    const sameDaySamePerson = tickets.filter(t =>
      t.solicitante === currentUserName &&
      t.fechaGeneracion?.startsWith(todayForFilter)
    );

    const sequence = String(sameDaySamePerson.length + 1).padStart(4, '0')

    const newTicket: Ticket = {
      id: Date.now().toString(),
      numero: `${initials}-${datePart}-${sequence}`,
      solicitante: currentUserName,
      descripcion: formData.get('descripcion') as string,
      proyecto: '',
      dueno: '',
      estadoDueno: '',
      estadoPM: '',
      prioridad: 'MEDIA',
      fechaGeneracion: todayForFilter,  // usamos la misma fecha local consistente del ID
      fechaTargetSolicitante: formData.get('fechaTargetSolicitante') as string || undefined,
      linkRedInfo: formData.get('linkRedInfo') as string || '',
      linkArchivoTerminado: '',
      historial: [{ fecha: new Date().toLocaleString('es-AR', { hour12: false }).replace(',', ''), autor: currentUserName, mensaje: 'Ticket creado' }],
    }

    setTickets(prev => [newTicket, ...prev])
    setIsNewTicketOpen(false)
    setActiveView('mis-solicitudes')
  }

  const openAssignModal = (ticket: Ticket) => {
    setTicketToAssign(ticket)
    setSelectedDueno(ticket.dueno || '')
    setSelectedProyecto(ticket.proyecto || '')
    // Por defecto usamos la fecha de hoy (lo que el usuario seleccione en el picker es lo que queda)
    const today = new Date().toISOString().split('T')[0];
    setSelectedFechaTarget(ticket.fechaTargetING || today)
    setIsAssignOpen(true)
  }

  const handleAssign = () => {
    if (!ticketToAssign || !selectedDueno) return

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketToAssign.id
          ? {
              ...t,
              dueno: selectedDueno,
              proyecto: selectedProyecto,
              fechaTargetING: selectedFechaTarget,
              fechaAsignacion: new Date().toISOString().split('T')[0],
              // No tocamos estadoDueno ni estadoPM aquí → quedan en blanco por defecto
            }
          : t
      )
    )
    setIsAssignOpen(false)
    setTicketToAssign(null)
  }

  const cambiarEstadoDueno = (ticketId: string, nuevoEstado: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t
        const nuevoHistorial = [...t.historial, { fecha: new Date().toLocaleString('es-AR', { hour12: false }).replace(',', ''), autor: currentUserName, mensaje: `Estado Dueño cambiado a: ${nuevoEstado}` }]

        // Cuando el Dueño pone OK FINALIZADO, el PM pasa automáticamente a REVISAR
        const nuevoEstadoPM = nuevoEstado === 'OK FINALIZADO' ? 'REVISAR' : t.estadoPM

        return {
          ...t,
          estadoDueno: nuevoEstado,
          estadoPM: nuevoEstadoPM,
          fechaFinalizacion: nuevoEstado === 'OK FINALIZADO' ? new Date().toISOString().split('T')[0] : t.fechaFinalizacion,
          historial: nuevoHistorial
        }
      })
    )
    if (selectedTicket && selectedTicket.id === ticketId) {
      const nuevoEstadoPM = nuevoEstado === 'OK FINALIZADO' ? 'REVISAR' : selectedTicket.estadoPM
      setSelectedTicket(prev => prev ? { 
        ...prev, 
        estadoDueno: nuevoEstado, 
        estadoPM: nuevoEstadoPM,
        fechaFinalizacion: nuevoEstado === 'OK FINALIZADO' ? new Date().toISOString().split('T')[0] : prev.fechaFinalizacion 
      } : null)
    }
  }

  const cambiarEstadoPM = (ticketId: string, nuevoEstado: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t
        const nuevoHistorial = [...t.historial, { fecha: new Date().toLocaleString('es-AR', { hour12: false }).replace(',', ''), autor: currentUserName, mensaje: `Estado PM cambiado a: ${nuevoEstado || 'Pendiente'}` }]
        return {
          ...t,
          estadoPM: nuevoEstado,
          fechaFinalizacion: nuevoEstado === 'CORREGIR' ? undefined : t.fechaFinalizacion,
          historial: nuevoHistorial
        }
      })
    )
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, estadoPM: nuevoEstado, fechaFinalizacion: nuevoEstado === 'CORREGIR' ? undefined : prev.fechaFinalizacion } : null)
    }
  }

  const agregarComentario = (ticketId: string, mensaje: string) => {
    setTickets(prev =>
      prev.map(t => t.id === ticketId ? { ...t, historial: [...t.historial, { fecha: new Date().toLocaleString('es-AR', { hour12: false }).replace(',', ''), autor: currentUserName, mensaje }] } : t)
    )
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, historial: [...prev.historial, { fecha: new Date().toLocaleString('es-AR', { hour12: false }).replace(',', ''), autor: currentUserName, mensaje }] } : null)
    }
  }

  const actualizarLinkTrabajoFinalizado = (ticketId: string, nuevoLink: string) => {
    setTickets(prev =>
      prev.map(t => t.id === ticketId ? { ...t, linkArchivoTerminado: nuevoLink } : t)
    )
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, linkArchivoTerminado: nuevoLink } : null)
    }
  }

  const requestDeleteTicket = (ticket: Ticket) => setTicketToDelete(ticket)
  const confirmDeleteTicket = () => {
    if (!ticketToDelete) return
    setTickets(prev => prev.filter(t => t.id !== ticketToDelete.id))
    setTicketToDelete(null)
  }
  const cancelDeleteTicket = () => setTicketToDelete(null)

  const openTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDetailOpen(true)
    setCommentText('')
  }

  // Resetear datos de demo (borra localStorage y vuelve a los iniciales)
  const resetDemoData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ticketera_demo_tickets_v1')
    }
    setTickets(initialTickets)
    // También limpiar el ticket seleccionado si estaba abierto
    setSelectedTicket(null)
    setIsDetailOpen(false)
  }

  const [currentSimulatedUser, setCurrentSimulatedUser] = useState(teamUsers.find(u => u.rol === 'JEFEING') || teamUsers[0])

  const currentUser = { id: currentSimulatedUser.id, nombre_completo: currentSimulatedUser.nombre, rol: currentSimulatedUser.rol }
  const currentUserName = currentSimulatedUser.nombre
  const currentRole = currentSimulatedUser.rol

  const redCount = tickets.filter(t => calculateSemaphoreColor(t.estadoDueno, t.estadoPM, t.fechaTargetING, t.dueno) === 'red').length
  const orangeCount = tickets.filter(t => calculateSemaphoreColor(t.estadoDueno, t.estadoPM, t.fechaTargetING, t.dueno) === 'orange').length
  const yellowCount = tickets.filter(t => calculateSemaphoreColor(t.estadoDueno, t.estadoPM, t.fechaTargetING, t.dueno) === 'yellow').length
  const greenCount = tickets.filter(t => calculateSemaphoreColor(t.estadoDueno, t.estadoPM, t.fechaTargetING, t.dueno) === 'green').length

  // Helpers para colores en el modal de detalle
  const getEstadoDueñoColor = (estado: string) => {
    switch (estado) {
      case 'FALTA INFO': return 'bg-red-100 text-red-700 border-red-300';
      case 'EN STANDBY': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'EN PROCESO': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'REVISAR': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'EN VERIFICACION': return 'bg-green-100 text-green-700 border-green-300';
      case 'OK FINALIZADO': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-white';
    }
  };

  const getEstadoPMColor = (estado: string) => {
    switch (estado) {
      case 'CORREGIR': return 'bg-red-100 text-red-700 border-red-300';
      case 'REVISAR': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'OK FINALIZADO': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-white';
    }
  };

  const getAuthorColor = (autor: string, ticket: Ticket) => {
    if (autor === ticket.dueno) return 'text-red-600 font-semibold';
    if (autor === ticket.solicitante) return 'text-blue-600 font-semibold';
    // Jefes
    const jefeRoles = ['JEFEING', 'JEFE'];
    const autorUser = teamUsers.find(u => u.nombre === autor);
    if (autorUser && jefeRoles.includes(autorUser.rol)) {
      return 'text-green-600 font-semibold';
    }
    return 'text-gray-700';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar colapsable */}
      <div className={`hidden lg:flex fixed left-0 top-0 h-screen bg-gray-200 border-r border-gray-300 z-50 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 border-b border-gray-300 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h2 className="font-semibold text-gray-800">Ticketera</h2>
              <p className="text-xs text-gray-600">Despliegue de Obras</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-300 rounded text-gray-600"
            title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setCurrentSection('home')} 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${currentSection === 'home' ? 'bg-gray-800 text-white' : 'hover:bg-gray-300 text-gray-700'}`}
            title="HOME"
          >
            <span className="text-lg">🏠</span>
            {!sidebarCollapsed && <span>HOME</span>}
          </button>
          <button 
            onClick={() => setCurrentSection('dashboard')} 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${currentSection === 'dashboard' ? 'bg-gray-800 text-white' : 'hover:bg-gray-300 text-gray-700'}`}
            title="DASHBOARD"
          >
            <span className="text-lg">📊</span>
            {!sidebarCollapsed && <span>DASHBOARD</span>}
          </button>
          <button 
            onClick={() => setCurrentSection('proyectos')} 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${currentSection === 'proyectos' ? 'bg-gray-800 text-white' : 'hover:bg-gray-300 text-gray-700'}`}
            title="PROYECTOS"
          >
            <span className="text-lg">📁</span>
            {!sidebarCollapsed && <span>PROYECTOS</span>}
          </button>
          <button 
            onClick={() => setCurrentSection('equipo')} 
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${currentSection === 'equipo' ? 'bg-gray-800 text-white' : 'hover:bg-gray-300 text-gray-700'}`}
            title="EQUIPO"
          >
            <span className="text-lg">👥</span>
            {!sidebarCollapsed && <span>EQUIPO</span>}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`flex-1 transition-all duration-300 px-4 py-6 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {currentSection === 'home' && (
          <>
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm mb-6">
              <span className="font-medium text-yellow-800">Usuario actual (temporal para pruebas):</span>
              <select value={currentSimulatedUser.id} onChange={(e) => { const selected = teamUsers.find(u => u.id === e.target.value); if (selected) setCurrentSimulatedUser(selected) }} className="border rounded px-2 py-1 min-w-[220px]">
                {teamUsers.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>)}
              </select>
              <span className="text-muted-foreground">→ Cambia de persona para probar las distintas vistas y permisos</span>
              <button
                onClick={resetDemoData}
                className="ml-auto px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded transition-colors"
                title="Borra todos los tickets modificados y vuelve a los datos iniciales de demostración"
              >
                Resetear datos demo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              <div className="rounded-lg border p-4 bg-white"><div className="text-sm text-muted-foreground">Total Activos</div><div className="text-3xl font-semibold mt-1">{tickets.length}</div></div>
              <div className="rounded-lg border p-4 bg-white"><div className="text-sm text-muted-foreground">Atrasados (Rojo)</div><div className="text-3xl font-semibold mt-1 text-red-600">{redCount}</div></div>
              <div className="rounded-lg border p-4 bg-white"><div className="text-sm text-muted-foreground">Falta Info (Naranja)</div><div className="text-3xl font-semibold mt-1 text-orange-600">{orangeCount}</div></div>
              <div className="rounded-lg border p-4 bg-white"><div className="text-sm text-muted-foreground">Falta Asignación (Amarillo)</div><div className="text-3xl font-semibold mt-1 text-yellow-600">{yellowCount}</div></div>
              <div className="rounded-lg border p-4 bg-white"><div className="text-sm text-muted-foreground">Tu Workload</div><div className="text-3xl font-semibold mt-1">{tickets.filter(t => t.dueno === currentUserName).length} tickets</div></div>
              <div className="rounded-lg border p-4 bg-white"><div className="text-sm text-muted-foreground">Finalizados (Verde)</div><div className="text-3xl font-semibold mt-1 text-green-600">{greenCount}</div></div>
            </div>

            <DashboardNav user={currentUser as any} activeView={activeView} onViewChange={setActiveView} onNewTicket={() => setIsNewTicketOpen(true)} />

            {activeView === 'cronograma' ? (
              <CalendarView 
                tickets={tickets} 
                currentUserName={currentUserName} 
                currentRole={currentRole} 
                onTicketClick={(t) => { setSelectedTicket(t); setIsDetailOpen(true) }}
              />
            ) : (
              <TicketTable
                view={activeView}
                tickets={tickets.filter(t => {
            if (activeView === 'mis-solicitudes') return t.solicitante === currentUserName
            if (activeView === 'mis-tareas') return t.dueno === currentUserName
            if (activeView === 'pendientes-asignar') return !t.dueno
            return true
          })}
                currentUserId={currentUser.id}
                currentUserRole={currentRole}
                currentUserName={currentUserName}
                onAssign={currentRole === 'JEFEING' ? openAssignModal : undefined}
                onView={(t) => { setSelectedTicket(t); setIsDetailOpen(true) }}
                onDelete={currentRole === 'JEFEING' ? setTicketToDelete : undefined}
                onQuickChangeEstadoDueno={(id, estado) => cambiarEstadoDueno(id, estado)}
                onQuickChangeEstadoPM={(id, estado) => cambiarEstadoPM(id, estado)}
              />
            )}

            {/* Modales */}
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Nueva Solicitud</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
                  <div><label className="text-sm font-medium">Descripción del Pedido</label><Textarea name="descripcion" required placeholder="Describí brevemente lo que necesitás..." className="mt-1" /></div>
                  <div><label className="text-sm font-medium">Tipo de Solicitud</label><select name="tipo" className="w-full mt-1 border rounded-md p-2 text-sm"><option value="CAO">CAO</option><option value="ING">ING</option><option value="ENVIO MATS">ENVIO MATS</option><option value="COMPRA MATS">COMPRA MATS</option><option value="OTROS">OTROS</option></select></div>
                  <div><label className="text-sm font-medium">Fecha Target (tu fecha deseada)</label><Input type="date" name="fechaTargetSolicitante" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" /></div>
                  <div><label className="text-sm font-medium">Link de la red con info (opcional)</label><Input name="linkRedInfo" placeholder="Pegá el link..." className="mt-1" /></div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsNewTicketOpen(false)}>Cancelar</Button>
                    <Button type="submit">Crear Solicitud</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Modal de Asignación / Reasignación */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                  <DialogTitle>Asignar Ticket - {ticketToAssign?.numero}</DialogTitle>
                </DialogHeader>

                {/* Resumen del ticket (pedido por el usuario) - visible siempre al asignar */}
                {ticketToAssign && (
                  <div className="bg-muted/60 border rounded-lg p-3 text-sm space-y-1.5 mb-1">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div><span className="text-muted-foreground">Solicitante:</span> <span className="font-medium">{ticketToAssign.solicitante}</span></div>
                      <div><span className="text-muted-foreground">Fecha solicitud:</span> {ticketToAssign.fechaGeneracion}</div>
                      <div className="col-span-2"><span className="text-muted-foreground">Fecha Target (solicitante):</span> {ticketToAssign.fechaTargetSolicitante || '—'}</div>
                    </div>
                    <div className="pt-1 border-t">
                      <div className="text-muted-foreground text-xs mb-0.5">Descripción del pedido:</div>
                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{ticketToAssign.descripcion}</p>
                    </div>
                    {ticketToAssign.linkRedInfo && (
                      <div className="text-[11px] pt-1 border-t font-mono break-all text-muted-foreground">
                        Link red: {ticketToAssign.linkRedInfo}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium">Dueño (ING / SOLICITANTE+)</label>
                    <select
                      value={selectedDueno}
                      onChange={(e) => setSelectedDueno(e.target.value)}
                      className="w-full mt-1 border rounded-md p-2 text-sm"
                    >
                      <option value="">-- Seleccionar Dueño --</option>
                      {fakeDueños.map(d => (
                        <option key={d.id} value={d.nombre}>{d.nombre} ({d.rol})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Proyecto</label>
                    <select
                      value={selectedProyecto}
                      onChange={(e) => setSelectedProyecto(e.target.value)}
                      className="w-full mt-1 border rounded-md p-2 text-sm"
                    >
                      <option value="">-- Seleccionar Proyecto --</option>
                      {fakeProyectos.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Fecha Target ING</label>
                    <Input
                      type="date"
                      value={selectedFechaTarget}
                      onChange={(e) => setSelectedFechaTarget(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAssign} disabled={!selectedDueno}>
                    Asignar Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={!!ticketToDelete} onOpenChange={() => setTicketToDelete(null)}>
              <DialogContent>
                <DialogHeader><DialogTitle>Eliminar Ticket</DialogTitle></DialogHeader>
                <div className="py-4">¿Estás seguro que querés eliminar el ticket <strong>{ticketToDelete?.numero}</strong>?</div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTicketToDelete(null)}>Cancelar</Button>
                  <Button variant="destructive" onClick={() => { setTickets(prev => prev.filter(t => t.id !== ticketToDelete?.id)); setTicketToDelete(null) }}>Sí, eliminar</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal de Detalle del Ticket */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {getSemaphoreIcon(calculateSemaphoreColor(
                        selectedTicket?.estadoDueno || '', 
                        selectedTicket?.estadoPM || '', 
                        selectedTicket?.fechaTargetING, 
                        selectedTicket?.dueno
                      ))}
                    </span>
                    <DialogTitle className="text-xl">
                      {selectedTicket?.numero}
                    </DialogTitle>
                  </div>
                  {selectedTicket?.fechaAsignacion && (
                    <div className="text-xs text-muted-foreground mt-1 ml-11">Asignado el {selectedTicket.fechaAsignacion}</div>
                  )}
                </DialogHeader>

                {selectedTicket && (
                  <div className="space-y-6">
                    {/* Información clave (reducida) */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div><strong>Solicitante:</strong> {selectedTicket.solicitante}</div>
                      <div><strong>Dueño actual:</strong> {selectedTicket.dueno || 'Sin asignar'}</div>
                      <div className="col-span-2 sm:col-span-1"><strong>Fecha asignación de tarea:</strong> {selectedTicket.fechaAsignacion || '—'}</div>
                      <div><strong>Proyecto:</strong> {selectedTicket.proyecto || '—'}</div>
                      <div><strong>Fecha Target ING:</strong> {selectedTicket.fechaTargetING || '—'}</div>
                    </div>

                    {/* Links clave - requeridos por el usuario: Link red INFO + Link trabajo finalizado editable por dueño */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Link en la red con INFO</div>
                        {selectedTicket.linkRedInfo ? (
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded break-all font-mono">{selectedTicket.linkRedInfo}</code>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => navigator.clipboard?.writeText(selectedTicket.linkRedInfo || '')}
                            >
                              Copiar
                            </Button>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">—</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Link de trabajo finalizado (campo a completar por el dueño)</div>
                        {(currentRole === 'JEFEING' || selectedTicket.dueno === currentUserName) ? (
                          <Input 
                            value={selectedTicket.linkArchivoTerminado || ''} 
                            onChange={(e) => actualizarLinkTrabajoFinalizado(selectedTicket.id, e.target.value)}
                            placeholder="Ej: M:\\...\\archivo_final.pdf o \\\\server\\ruta\\terminado"
                            className="text-xs"
                          />
                        ) : (
                          selectedTicket.linkArchivoTerminado ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded break-all font-mono block">{selectedTicket.linkArchivoTerminado}</code>
                          ) : (
                            <div className="text-xs text-muted-foreground">— (solo el dueño puede completarlo)</div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <strong className="text-sm">Descripción</strong>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedTicket.descripcion}
                      </p>
                    </div>

                    {/* Acciones rápidas de estado (solo visibles según rol) - Siempre arriba del chat */}
                    <div className="border-t pt-4 space-y-3">
                      {/* Cambiar Estado Dueño: Solo Dueño actual o JEFEING */}
                      {(currentRole === 'JEFEING' || selectedTicket.dueno === currentUserName) && (
                        <div>
                          <label className="text-xs font-medium block mb-1">Cambiar Estado Dueño</label>
                          <select
                            value={selectedTicket.estadoDueno}
                            onChange={(e) => cambiarEstadoDueno(selectedTicket.id, e.target.value)}
                            className={`w-full border rounded-md px-3 py-2 text-sm font-medium ${getEstadoDueñoColor(selectedTicket.estadoDueno)}`}
                          >
                            <option value="">—</option>
                            <option value="FALTA INFO">FALTA INFO</option>
                            <option value="EN STANDBY">EN STANDBY</option>
                            <option value="EN PROCESO">EN PROCESO</option>
                            <option value="REVISAR">REVISAR</option>
                            <option value="EN VERIFICACION">EN VERIFICACION</option>
                            <option value="OK FINALIZADO">OK FINALIZADO</option>
                          </select>
                        </div>
                      )}

                      {/* Cambiar Estado PM: Solo Solicitante, JEFE o JEFEING */}
                      {(currentRole === 'JEFEING' || currentRole === 'JEFE' || selectedTicket.solicitante === currentUserName) && (
                        <div>
                          <label className="text-xs font-medium block mb-1">Cambiar Estado PM (aceptación)</label>
                          <select
                            value={selectedTicket.estadoPM || ''}
                            onChange={(e) => cambiarEstadoPM(selectedTicket.id, e.target.value)}
                            className={`w-full border rounded-md px-3 py-2 text-sm font-medium ${getEstadoPMColor(selectedTicket.estadoPM)}`}
                          >
                            <option value="">PENDIENTE</option>
                            <option value="CORREGIR">CORREGIR</option>
                            <option value="REVISAR">REVISAR</option>
                            <option value="OK FINALIZADO">OK FINALIZADO</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Historial / Chat */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                      <strong className="text-sm">Historial / Comentarios</strong>
                      <div className="mt-3 border rounded p-3 bg-muted/30 text-xs space-y-2 max-h-60 overflow-auto">
                        {selectedTicket.historial.length > 0 ? (
                          selectedTicket.historial.map((entry, index) => {
                            const authorColor = getAuthorColor(entry.autor, selectedTicket);
                            return (
                              <div key={index} className="border-b pb-1 last:border-b-0">
                                <span className="text-muted-foreground">[{entry.fecha}]</span>{' '}
                                <strong className={authorColor}>{entry.autor}</strong>: {entry.mensaje}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-muted-foreground">Sin historial aún.</div>
                        )}
                      </div>
                    </div>

                    {/* Agregar comentario */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-medium">Agregar comentario</label>
                      <div className="flex gap-2 mt-1">
                        <Textarea
                          placeholder="Escribe un comentario..."
                          className="flex-1 min-h-[60px]"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (commentText.trim()) {
                                agregarComentario(selectedTicket.id, commentText.trim());
                                setCommentText('');
                              }
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => {
                            if (commentText.trim()) {
                              agregarComentario(selectedTicket.id, commentText.trim());
                              setCommentText('');
                            }
                          }}
                          disabled={!commentText.trim()}
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}

        {currentSection === 'dashboard' && <div className="p-8"><h2 className="text-2xl font-semibold mb-4">DASHBOARD</h2><p className="text-gray-600">Sección en desarrollo.</p></div>}
        {currentSection === 'proyectos' && <div className="p-8"><h2 className="text-2xl font-semibold mb-4">PROYECTOS</h2><p className="text-gray-600">Aquí vas a poder cargar y administrar la lista de proyectos.</p></div>}
        {currentSection === 'equipo' && <div className="p-8"><h2 className="text-2xl font-semibold mb-4">EQUIPO</h2><p className="text-gray-600">Aquí vas a poder ver a las personas con acceso y asignar roles.</p></div>}
      </div>
    </div>
  )
}