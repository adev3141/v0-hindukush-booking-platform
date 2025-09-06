"use client"

import { useState, useEffect } from "react"
import type { Booking } from "@/lib/types"

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/bookings", { cache: "no-cache" })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch bookings")
      }
      const data = await response.json()
      console.log("✅ Bookings fetched successfully:", data.bookings)
      setBookings(data.bookings || [])
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

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking")
      }
      console.log("✅ Booking created successfully:", data.booking)
      await fetchBookings()
      return data.booking
    } catch (err) {
      console.error("❌ Error in createBooking:", err)
      throw err
    }
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      console.log("🔄 Updating booking:", id, updates)

      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update booking")
      }
      console.log("✅ Booking updated successfully:", data.booking)
      await fetchBookings()
      return data.booking
    } catch (err) {
      console.error("❌ Error in updateBooking:", err)
      throw err
    }
  }

  const cancelBooking = async (id: string, reason?: string) => {
    try {
      console.log("🔄 Cancelling booking:", id, "Reason:", reason)

      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ""
      const response = await fetch(`/api/bookings/${id}${params}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking")
      }
      console.log("✅ Booking cancelled successfully:", data.booking)
      await fetchBookings()
      return data.booking
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
