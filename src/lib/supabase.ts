import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types for the Church Management System
export interface Database {
  public: {
    Tables: {
      churches: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
      }
      church_locations: {
        Row: {
          id: string
          church_id: string
          name: string
          description: string | null
          location_type: 'worship_space' | 'meeting_room' | 'fellowship_area' | 'office' | 'outdoor_area' | 'utility_space'
          capacity: number | null
          equipment_list: string[]
          setup_time_minutes: number
          cleanup_time_minutes: number
          requires_approval: boolean
          access_restrictions: string | null
          booking_instructions: string | null
          maintenance_notes: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          church_id: string
          name: string
          description?: string | null
          location_type?: 'worship_space' | 'meeting_room' | 'fellowship_area' | 'office' | 'outdoor_area' | 'utility_space'
          capacity?: number | null
          equipment_list?: string[]
          setup_time_minutes?: number
          cleanup_time_minutes?: number
          requires_approval?: boolean
          access_restrictions?: string | null
          booking_instructions?: string | null
          maintenance_notes?: string | null
          is_active?: boolean
          sort_order?: number
        }
      }
      events: {
        Row: {
          id: string
          church_id: string
          category_id: string | null
          title: string
          description: string | null
          event_type: string
          start_date: string
          end_date: string | null
          start_time: string
          end_time: string
          location_name: string | null
          room_id: string | null
          visibility_level: string
          status: string
          approval_required: boolean
          approved_by: string | null
          approved_at: string | null
          contact_name: string | null
          contact_email: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
          unified_type: string | null
        }
        Insert: {
          church_id: string
          title: string
          description?: string | null
          event_type?: string
          start_date: string
          end_date?: string | null
          start_time: string
          end_time: string
          location_name?: string | null
          room_id?: string | null
          category_id?: string | null
          visibility_level?: string
          is_public?: boolean
          status?: string
          approval_required?: boolean
          contact_name?: string | null
          contact_email?: string | null
          notes?: string | null
          created_by: string
          unified_type?: string | null
        }
      }
      staff_event_categories: {
        Row: {
          id: string
          church_id: string
          name: string
          description: string | null
          color: string
          icon: string
          is_confidential: boolean
          access_level: 'staff_only' | 'leadership_only' | 'hr_only' | 'admin_only'
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      location_bookings: {
        Row: {
          id: string
          church_id: string
          location_id: string
          event_id: string | null
          booking_type: string
          title: string
          description: string | null
          start_datetime: string
          end_datetime: string
          booking_status: string
          created_at: string
          updated_at: string
        }
      }
      location_usage_analytics: {
        Row: {
          id: string
          church_id: string
          location_id: string
          analysis_date: string
          period_type: string
          total_bookings: number
          total_hours_used: number
          utilization_percentage: number
          most_common_event_type: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}