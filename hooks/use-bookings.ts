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
      const response = await fetch("/api/bookings")
      const data = await response.json()

      if (data.success) {
        setBookings(data.bookings)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch bookings")
      console.error("Fetch bookings error:", err)
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (bookingData: any) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (data.success) {
        await fetchBookings() // Refresh the list
        return data.booking
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Create booking error:", err)
      throw err
    }
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (data.success) {
        await fetchBookings() // Refresh the list
        return data.booking
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Update booking error:", err)
      throw err
    }
  }

  const cancelBooking = async (id: string, reason?: string) => {
    try {
      const url = reason ? `/api/bookings/${id}?reason=${encodeURIComponent(reason)}` : `/api/bookings/${id}`
      const response = await fetch(url, { method: "DELETE" })

      const data = await response.json()

      if (data.success) {
        await fetchBookings() // Refresh the list
        return true
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Cancel booking error:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

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
