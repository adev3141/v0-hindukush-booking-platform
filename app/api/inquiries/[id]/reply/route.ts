import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reply } = await request.json()

    if (!reply || !reply.trim()) {
      return NextResponse.json({ success: false, error: "Reply message is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .update({
        reply: reply.trim(),
        status: "replied",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      inquiry: data[0],
      message: "Reply sent successfully",
    })
  } catch (error) {
    console.error("Reply to inquiry error:", error)
    return NextResponse.json({ success: false, error: "Failed to send reply" }, { status: 500 })
  }
}
