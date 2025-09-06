import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const db = getAdminDb()
    const docRef = db.collection("rooms").doc(params.id)
    await docRef.update({ ...updates, updated_at: new Date().toISOString() })
    const doc = await docRef.get()
    const room = { id: docRef.id, ...doc.data() }
    return NextResponse.json({ success: true, room })
  } catch (error) {
    console.error("Update room error:", error)
    return NextResponse.json({ success: false, error: "Failed to update room" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getAdminDb()
    await db.collection("rooms").doc(params.id).delete()
    return NextResponse.json({ success: true, message: "Room deleted successfully" })
  } catch (error) {
    console.error("Delete room error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete room" }, { status: 500 })
  }
}
