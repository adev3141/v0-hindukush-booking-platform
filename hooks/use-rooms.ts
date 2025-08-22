"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/rooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch rooms")
      }

      const data = await response.json()
      const roomsData = data.rooms || data || []
      setRooms(roomsData)
      setError(null)
    } catch (err) {
      console.error("Error fetching rooms:", err)
      setError(err.message || "Failed to fetch rooms")
      toast({
        title: "Error",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  useEffect(() => {
    const roomsChannel = supabase
      .channel("rooms_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        () => {
          fetchRooms()
        },
      )
      .subscribe()

    const bookingsChannel = supabase
      .channel("bookings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchRooms()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(roomsChannel)
      supabase.removeChannel(bookingsChannel)
    }
  }, [fetchRooms])

  const createRoom = useCallback(async (roomData) => {
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room")
      }

      const newRoom = data.room
      setRooms((prevRooms) => [...prevRooms, newRoom])
      return newRoom
    } catch (err) {
      console.error("Error creating room:", err)
      throw err
    }
  }, [])

  const updateRoom = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update room")
      }

      const updatedRoom = data.room
      setRooms((prevRooms) => prevRooms.map((room) => (room.id === id ? { ...room, ...updatedRoom } : room)))
      return updatedRoom
    } catch (err) {
      console.error("Error updating room:", err)
      throw err
    }
  }, [])

  const deleteRoom = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete room")
      }

      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting room:", err)
      throw err
    }
  }, [])

  const updateRoomStatus = useCallback(async (id, status) => {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update room status")
      }

      const updatedRoom = data.room
      setRooms((prevRooms) => prevRooms.map((room) => (room.id === id ? { ...room, status } : room)))
      return updatedRoom
    } catch (err) {
      console.error("Error updating room status:", err)
      throw err
    }
  }, [])

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
  }
}
