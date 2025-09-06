import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function GET() {
  try {
    const db = getAdminDb()
    const snap = await db.collection("bookings").orderBy("created_at", "desc").get()
    const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ["firstName", "lastName", "email", "phone", "checkIn", "checkOut", "roomType"]
    const missing = required.filter((f) => !body[f])
    if (missing.length) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      )
    }

    const checkIn = new Date(body.checkIn)
    const checkOut = new Date(body.checkOut)
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return NextResponse.json({ success: false, error: "Invalid dates" }, { status: 400 })
    }

    const db = getAdminDb()
    const roomSnap = await db
      .collection("rooms")
      .where("type", "==", body.roomType)
      .where("status", "==", "available")
      .orderBy("number")
      .limit(1)
      .get()

    if (roomSnap.empty) {
      return NextResponse.json(
        { success: false, error: "No available rooms for the selected type" },
        { status: 400 },
      )
    }

    const room = { id: roomSnap.docs[0].id, ...roomSnap.docs[0].data() } as any

    const bookingReference = `HK${Date.now().toString().slice(-6)}`
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const prices: Record<string, number> = {
      "Deluxe Room": 8000,
      "Standard Room": 6000,
      "Budget Room": 4000,
      "Family Suite": 12000,
    }
    const basePrice = prices[body.roomType] || 6000
    const totalAmount = basePrice * nights
    const now = new Date().toISOString()

    const bookingData = {
      booking_reference: bookingReference,
      guest_name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      nationality: body.nationality || null,
      check_in: body.checkIn,
      check_out: body.checkOut,
      room_type: body.roomType,
      room_id: room.id,
      room_number: room.number,
      guests: body.guests || 1,
      nights,
      total_amount: totalAmount,
      currency: "PKR",
      payment_status: "pending",
      status: "confirmed",
      special_requests: body.specialRequests || null,
      purpose_of_visit: body.purposeOfVisit || null,
      payment_method: null,
      created_at: now,
      updated_at: now,
    }

    const docRef = await db.collection("bookings").add(bookingData)
    await db.collection("rooms").doc(room.id).update({ status: "occupied", updated_at: now })

    return NextResponse.json({
      success: true,
      booking: { id: docRef.id, ...bookingData },
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}

