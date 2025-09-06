import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin" // service role client

const TABLE = "bookings"

// Only allow known columns to be updated
const ALLOWED_UPDATE_FIELDS = new Set([
  "guest_name",
  "email",
  "phone",
  "nationality",
  "check_in",
  "check_out",
  "room_id",
  "room_type",
  "room_number",
  "guests",
  "nights",
  "total_amount",
  "currency",
  "payment_method",
  "payment_status",
  "status",
  "special_requests",
])

function sanitizeUpdates(input: Record<string, any>) {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(input || {})) {
    if (ALLOWED_UPDATE_FIELDS.has(k)) out[k] = v
  }
  return out
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getAdminDb()
    const doc = await db.collection(TABLE).doc(params.id).get()

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, booking: { id: doc.id, ...doc.data() } })
  } catch (error) {
    console.error("Get booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raw = await request.json()
    const updates = sanitizeUpdates(raw)

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
    }

    const db = getAdminDb()
    const docRef = db.collection(TABLE).doc(params.id)
    const doc = await docRef.get()
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    await docRef.update({ ...updates, updated_at: new Date().toISOString() })
    const updated = await docRef.get()
    const booking = { id: docRef.id, ...updated.data() }

    if (updates.status && ["cancelled", "checked-out"].includes(updates.status) && booking.room_id) {
      await db
        .collection("rooms")
        .doc(booking.room_id)
        .update({ status: "available", updated_at: new Date().toISOString() })
        .catch((err) => console.error("Failed to update room status:", err))
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get("reason") || undefined

    const db = getAdminDb()
    const docRef = db.collection(TABLE).doc(params.id)
    const doc = await docRef.get()
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    await docRef.update({
      status: "cancelled",
      special_requests: reason ? `Cancelled: ${reason}` : "Cancelled",
      updated_at: new Date().toISOString(),
    })

    const updated = await docRef.get()
    const booking = { id: docRef.id, ...updated.data() }

    if (booking.room_id) {
      await db
        .collection("rooms")
        .doc(booking.room_id)
        .update({ status: "available", updated_at: new Date().toISOString() })
        .catch((err) => console.error("Failed to update room status:", err))
    }

    return NextResponse.json({ success: true, message: "Booking cancelled successfully", booking })
  } catch (error) {
    console.error("Cancel booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to cancel booking" }, { status: 500 })
  }
}
