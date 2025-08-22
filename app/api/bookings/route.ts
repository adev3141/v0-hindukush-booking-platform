import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("=== API ROUTE ENVIRONMENT CHECK ===")
console.log("SUPABASE_URL:", supabaseUrl)
console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey)
console.log("SUPABASE_ANON_KEY length:", supabaseAnonKey?.length || 0)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables")
}

// Create Supabase client
const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: false,
  },
})

export async function GET() {
  console.log("=== GET BOOKINGS API CALLED ===")

  try {
    console.log("🔍 Testing Supabase connection...")

    // Test connection first
    const { data: testData, error: testError } = await supabase.from("bookings").select("count").limit(1)

    if (testError) {
      console.error("❌ Supabase connection test failed:", testError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: testError.message,
          supabaseError: testError,
        },
        { status: 500 },
      )
    }

    console.log("✅ Supabase connection successful")

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching bookings:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch bookings",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`✅ Retrieved ${bookings?.length || 0} bookings`)
    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    console.error("❌ GET API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  console.log("=== POST BOOKING API CALLED ===")
  console.log("Timestamp:", new Date().toISOString())

  try {
    // Parse request body
    const body = await request.json()
    console.log("📥 Received booking data:", JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "phone", "checkIn", "checkOut", "roomType"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields)
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Validate dates
    const checkIn = new Date(body.checkIn)
    const checkOut = new Date(body.checkOut)

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      console.error("❌ Invalid dates:", { checkIn: body.checkIn, checkOut: body.checkOut })
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format",
        },
        { status: 400 },
      )
    }

    if (checkOut <= checkIn) {
      console.error("❌ Check-out date must be after check-in date")
      return NextResponse.json(
        {
          success: false,
          error: "Check-out date must be after check-in date",
        },
        { status: 400 },
      )
    }

    // Test Supabase connection before proceeding
    console.log("🔍 Testing Supabase connection...")
    try {
      const { data: testData, error: testError } = await supabase.from("bookings").select("count").limit(1)

      if (testError) {
        console.error("❌ Supabase connection test failed:", testError)
        return NextResponse.json(
          {
            success: false,
            error: "Database connection failed",
            details: testError.message,
            supabaseError: testError,
          },
          { status: 500 },
        )
      }

      console.log("✅ Supabase connection test successful")
    } catch (connectionError) {
      console.error("❌ Connection test threw error:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error",
          details: connectionError instanceof Error ? connectionError.message : "Unknown connection error",
        },
        { status: 500 },
      )
    }

    // Generate booking reference
    const bookingReference = `HK${Date.now().toString().slice(-6)}`

    // Calculate nights and total amount
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const roomPrices: { [key: string]: number } = {
      "Deluxe Room": 8000,
      "Standard Room": 6000,
      "Budget Room": 4000,
      "Family Suite": 12000,
    }
    const basePrice = roomPrices[body.roomType] || 6000
    const totalAmount = basePrice * nights

    // Prepare booking data for database
    const bookingData = {
      booking_reference: bookingReference,
      guest_name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      nationality: body.nationality || null,
      check_in: body.checkIn,
      check_out: body.checkOut,
      room_type: body.roomType,
      guests: body.guests || 1,
      nights: nights,
      total_amount: totalAmount,
      currency: "PKR",
      payment_status: "pending",
      status: "confirmed",
      special_requests: body.specialRequests || null,
      purpose_of_visit: body.purposeOfVisit || null,
      payment_method: null,
    }

    console.log("📋 Prepared booking data:", JSON.stringify(bookingData, null, 2))

    // Insert booking into Supabase
    console.log("💾 Inserting booking into database...")
    const { data, error } = await supabase.from("bookings").insert([bookingData]).select().single()

    if (error) {
      console.error("❌ Supabase insert error:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create booking",
          details: error.message,
          supabaseError: error,
        },
        { status: 500 },
      )
    }

    console.log("✅ Booking created successfully:", data)

    return NextResponse.json({
      success: true,
      booking: data,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("❌ API error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
