// Tipos generados automáticamente desde Supabase
// Ejecutar: npm run db:generate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'SOLICITANTE' | 'SOLICITANTE+' | 'ING' | 'JEFEING' | 'ADMIN'
export type TicketEstado = 'NUEVO' | 'PENDIENTE_ASIGNACION' | 'ASIGNADO' | 'EN_PROGRESO' | 'EN_REVISION' | 'CERRADO' | 'CANCELADO'
export type TicketPrioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nombre_completo: string
          rol: UserRole
          area_obra: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nombre_completo: string
          rol?: UserRole
          area_obra?: string | null
          activo?: boolean
        }
        Update: { /* ... */ }
      }
      tickets: {
        Row: {
          id: string
          numero: string | null
          titulo: string
          descripcion: string | null
          solicitante_id: string
          dueno_id: string | null
          estado: TicketEstado
          prioridad: TicketPrioridad
          area_obra: string | null
          fecha_creacion: string
          fecha_fin_estimada: string | null
          fecha_cierre: string | null
          link_planos: string | null
          link_avance: string | null
          link_fotos: string | null
          observaciones: string | null
          created_at: string
          updated_at: string
        }
        // Insert y Update...
      }
      // ... resto de tablas
    }
  }
}
