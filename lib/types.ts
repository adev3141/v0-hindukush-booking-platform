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
  nationality?: string
  check_in: string
  check_out: string
  room_id?: string
  room_type: string
  room_number?: string
  guests: number
  nights: number
  total_amount: number
  currency: string
  special_requests?: string
  purpose_of_visit?: string
  payment_method?: string
  payment_status: "pending" | "paid" | "failed" | "refunded"
  status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
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
