"use client"

import { useState, useEffect } from "react"

export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching rooms from API...")

      const response = await fetch("/api/rooms")
      const data = await response.json()

      console.log("📥 Rooms API response:", data)

      if (data.success) {
        setRooms(data.rooms || [])
        setError(null)
        console.log("✅ Successfully fetched rooms:", data.rooms?.length || 0)
      } else {
        setError(data.error)
        console.error("❌ Rooms API error:", data.error)
      }
    } catch (err) {
      setError("Failed to fetch rooms")
      console.error("❌ Fetch rooms error:", err)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async (roomData: any) => {
    try {
      console.log("🔄 Creating room:", roomData)

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      })

      const data = await response.json()
      console.log("📥 Create room response:", data)

      if (data.success) {
        await fetchRooms() // Refresh the list
        return data.room
      } else {
        throw new Error(data.error || "Failed to create room")
      }
    } catch (err) {
      console.error("❌ Create room error:", err)
      throw err
    }
  }

  const updateRoom = async (id: string, updates: any) => {
    try {
      console.log("🔄 Updating room:", id, updates)

      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      console.log("📥 Update room response:", data)

      if (data.success) {
        await fetchRooms() // Refresh the list
        return data.room
      } else {
        throw new Error(data.error || "Failed to update room")
      }
    } catch (err) {
      console.error("❌ Update room error:", err)
      throw err
    }
  }

  const deleteRoom = async (id: string) => {
    try {
      console.log("🔄 Deleting room:", id)

      const response = await fetch(`/api/rooms/${id}`, { method: "DELETE" })
      const data = await response.json()

      console.log("📥 Delete room response:", data)

      if (data.success) {
        await fetchRooms() // Refresh the list
        return true
      } else {
        throw new Error(data.error || "Failed to delete room")
      }
    } catch (err) {
      console.error("❌ Delete room error:", err)
      throw err
    }
  }

  useEffect(() => {
    console.log("🚀 useRooms hook initialized, fetching rooms...")
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
