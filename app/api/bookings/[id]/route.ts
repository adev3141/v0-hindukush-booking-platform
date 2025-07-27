import { type NextRequest, NextResponse } from "next/server"
import { BookingService } from "@/lib/booking-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await BookingService.getBookingById(params.id)
    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Get booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const booking = await BookingService.updateBooking(params.id, updates)
    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get("reason")

    await BookingService.cancelBooking(params.id, reason || undefined)
    return NextResponse.json({ success: true, message: "Booking cancelled successfully" })
  } catch (error) {
    console.error("Cancel booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to cancel booking" }, { status: 500 })
  }
}
