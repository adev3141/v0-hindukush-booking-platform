"use client"

import { useState, useEffect } from "react"
import type { Room } from "@/lib/supabase"

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/rooms")
      const data = await response.json()

      if (data.success) {
        setRooms(data.rooms)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch rooms")
      console.error("Fetch rooms error:", err)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async (roomData: any) => {
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      })

      const data = await response.json()

      if (data.success) {
        await fetchRooms() // Refresh the list
        return data.room
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Create room error:", err)
      throw err
    }
  }

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (data.success) {
        await fetchRooms() // Refresh the list
        return data.room
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Update room error:", err)
      throw err
    }
  }

  const deleteRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/rooms/${id}`, { method: "DELETE" })

      const data = await response.json()

      if (data.success) {
        await fetchRooms() // Refresh the list
        return true
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Delete room error:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  }
}
