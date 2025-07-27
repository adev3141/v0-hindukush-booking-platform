import { type NextRequest, NextResponse } from "next/server"
import { BookingService } from "@/lib/booking-service"

export async function POST(request: NextRequest) {
  try {
    const { checkIn, checkOut, roomType } = await request.json()

    if (!checkIn || !checkOut) {
      return NextResponse.json({ success: false, error: "Check-in and check-out dates are required" }, { status: 400 })
    }

    const availableRooms = await BookingService.checkAvailability(checkIn, checkOut, roomType)

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
    const summary = await BookingService.getRoomAvailabilitySummary()
    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error("Get availability summary error:", error)
    return NextResponse.json({ success: false, error: "Failed to get availability summary" }, { status: 500 })
  }
}
