import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createSupabaseClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Types for our database tables
export interface Room {
  id: string
  number: string
  type: string
  status: "available" | "occupied" | "maintenance" | "out-of-order"
  floor: number
  max_occupancy: number
  amenities: string[]
  description?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  booking_reference: string
  guest_name: string
  email: string
  phone: string
  check_in: string
  check_out: string
  room_id?: string
  room_type: string
  room_number?: string
  guests: number
  total_amount: number
  currency: string
  payment_method: "credit-card" | "bank-transfer" | "cash"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  booking_status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
  special_requests?: string
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "new" | "replied" | "resolved"
  reply?: string
  created_at: string
  updated_at: string
}

export interface RoomPricing {
  id: string
  room_type: string
  base_price: number
  currency: string
  season_multiplier: number
  weekend_multiplier: number
  created_at: string
  updated_at: string
}
