import { createClient } from './supabase/server'
import { Database } from '@/types/database'

export type UserWithRole = Database['public']['Tables']['usuarios']['Row']

export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // En desarrollo: si no existe el perfil en la tabla usuarios, devolvemos null
      // para que funcione el selector de usuarios de prueba (barra amarilla)
      console.warn('getCurrentUser: No se encontró perfil en usuarios para', user.id)
      return null
    }

    return profile
  } catch (err) {
    // Fallback total para desarrollo: nunca romper la página por auth
    console.warn('getCurrentUser error (fallback a null para modo desarrollo):', err)
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
