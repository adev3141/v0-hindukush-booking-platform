"use client"

import { useState, useEffect } from "react"
import type { Booking } from "@/lib/supabase"

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    console.log("🔍 Fetching bookings...")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      })

      console.log("📡 Bookings API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to fetch bookings:", errorData)
        throw new Error(errorData.error || "Failed to fetch bookings")
      }

      const data = await response.json()
      console.log("📋 Bookings data received:", data)

      // Handle both response formats
      const bookingsArray = data.bookings || data || []
      setBookings(bookingsArray)
      console.log(`✅ Successfully loaded ${bookingsArray.length} bookings`)
    } catch (err) {
      console.error("❌ Error fetching bookings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const refetch = () => {
    fetchBookings()
  }

  return {
    bookings,
    loading,
    error,
    refetch,
  }
}
