import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = getAdminDb()
    const snapshot = await db.collection("rooms").orderBy("type").orderBy("number").get()
    const rooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
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

    // Validate room number format
    if (!/^[A-Z0-9\s]{1,10}$/i.test(roomData.number)) {
      return NextResponse.json(
        { success: false, error: "Room number must be 1-10 alphanumeric characters" },
        { status: 400 },
      )
    }

    // Validate capacity
    if (isNaN(Number(roomData.capacity)) || Number(roomData.capacity) < 1 || Number(roomData.capacity) > 10) {
      return NextResponse.json({ success: false, error: "Capacity must be a number between 1 and 10" }, { status: 400 })
    }

    // Validate floor
    if (isNaN(Number(roomData.floor)) || Number(roomData.floor) < 1 || Number(roomData.floor) > 20) {
      return NextResponse.json({ success: false, error: "Floor must be a number between 1 and 20" }, { status: 400 })
    }

    // Validate price
    if (isNaN(Number(roomData.price)) || Number(roomData.price) <= 0) {
      return NextResponse.json({ success: false, error: "Price must be a positive number" }, { status: 400 })
    }

    // Validate amenities
    if (!Array.isArray(roomData.amenities) || roomData.amenities.length === 0) {
      return NextResponse.json({ success: false, error: "At least one amenity is required" }, { status: 400 })
    }

    // Validate currency
    if (!["PKR", "USD"].includes(roomData.currency)) {
      return NextResponse.json({ success: false, error: "Currency must be PKR or USD" }, { status: 400 })
    }

    // Create the room
    const db = getAdminDb()
    const docRef = await db.collection("rooms").add({
      number: roomData.number,
      type: roomData.type,
      capacity: Number(roomData.capacity),
      floor: Number(roomData.floor),
      amenities: roomData.amenities,
      status: roomData.status || "available",
      description: roomData.description || "",
      max_occupancy: Number(roomData.capacity),
      price: Number(roomData.price),
      currency: roomData.currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    const doc = await docRef.get()
    const room = { id: docRef.id, ...doc.data() }

    return NextResponse.json({
      success: true,
      room,
      message: "Room created successfully",
    })
  } catch (error) {
    console.error("Room creation error:", error)

    // Handle specific database errors
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ success: false, error: "Room number already exists" }, { status: 409 })
    }

    return NextResponse.json({ success: false, error: "Failed to create room" }, { status: 500 })
  }
}
