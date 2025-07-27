import { type NextRequest, NextResponse } from "next/server"
import { BookingService } from "@/lib/booking-service"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let bookingData
    try {
      bookingData = await request.json()
    } catch (error) {
      console.error("Invalid JSON in request body:", error)
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = [
      "guest_name",
      "email",
      "phone",
      "check_in",
      "check_out",
      "room_type",
      "guests",
      "total_amount",
    ]

    const missingFields = requiredFields.filter((field) => !bookingData[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Validate data types
    if (typeof bookingData.guests !== "number" || bookingData.guests < 1) {
      return NextResponse.json({ success: false, error: "Guests must be a positive number" }, { status: 400 })
    }

    if (typeof bookingData.total_amount !== "number" || bookingData.total_amount < 0) {
      return NextResponse.json({ success: false, error: "Total amount must be a positive number" }, { status: 400 })
    }

    // Validate dates
    const checkIn = new Date(bookingData.check_in)
    const checkOut = new Date(bookingData.check_out)

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 })
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ success: false, error: "Check-out date must be after check-in date" }, { status: 400 })
    }

    // Check availability
    try {
      const availableRooms = await BookingService.checkAvailability(
        bookingData.check_in,
        bookingData.check_out,
        bookingData.room_type,
      )

      if (availableRooms.length === 0) {
        return NextResponse.json({ success: false, error: "No rooms available for selected dates" }, { status: 400 })
      }

      // Assign a room if not specified
      if (!bookingData.room_id && availableRooms.length > 0) {
        bookingData.room_id = availableRooms[0].id
        bookingData.room_number = availableRooms[0].number
      }
    } catch (availabilityError) {
      console.error("Availability check error:", availabilityError)
      return NextResponse.json({ success: false, error: "Failed to check room availability" }, { status: 500 })
    }

    // Set default values
    bookingData.currency = bookingData.currency || "USD"
    bookingData.payment_method = bookingData.payment_method || "cash"
    bookingData.payment_status = bookingData.payment_method === "cash" ? "pending" : "paid"
    bookingData.booking_status = "confirmed"

    // Create booking
    const booking = await BookingService.createBooking(bookingData)

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Booking creation error:", error)

    // Handle specific Supabase errors
    if (error && typeof error === "object" && "message" in error) {
      return NextResponse.json({ success: false, error: `Database error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: false, error: "Failed to create booking. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const bookings = await BookingService.getBookings()
    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    console.error("Get bookings error:", error)

    if (error && typeof error === "object" && "message" in error) {
      return NextResponse.json({ success: false, error: `Database error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
