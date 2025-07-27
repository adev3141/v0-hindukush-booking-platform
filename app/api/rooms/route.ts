import { type NextRequest, NextResponse } from "next/server"
import { RoomService } from "@/lib/booking-service"

export async function GET() {
  try {
    const rooms = await RoomService.getRooms()
    return NextResponse.json({ success: true, rooms })
  } catch (error) {
    console.error("Get rooms error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const roomData = await request.json()

    // Validate required fields
    const requiredFields = ["number", "type", "capacity", "floor", "price", "currency"]
    for (const field of requiredFields) {
      if (!roomData[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const room = await RoomService.createRoom(roomData)

    return NextResponse.json({
      success: true,
      room,
      message: "Room created successfully",
    })
  } catch (error) {
    console.error("Room creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create room" }, { status: 500 })
  }
}
