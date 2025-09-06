import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const { checkIn, checkOut, roomType } = await request.json()

    if (!checkIn || !checkOut) {
      return NextResponse.json({ success: false, error: "Check-in and check-out dates are required" }, { status: 400 })
    }

    const db = getAdminDb()

    const roomsQuery = roomType
      ? db.collection("rooms").where("type", "==", roomType)
      : db.collection("rooms")
    const roomsSnap = await roomsQuery.get()
    const allRooms = roomsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => r.status === "available")

    const bookingsSnap = await db
      .collection("bookings")
      .where("status", "in", ["confirmed", "checked-in"])
      .get()
    const conflicting = bookingsSnap.docs
      .map((d) => d.data() as any)
      .filter((b) => !(b.check_out < checkIn || b.check_in > checkOut))

    const conflictingIds = new Set(conflicting.map((b) => b.room_id).filter(Boolean))
    const availableRooms = allRooms.filter((room) => !conflictingIds.has(room.id))

    return NextResponse.json({
      success: true,
      availableRooms,
      count: availableRooms.length,
    })
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json({ success: false, error: "Failed to check availability" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = getAdminDb()
    const roomsSnap = await db.collection("rooms").get()
    const rooms = roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const today = new Date().toISOString().split("T")[0]
    const bookingsSnap = await db
      .collection("bookings")
      .where("status", "in", ["confirmed", "checked-in"])
      .get()
    const occupiedIds = new Set(
      bookingsSnap.docs
        .map((d) => d.data() as any)
        .filter((b) => b.check_in <= today && b.check_out >= today)
        .map((b) => b.room_id)
        .filter(Boolean),
    )

    const summary: Record<string, { total: number; available: number }> = {}
    rooms.forEach((room: any) => {
      if (!summary[room.type]) summary[room.type] = { total: 0, available: 0 }
      summary[room.type].total++
      if (!occupiedIds.has(room.id) && room.status === "available") {
        summary[room.type].available++
      }
    })

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error("Get availability summary error:", error)
    return NextResponse.json({ success: false, error: "Failed to get availability summary" }, { status: 500 })
  }
}
