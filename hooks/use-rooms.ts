"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { RoomService } from "@/lib/booking-service"

export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      const roomsData = await RoomService.getRooms()
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

  const createRoom = useCallback(async (roomData) => {
    try {
      const newRoom = await RoomService.createRoom(roomData)
      setRooms((prevRooms) => [...prevRooms, newRoom])
      return newRoom
    } catch (err) {
      console.error("Error creating room:", err)
      throw err
    }
  }, [])

  const updateRoom = useCallback(async (id, updates) => {
    try {
      const updatedRoom = await RoomService.updateRoom(id, updates)
      setRooms((prevRooms) => prevRooms.map((room) => (room.id === id ? { ...room, ...updatedRoom } : room)))
      return updatedRoom
    } catch (err) {
      console.error("Error updating room:", err)
      throw err
    }
  }, [])

  const deleteRoom = useCallback(async (id) => {
    try {
      await RoomService.deleteRoom(id)
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting room:", err)
      throw err
    }
  }, [])

  const updateRoomStatus = useCallback(async (id, status) => {
    try {
      const updatedRoom = await RoomService.updateRoomStatus(id, status)
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
