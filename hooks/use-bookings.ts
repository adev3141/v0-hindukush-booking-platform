"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Booking {
  id: string
  booking_reference: string
  guest_name: string
  email: string
  phone: string
  nationality?: string
  check_in: string
  check_out: string
  room_type: string
  room_number?: string
  guests: number
  nights: number
  total_amount: number
  currency: string
  special_requests?: string
  purpose_of_visit?: string
  payment_method?: string
  payment_status: string
  status: string
  created_at: string
  updated_at: string
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Error fetching bookings:", fetchError)
        throw fetchError
      }

      console.log("✅ Bookings fetched successfully:", data)
      setBookings(data || [])
    } catch (err) {
      console.error("❌ Error in fetchBookings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch bookings")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (bookingData: Partial<Booking>) => {
    try {
      console.log("🔄 Creating booking:", bookingData)

      const { data, error: createError } = await supabase.from("bookings").insert([bookingData]).select().single()

      if (createError) {
        console.error("❌ Error creating booking:", createError)
        throw createError
      }

      console.log("✅ Booking created successfully:", data)

      // Refresh bookings list
      await fetchBookings()

      return data
    } catch (err) {
      console.error("❌ Error in createBooking:", err)
      throw err
    }
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      console.log("🔄 Updating booking:", id, updates)

      const { data, error: updateError } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (updateError) {
        console.error("❌ Error updating booking:", updateError)
        throw updateError
      }

      console.log("✅ Booking updated successfully:", data)

      // Refresh bookings list
      await fetchBookings()

      return data
    } catch (err) {
      console.error("❌ Error in updateBooking:", err)
      throw err
    }
  }

  const cancelBooking = async (id: string, reason?: string) => {
    try {
      console.log("🔄 Cancelling booking:", id, "Reason:", reason)

      const updates: Partial<Booking> = {
        status: "cancelled",
        updated_at: new Date().toISOString(),
      }

      // If reason is provided, we could store it in special_requests or a separate field
      if (reason) {
        updates.special_requests = `CANCELLED: ${reason}`
      }

      const { data, error: cancelError } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (cancelError) {
        console.error("❌ Error cancelling booking:", cancelError)
        throw cancelError
      }

      console.log("✅ Booking cancelled successfully:", data)

      // Refresh bookings list
      await fetchBookings()

      return data
    } catch (err) {
      console.error("❌ Error in cancelBooking:", err)
      throw err
    }
  }

  const refetch = () => {
    fetchBookings()
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    cancelBooking,
    refetch,
  }
}
