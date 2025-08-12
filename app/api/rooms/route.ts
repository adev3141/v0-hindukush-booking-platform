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
    const requiredFields = ["number", "type", "capacity", "floor", "price", "currency", "amenities"]
    for (const field of requiredFields) {
      if (!roomData[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate capacity
    if (isNaN(Number(roomData.capacity)) || Number(roomData.capacity) < 1 || Number(roomData.capacity) > 10) {
      return NextResponse.json({ success: false, error: "Capacity must be a number between 1 and 10" }, { status: 400 })
    }

    // Validate floor
    if (isNaN(Number(roomData.floor)) || Number(roomData.floor) < 1 || Number(roomData.floor) > 20) {
      return NextResponse.json({ success: false, error: "Floor must be a number between 1 and 20" }, { status: 400 })
    }

    // Validate amenities
    if (!Array.isArray(roomData.amenities) || roomData.amenities.length === 0) {
      return NextResponse.json({ success: false, error: "At least one amenity is required" }, { status: 400 })
    }

    // Create the room
    const room = await RoomService.createRoom({
      number: roomData.number,
      type: roomData.type,
      capacity: Number(roomData.capacity),
      floor: Number(roomData.floor),
      amenities: roomData.amenities,
      status: roomData.status || "available",
      description: roomData.description || "",
      max_occupancy: Number(roomData.capacity),
    })

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
