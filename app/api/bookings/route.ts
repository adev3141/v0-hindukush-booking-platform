import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl || "", supabaseKey || "")

export async function GET() {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch bookings", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    console.log("Received booking data:", body)

    // Validate required fields
    const requiredFields = ["checkIn", "checkOut", "guests", "roomType", "name", "email"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Validate dates
    const checkIn = new Date(body.checkIn)
    const checkOut = new Date(body.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      return NextResponse.json({ error: "Check-in date cannot be in the past" }, { status: 400 })
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "Check-out date must be after check-in date" }, { status: 400 })
    }

    // Calculate total nights and price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const roomPrices = {
      deluxe: 120,
      suite: 180,
      family: 200,
    }
    const totalPrice = nights * (roomPrices[body.roomType as keyof typeof roomPrices] || 120)

    // Insert booking into database
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          check_in: body.checkIn,
          check_out: body.checkOut,
          guests: Number.parseInt(body.guests),
          room_type: body.roomType,
          guest_name: body.name,
          guest_email: body.email,
          guest_phone: body.phone || "",
          special_requests: body.specialRequests || "",
          total_price: totalPrice,
          status: body.status || "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to create booking", details: error.message }, { status: 500 })
    }

    console.log("Booking created successfully:", data[0])

    return NextResponse.json({
      success: true,
      booking: data[0],
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
