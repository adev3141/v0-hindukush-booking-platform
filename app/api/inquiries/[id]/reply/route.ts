import { type NextRequest, NextResponse } from "next/server"
import { InquiryService } from "@/lib/booking-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reply } = await request.json()

    if (!reply || !reply.trim()) {
      return NextResponse.json({ success: false, error: "Reply message is required" }, { status: 400 })
    }

    const inquiry = await InquiryService.replyToInquiry(params.id, reply.trim())

    return NextResponse.json({
      success: true,
      inquiry,
      message: "Reply sent successfully",
    })
  } catch (error) {
    console.error("Reply to inquiry error:", error)
    return NextResponse.json({ success: false, error: "Failed to send reply" }, { status: 500 })
  }
}
