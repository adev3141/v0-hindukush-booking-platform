import { type NextRequest, NextResponse } from "next/server"
import { RoomService } from "@/lib/booking-service"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const room = await RoomService.updateRoom(params.id, updates)
    return NextResponse.json({ success: true, room })
  } catch (error) {
    console.error("Update room error:", error)
    return NextResponse.json({ success: false, error: "Failed to update room" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await RoomService.deleteRoom(params.id)
    return NextResponse.json({ success: true, message: "Room deleted successfully" })
  } catch (error) {
    console.error("Delete room error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete room" }, { status: 500 })
  }
}
