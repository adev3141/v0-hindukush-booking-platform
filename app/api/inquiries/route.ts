import { type NextRequest, NextResponse } from "next/server"
import { InquiryService } from "@/lib/booking-service"

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

    const inquiry = await InquiryService.createInquiry(inquiryData)

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
    const inquiries = await InquiryService.getInquiries()
    return NextResponse.json({ success: true, inquiries })
  } catch (error) {
    console.error("Get inquiries error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch inquiries" }, { status: 500 })
  }
}
