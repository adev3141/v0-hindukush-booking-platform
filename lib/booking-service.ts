import { supabase } from "./supabase"
import type { Booking, Inquiry, Room, RoomPricing } from "./supabase"

export class BookingService {
  // Generate unique booking reference
  static generateBookingReference(): string {
    return `HKH-${Math.floor(100000 + Math.random() * 900000)}`
  }

  // Create a new booking
  static async createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at" | "booking_reference">) {
    try {
      const booking_reference = this.generateBookingReference()

      const { data, error } = await supabase
        .from("bookings")
        .insert([{ ...bookingData, booking_reference }])
        .select()
        .single()

      if (error) {
        console.error("Supabase booking creation error:", error)
        throw new Error(`Failed to create booking: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("BookingService.createBooking error:", error)
      throw error
    }
  }

  // Get all bookings
  static async getBookings() {
    try {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase get bookings error:", error)
        throw new Error(`Failed to fetch bookings: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("BookingService.getBookings error:", error)
      throw error
    }
  }

  // Get booking by ID
  static async getBookingById(id: string) {
    try {
      const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single()

      if (error) {
        console.error("Supabase get booking by ID error:", error)
        throw new Error(`Failed to fetch booking: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("BookingService.getBookingById error:", error)
      throw error
    }
  }

  // Update booking
  static async updateBooking(id: string, updates: Partial<Booking>) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase update booking error:", error)
        throw new Error(`Failed to update booking: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("BookingService.updateBooking error:", error)
      throw error
    }
  }

  // Update booking status
  static async updateBookingStatus(id: string, status: Booking["booking_status"]) {
    return this.updateBooking(id, { booking_status: status })
  }

  // Update payment status
  static async updatePaymentStatus(id: string, status: Booking["payment_status"]) {
    return this.updateBooking(id, { payment_status: status })
  }

  // Delete/Cancel booking
  static async cancelBooking(id: string, reason?: string) {
    return this.updateBooking(id, {
      booking_status: "cancelled",
      special_requests: reason ? `Cancelled: ${reason}` : "Cancelled",
    })
  }

  // Check room availability
  static async checkAvailability(checkIn: string, checkOut: string, roomType?: string) {
    try {
      // Get conflicting bookings
      let query = supabase
        .from("bookings")
        .select("room_id, room_type, room_number")
        .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`)
        .in("booking_status", ["confirmed", "checked-in"])

      if (roomType) {
        query = query.eq("room_type", roomType)
      }

      const { data: conflictingBookings, error } = await query
      if (error) {
        console.error("Supabase availability check error:", error)
        throw new Error(`Failed to check availability: ${error.message}`)
      }

      // Get all rooms
      const { data: allRooms, error: roomsError } = await supabase.from("rooms").select("*").eq("status", "available")

      if (roomsError) {
        console.error("Supabase get rooms error:", roomsError)
        throw new Error(`Failed to fetch rooms: ${roomsError.message}`)
      }

      // Filter out conflicting rooms
      const conflictingRoomIds = conflictingBookings?.map((b) => b.room_id).filter(Boolean) || []
      const availableRooms = allRooms?.filter((room) => !conflictingRoomIds.includes(room.id)) || []

      return availableRooms
    } catch (error) {
      console.error("BookingService.checkAvailability error:", error)
      throw error
    }
  }

  // Get room availability summary
  static async getRoomAvailabilitySummary() {
    try {
      const { data: rooms, error: roomsError } = await supabase.from("rooms").select("*")
      if (roomsError) {
        console.error("Supabase get rooms summary error:", roomsError)
        throw new Error(`Failed to fetch rooms: ${roomsError.message}`)
      }

      const { data: occupiedBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("room_id, room_type")
        .in("booking_status", ["confirmed", "checked-in"])
        .lte("check_in", new Date().toISOString().split("T")[0])
        .gte("check_out", new Date().toISOString().split("T")[0])

      if (bookingsError) {
        console.error("Supabase get occupied bookings error:", bookingsError)
        throw new Error(`Failed to fetch occupied bookings: ${bookingsError.message}`)
      }

      const occupiedRoomIds = occupiedBookings?.map((b) => b.room_id).filter(Boolean) || []

      // Group by room type
      const summary: Record<string, { total: number; available: number }> = {}

      rooms?.forEach((room) => {
        if (!summary[room.type]) {
          summary[room.type] = { total: 0, available: 0 }
        }
        summary[room.type].total++
        if (!occupiedRoomIds.includes(room.id) && room.status === "available") {
          summary[room.type].available++
        }
      })

      return summary
    } catch (error) {
      console.error("BookingService.getRoomAvailabilitySummary error:", error)
      throw error
    }
  }
}

export class InquiryService {
  // Create inquiry
  static async createInquiry(inquiryData: Omit<Inquiry, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase.from("inquiries").insert([inquiryData]).select().single()

      if (error) {
        console.error("Supabase create inquiry error:", error)
        throw new Error(`Failed to create inquiry: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("InquiryService.createInquiry error:", error)
      throw error
    }
  }

  // Get all inquiries
  static async getInquiries() {
    try {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase get inquiries error:", error)
        throw new Error(`Failed to fetch inquiries: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("InquiryService.getInquiries error:", error)
      throw error
    }
  }

  // Reply to inquiry
  static async replyToInquiry(id: string, reply: string) {
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .update({
          reply,
          status: "replied",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase reply to inquiry error:", error)
        throw new Error(`Failed to reply to inquiry: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("InquiryService.replyToInquiry error:", error)
      throw error
    }
  }

  // Update inquiry status
  static async updateInquiryStatus(id: string, status: Inquiry["status"]) {
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase update inquiry status error:", error)
        throw new Error(`Failed to update inquiry status: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("InquiryService.updateInquiryStatus error:", error)
      throw error
    }
  }
}

export class RoomService {
  // Get all rooms
  static async getRooms() {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("type", { ascending: true })
        .order("number", { ascending: true })

      if (error) {
        console.error("Supabase get rooms error:", error)
        throw new Error(`Failed to fetch rooms: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("RoomService.getRooms error:", error)
      throw error
    }
  }

  // Create room
  static async createRoom(roomData: Omit<Room, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase.from("rooms").insert([roomData]).select().single()

      if (error) {
        console.error("Supabase create room error:", error)
        throw new Error(`Failed to create room: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("RoomService.createRoom error:", error)
      throw error
    }
  }

  // Update room
  static async updateRoom(id: string, updates: Partial<Room>) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase update room error:", error)
        throw new Error(`Failed to update room: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("RoomService.updateRoom error:", error)
      throw error
    }
  }

  // Update room status
  static async updateRoomStatus(id: string, status: Room["status"]) {
    return this.updateRoom(id, { status })
  }

  // Delete room
  static async deleteRoom(id: string) {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id)

      if (error) {
        console.error("Supabase delete room error:", error)
        throw new Error(`Failed to delete room: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error("RoomService.deleteRoom error:", error)
      throw error
    }
  }

  // Get room pricing
  static async getRoomPricing() {
    try {
      const { data, error } = await supabase.from("room_pricing").select("*")

      if (error) {
        console.error("Supabase get room pricing error:", error)
        throw new Error(`Failed to fetch room pricing: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("RoomService.getRoomPricing error:", error)
      throw error
    }
  }

  // Update room pricing
  static async updateRoomPricing(roomType: string, pricing: Partial<RoomPricing>) {
    try {
      const { data, error } = await supabase
        .from("room_pricing")
        .update({ ...pricing, updated_at: new Date().toISOString() })
        .eq("room_type", roomType)
        .select()
        .single()

      if (error) {
        console.error("Supabase update room pricing error:", error)
        throw new Error(`Failed to update room pricing: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("RoomService.updateRoomPricing error:", error)
      throw error
    }
  }
}
