import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: pricing, error } = await supabaseAdmin.from("room_pricing").select("*").order("room_type")

    if (error) {
      console.error("Error fetching pricing:", error)
      return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
    }

    return NextResponse.json(pricing)
  } catch (error) {
    console.error("Error in pricing GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Define room type mappings
    const roomTypes = [
      { key: "standard_room_base_price", type: "Standard Room" },
      { key: "deluxe_room_base_price", type: "Deluxe Room" },
      { key: "family_suite_base_price", type: "Family Suite" },
      { key: "executive_suite_base_price", type: "Executive Suite" },
    ]

    // Update each room type pricing
    for (const roomType of roomTypes) {
      if (body[roomType.key] !== undefined) {
        const { error } = await supabaseAdmin.from("room_pricing").upsert(
          {
            room_type: roomType.type,
            base_price: body[roomType.key],
            currency: body.currency || "USD",
            weekend_multiplier: body.weekend_multiplier || 1.0,
            season_multiplier: body.season_multiplier || 1.0,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "room_type",
          },
        )

        if (error) {
          console.error(`Error updating pricing for ${roomType.type}:`, error)
          return NextResponse.json({ error: `Failed to update pricing for ${roomType.type}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ message: "Pricing updated successfully" })
  } catch (error) {
    console.error("Error in pricing PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
