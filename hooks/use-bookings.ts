"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Booking } from "@/lib/types"

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bookingsRef = collection(db, "bookings")
  const bookingsQuery = query(bookingsRef, orderBy("created_at", "desc"))

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const snapshot = await getDocs(bookingsQuery)
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Booking[]
      setBookings(data)
    } catch (err) {
      console.error("❌ Error in fetchBookings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch bookings")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [bookingsQuery])

  const createBooking = async (bookingData: Partial<Booking>) => {
    try {
      const now = new Date().toISOString()
      const docRef = await addDoc(bookingsRef, {
        ...bookingData,
        created_at: now,
        updated_at: now,
      })
      console.log("✅ Booking created successfully:", docRef.id)
      return { id: docRef.id, ...bookingData, created_at: now, updated_at: now } as Booking
    } catch (err) {
      console.error("❌ Error in createBooking:", err)
      throw err
    }
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const bookingDoc = doc(db, "bookings", id)
      await updateDoc(bookingDoc, { ...updates, updated_at: new Date().toISOString() })
      console.log("✅ Booking updated successfully:", id)
      return { id, ...updates } as Booking
    } catch (err) {
      console.error("❌ Error in updateBooking:", err)
      throw err
    }
  }

  const cancelBooking = async (id: string, reason?: string) => {
    try {
      const bookingDoc = doc(db, "bookings", id)
      await updateDoc(bookingDoc, {
        status: "cancelled",
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      console.log("✅ Booking cancelled successfully:", id)
      return { id, status: "cancelled", cancellation_reason: reason || null } as Booking
    } catch (err) {
      console.error("❌ Error in cancelBooking:", err)
      throw err
    }
  }

  const refetch = () => {
    fetchBookings()
  }

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Booking[]
        setBookings(data)
        setLoading(false)
      },
      (err) => {
        console.error("❌ Error in bookings snapshot:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch bookings")
        setLoading(false)
      }
    )
    return unsubscribe
  }, [bookingsQuery])

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
