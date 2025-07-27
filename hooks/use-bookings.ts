"use client"

import { useState, useEffect } from "react"
import type { Booking } from "@/lib/supabase"

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching bookings from API...")

      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 API Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📥 Raw API response:", data)

      if (data.error) {
        setError(data.error)
        console.error("❌ API returned error:", data.error)
      } else {
        setBookings(data.bookings || [])
        setError(null)
        console.log("✅ Successfully fetched bookings:", data.bookings?.length || 0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch bookings"
      setError(errorMessage)
      console.error("❌ Fetch bookings error:", err)
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (bookingData: any) => {
    try {
      console.log("🔄 Creating booking:", bookingData)

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()
      console.log("📥 Create booking response:", data)

      if (data.success) {
        await fetchBookings() // Refresh the list
        return data.booking
      } else {
        throw new Error(data.error || "Failed to create booking")
      }
    } catch (err) {
      console.error("❌ Create booking error:", err)
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
      console.log("📥 Update booking response:", data)

      if (data.success) {
        await fetchBookings() // Refresh the list
        return data.booking
      } else {
        throw new Error(data.error || "Failed to update booking")
      }
    } catch (err) {
      console.error("❌ Update booking error:", err)
      throw err
    }
  }

  const cancelBooking = async (id: string, reason?: string) => {
    try {
      console.log("🔄 Cancelling booking:", id, reason)

      const url = reason ? `/api/bookings/${id}?reason=${encodeURIComponent(reason)}` : `/api/bookings/${id}`
      const response = await fetch(url, { method: "DELETE" })

      const data = await response.json()
      console.log("📥 Cancel booking response:", data)

      if (data.success) {
        await fetchBookings() // Refresh the list
        return true
      } else {
        throw new Error(data.error || "Failed to cancel booking")
      }
    } catch (err) {
      console.error("❌ Cancel booking error:", err)
      throw err
    }
  }

  useEffect(() => {
    console.log("🚀 useBookings hook initialized, fetching bookings...")
    fetchBookings()
  }, [])

  // Debug logging
  console.log("=== useBookings DEBUG ===")
  console.log("Loading:", loading)
  console.log("Error:", error)
  console.log("Bookings count:", bookings?.length || 0)
  console.log("Bookings data:", bookings)

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
  }
}
