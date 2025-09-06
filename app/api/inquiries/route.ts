import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const inquiryData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "email", "message"]
    for (const field of requiredFields) {
      if (!inquiryData[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const db = getAdminDb()
    const docRef = await db.collection("inquiries").add({
      ...inquiryData,
      status: "new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    const doc = await docRef.get()
    const inquiry = { id: docRef.id, ...doc.data() }

    return NextResponse.json({
      success: true,
      inquiry,
      message: "Inquiry submitted successfully",
    })
  } catch (error) {
    console.error("Inquiry creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create inquiry" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = getAdminDb()
    const snapshot = await db.collection("inquiries").orderBy("created_at", "desc").get()
    const inquiries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, inquiries })
  } catch (error) {
    console.error("Get inquiries error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch inquiries" }, { status: 500 })
  }
}
