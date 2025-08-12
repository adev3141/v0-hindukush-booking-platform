import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching bookings from Supabase...")

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch bookings", details: error.message }, { status: 500 })
    }

    console.log("✅ Successfully fetched bookings:", bookings?.length || 0)
    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Creating new booking...")
    const body = await request.json()
    console.log("📋 Booking data received:", body)

    // Generate booking reference
    const bookingReference = `HKS${Date.now().toString().slice(-8)}`

    // Calculate nights
    const checkIn = new Date(body.checkIn)
    const checkOut = new Date(body.checkOut)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate total amount (simplified pricing)
    const roomPrices: { [key: string]: number } = {
      "Deluxe Mountain View": 8500,
      "Standard Twin Room": 6500,
      "Family Suite": 12000,
      "Economy Single": 4500,
    }

    const basePrice = roomPrices[body.roomType] || 6500
    const totalAmount = basePrice * nights

    const bookingData = {
      booking_reference: bookingReference,
      guest_name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      nationality: body.nationality || null,
      check_in: body.checkIn,
      check_out: body.checkOut,
      room_type: body.roomType,
      guests: Number.parseInt(body.guests),
      nights: nights,
      total_amount: totalAmount,
      currency: "PKR",
      special_requests: body.specialRequests || null,
      purpose_of_visit: body.purposeOfVisit || null,
      payment_method: "cash",
      booking_status: "confirmed",
      payment_status: "pending",
    }

    console.log("💾 Inserting booking data:", bookingData)

    const { data, error } = await supabase.from("bookings").insert([bookingData]).select().single()

    if (error) {
      console.error("❌ Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to create booking", details: error.message }, { status: 500 })
    }

    console.log("✅ Booking created successfully:", data)
    return NextResponse.json({
      success: true,
      booking: data,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
