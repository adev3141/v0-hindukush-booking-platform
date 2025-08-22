import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase" // service role client

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
    const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", params.id)
    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, booking: data[0] })
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

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found or not updated" }, { status: 404 })
    }

    // If booking is cancelled or checked-out, free up the room
    if (updates.status && ["cancelled", "checked-out"].includes(updates.status) && data[0].room_id) {
      const { error: roomErr } = await supabaseAdmin
        .from("rooms")
        .update({ status: "available", updated_at: new Date().toISOString() })
        .eq("id", data[0].room_id)

      if (roomErr) {
        console.error("Failed to update room status:", roomErr)
      }
    }

    return NextResponse.json({ success: true, booking: data[0] })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get("reason") || undefined

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({
        status: "cancelled",
        special_requests: reason ? `Cancelled: ${reason}` : "Cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    // Free up the room
    if (data[0].room_id) {
      const { error: roomErr } = await supabaseAdmin
        .from("rooms")
        .update({ status: "available", updated_at: new Date().toISOString() })
        .eq("id", data[0].room_id)

      if (roomErr) {
        console.error("Failed to update room status:", roomErr)
      }
    }

    return NextResponse.json({ success: true, message: "Booking cancelled successfully", booking: data[0] })
  } catch (error) {
    console.error("Cancel booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to cancel booking" }, { status: 500 })
  }
}
