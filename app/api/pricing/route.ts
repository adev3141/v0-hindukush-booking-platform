import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function GET() {
  try {
    console.log("🔍 Fetching room pricing...")

    const db = getAdminDb()
    const snapshot = await db.collection("room_pricing").orderBy("room_type").get()
    const pricing = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

    console.log("✅ Pricing fetched successfully:", pricing.length, "records")

    return NextResponse.json({
      success: true,
      pricing,
    })
  } catch (error) {
    console.error("❌ Pricing API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomType, basePrice, currency = "PKR" } = body

    if (!roomType || !basePrice) {
      return NextResponse.json({ error: "Room type and base price are required" }, { status: 400 })
    }

    console.log("💰 Updating room pricing:", { roomType, basePrice, currency })

    const db = getAdminDb()
    const docRef = db.collection("room_pricing").doc(roomType)
    await docRef.set(
      {
        room_type: roomType,
        base_price: basePrice,
        currency,
        updated_at: new Date().toISOString(),
      },
      { merge: true },
    )
    const doc = await docRef.get()
    const result = { id: docRef.id, ...doc.data() }

    console.log("✅ Pricing updated successfully:", result)

    return NextResponse.json({
      success: true,
      pricing: result,
    })
  } catch (error) {
    console.error("❌ Pricing update API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
