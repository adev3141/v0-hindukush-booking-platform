"use client"

import { useState, useEffect } from "react"
import type { Room } from "@/lib/supabase"

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    console.log("🔍 Fetching rooms...")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/rooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      })

      console.log("📡 Rooms API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to fetch rooms:", errorData)
        throw new Error(errorData.error || "Failed to fetch rooms")
      }

      const data = await response.json()
      console.log("📋 Rooms data received:", data)

      const roomsArray = data.rooms || data || []
      setRooms(roomsArray)
      console.log(`✅ Successfully loaded ${roomsArray.length} rooms`)
    } catch (err) {
      console.error("❌ Error fetching rooms:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch rooms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const refetch = () => {
    fetchRooms()
  }

  return {
    rooms,
    loading,
    error,
    refetch,
  }
}
