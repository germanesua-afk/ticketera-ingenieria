'use client'

interface SidebarProps {
  currentView: 'home' | 'dashboard' | 'proyectos' | 'equipo'
  onViewChange: (view: 'home' | 'dashboard' | 'proyectos' | 'equipo') => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'home' as const, label: 'HOME' },
    { id: 'dashboard' as const, label: 'DASHBOARD' },
    { id: 'proyectos' as const, label: 'PROYECTOS' },
    { id: 'equipo' as const, label: 'EQUIPO' },
  ]

  return (
    <div className="w-64 bg-gray-200 border-r border-gray-300 h-screen fixed left-0 top-0 z-40 flex flex-col">
      <div className="p-4 border-b border-gray-300">
        <h1 className="text-lg font-semibold text-gray-800">Ticketera</h1>
        <p className="text-xs text-gray-600">Despliegue de Obras</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              currentView === item.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-700 hover:bg-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-300 text-xs text-gray-600">
        Versión prototipo
      </div>
    </div>
  )
}
