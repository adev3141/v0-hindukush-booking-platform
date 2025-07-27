import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "")

export async function GET() {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    console.log("Received booking data:", body)

    // Validate required fields
    const requiredFields = ["guest_name", "email", "phone", "room_type", "check_in", "check_out"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      )
    }

    // Generate booking reference
    const bookingReference = `HH${Date.now().toString().slice(-6)}`

    // Prepare booking data
    const bookingData = {
      booking_reference: bookingReference,
      guest_name: body.guest_name,
      email: body.email,
      phone: body.phone,
      check_in: body.check_in,
      check_out: body.check_out,
      room_type: body.room_type,
      room_number: body.room_number || "TBD",
      guests: body.guests || 1,
      total_amount: body.total_amount || 0,
      currency: body.currency || "PKR",
      payment_method: body.payment_method || "cash",
      payment_status: body.payment_status || "pending",
      booking_status: body.booking_status || "confirmed",
      special_requests: body.special_requests || null,
    }

    console.log("Inserting booking data:", bookingData)

    // Insert booking into Supabase
    const { data: booking, error } = await supabase.from("bookings").insert([bookingData]).select().single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ success: false, error: `Database error: ${error.message}` }, { status: 500 })
    }

    console.log("Booking created successfully:", booking)

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
