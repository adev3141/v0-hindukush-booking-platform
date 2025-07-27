import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Environment variable debugging
console.log("=== ENVIRONMENT VARIABLES DEBUG ===")
console.log("NODE_ENV:", process.env.NODE_ENV)

// Initialize Supabase client with ANON key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("=== SUPABASE CONFIGURATION CHECK ===")
console.log("SUPABASE_URL exists:", !!supabaseUrl)
console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey)
console.log("SUPABASE_URL value:", supabaseUrl)
console.log("SUPABASE_ANON_KEY first 20 chars:", supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + "..." : "MISSING")
console.log("SUPABASE_ANON_KEY length:", supabaseAnonKey ? supabaseAnonKey.length : 0)

// Validate environment variables
if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing!")
}
if (!supabaseAnonKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!")
}

// Create Supabase client with ANON key
let supabase: any = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log("✅ Supabase client created successfully with ANON key")
  } else {
    console.error("❌ Cannot create Supabase client - missing credentials")
  }
} catch (error) {
  console.error("❌ Failed to create Supabase client:", error)
}

export async function POST(request: NextRequest) {
  console.log("=== BOOKING API CALLED ===")
  console.log("Timestamp:", new Date().toISOString())

  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      console.error("❌ Supabase client not initialized")
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
          details: "Supabase client initialization failed",
          debug: {
            supabaseUrl: !!supabaseUrl,
            supabaseAnonKey: !!supabaseAnonKey,
            urlValue: supabaseUrl,
            keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
          },
        },
        { status: 500 },
      )
    }

    // Parse request body
    const body = await request.json()
    console.log("📥 Received booking request:", JSON.stringify(body, null, 2))

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

    // Prepare booking data for database - MATCH THE EXISTING SCHEMA
    const bookingData = {
      booking_reference: bookingReference,
      guest_name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      check_in: body.checkIn,
      check_out: body.checkOut,
      room_type: body.roomType,
      guests: body.guests || 1,
      total_amount: totalAmount,
      currency: "PKR",
      payment_status: "pending",
      booking_status: "confirmed",
      special_requests: body.specialRequests || null,
      purpose_of_visit: body.purposeOfVisit || null,
      payment_method: null,
      created_at: new Date().toISOString(),
    }

    console.log("📋 Prepared booking data:", JSON.stringify(bookingData, null, 2))

    // Test Supabase connection first
    console.log("🔍 Testing Supabase connection...")
    try {
      const { data: testData, error: testError } = await supabase.from("bookings").select("id").limit(1)

      if (testError) {
        console.error("❌ Supabase connection test failed:", testError)
        console.error("Error details:", {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code,
        })

        return NextResponse.json(
          {
            success: false,
            error: "Database connection failed",
            details: testError.message,
            supabaseError: testError,
            debug: {
              supabaseUrl: !!supabaseUrl,
              supabaseAnonKey: !!supabaseAnonKey,
              urlValue: supabaseUrl,
              keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
              keyStart: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) : "MISSING",
            },
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

export async function GET() {
  console.log("=== GET BOOKINGS API CALLED ===")

  try {
    if (!supabase) {
      console.error("❌ Supabase client not initialized for GET request")
      return NextResponse.json(
        {
          error: "Database not configured",
        },
        { status: 500 },
      )
    }

    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Supabase GET error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch bookings",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`✅ Retrieved ${data?.length || 0} bookings`)
    return NextResponse.json({ bookings: data })
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
