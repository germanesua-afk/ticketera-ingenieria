import { Suspense } from 'react'
import { TicketDashboard } from '@/components/dashboard/TicketDashboard'
import { getCurrentUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1 text-center text-xs font-medium text-amber-800">
          🚀 MODO DEMO PÚBLICO — Cambiá de usuario con la barra amarilla para probar todos los roles
        </div>
        <div className="px-4 py-4 lg:pl-64 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Ticketera • Despliegue de Obras
            </h1>
            <p className="text-sm text-muted-foreground">
              Equipo de Ingeniería
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.nombre_completo} • {user?.rol}
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 lg:pl-0">
        <Suspense fallback={<div className="p-8">Cargando dashboard...</div>}>
          <TicketDashboard user={user} />
        </Suspense>
      </main>
    </div>
  )
}
