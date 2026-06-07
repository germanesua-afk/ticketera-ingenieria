import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Ticketera</h1>
          <p className="text-muted-foreground mt-2">Equipo de Ingeniería • Despliegue de Obras</p>
        </div>

        <form action="/auth/sign-in" method="post" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="mt-1 w-full rounded-md border px-3 py-2" 
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="mt-1 w-full rounded-md border px-3 py-2" 
            />
          </div>
          <button 
            type="submit"
            className="w-full rounded-md bg-black py-2.5 text-white font-medium hover:bg-black/90"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Sistema interno del Equipo de Ingeniería
        </p>
      </div>
    </div>
  )
}
