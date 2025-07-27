"use client"

import { useState, useEffect } from "react"

export function useInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching inquiries from API...")

      const response = await fetch("/api/inquiries")
      const data = await response.json()

      console.log("📥 Inquiries API response:", data)

      if (data.success) {
        setInquiries(data.inquiries || [])
        setError(null)
        console.log("✅ Successfully fetched inquiries:", data.inquiries?.length || 0)
      } else {
        setError(data.error)
        console.error("❌ Inquiries API error:", data.error)
      }
    } catch (err) {
      setError("Failed to fetch inquiries")
      console.error("❌ Fetch inquiries error:", err)
    } finally {
      setLoading(false)
    }
  }

  const replyToInquiry = async (id: string, reply: string) => {
    try {
      console.log("🔄 Replying to inquiry:", id, reply)

      const response = await fetch(`/api/inquiries/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      })

      const data = await response.json()
      console.log("📥 Reply inquiry response:", data)

      if (data.success) {
        await fetchInquiries() // Refresh the list
        return data.inquiry
      } else {
        throw new Error(data.error || "Failed to reply to inquiry")
      }
    } catch (err) {
      console.error("❌ Reply inquiry error:", err)
      throw err
    }
  }

  useEffect(() => {
    console.log("🚀 useInquiries hook initialized, fetching inquiries...")
    fetchInquiries()
  }, [])

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
    replyToInquiry,
  }
}
