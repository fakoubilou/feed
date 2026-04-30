export type Role = 'manager' | 'directeur'

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          taux_horaire: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          role: Role
          restaurant_id: string | null
          nom: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], never>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      raz_entries: {
        Row: {
          id: string
          restaurant_id: string
          date: string
          ca: number
          couverts: number
          staff_hours: number
          offerts: number
          annulations: number
          ouverture: string | null
          fermeture: string | null
          note: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['raz_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['raz_entries']['Insert']>
      }
      staff_entries: {
        Row: {
          id: string
          raz_id: string
          nom: string | null
          debut: string | null
          fin: string | null
          pause_minutes: number
          duree_minutes: number | null
        }
        Insert: Omit<Database['public']['Tables']['staff_entries']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['staff_entries']['Insert']>
      }
    }
  }
}

export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type RazEntry = Database['public']['Tables']['raz_entries']['Row']
export type StaffEntry = Database['public']['Tables']['staff_entries']['Row']

export interface RazWithStaff extends RazEntry {
  staff_entries: StaffEntry[]
}
