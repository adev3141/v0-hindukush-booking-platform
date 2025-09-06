import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reply } = await request.json()

    if (!reply || !reply.trim()) {
      return NextResponse.json({ success: false, error: "Reply message is required" }, { status: 400 })
    }

    const db = getAdminDb()
    const docRef = db.collection("inquiries").doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 })
    }

    await docRef.update({
      reply: reply.trim(),
      status: "replied",
      updated_at: new Date().toISOString(),
    })

    const updated = await docRef.get()

    return NextResponse.json({
      success: true,
      inquiry: { id: docRef.id, ...updated.data() },
      message: "Reply sent successfully",
    })
  } catch (error) {
    console.error("Reply to inquiry error:", error)
    return NextResponse.json({ success: false, error: "Failed to send reply" }, { status: 500 })
  }
}
