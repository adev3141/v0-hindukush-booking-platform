import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching room pricing...")

    const { data: pricing, error } = await supabase
      .from("room_pricing")
      .select("*")
      .order("room_type", { ascending: true })

    if (error) {
      console.error("❌ Supabase pricing fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch pricing", details: error.message }, { status: 500 })
    }

    console.log("✅ Pricing fetched successfully:", pricing?.length || 0, "records")

    return NextResponse.json({
      success: true,
      pricing: pricing || [],
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

    // Check if pricing exists for this room type
    const { data: existingPricing, error: fetchError } = await supabase
      .from("room_pricing")
      .select("*")
      .eq("room_type", roomType)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("❌ Error checking existing pricing:", fetchError)
      return NextResponse.json(
        { error: "Failed to check existing pricing", details: fetchError.message },
        { status: 500 },
      )
    }

    let result
    if (existingPricing) {
      // Update existing pricing
      const { data, error } = await supabase
        .from("room_pricing")
        .update({
          base_price: basePrice,
          currency,
          updated_at: new Date().toISOString(),
        })
        .eq("room_type", roomType)
        .select()
        .single()

      if (error) {
        console.error("❌ Error updating pricing:", error)
        return NextResponse.json({ error: "Failed to update pricing", details: error.message }, { status: 500 })
      }
      result = data
    } else {
      // Create new pricing
      const { data, error } = await supabase
        .from("room_pricing")
        .insert([
          {
            room_type: roomType,
            base_price: basePrice,
            currency,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("❌ Error creating pricing:", error)
        return NextResponse.json({ error: "Failed to create pricing", details: error.message }, { status: 500 })
      }
      result = data
    }

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
