"use client"

import { useState, useEffect } from "react"
import type { Inquiry } from "@/lib/supabase"

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/inquiries")
      const data = await response.json()

      if (data.success) {
        setInquiries(data.inquiries)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch inquiries")
      console.error("Fetch inquiries error:", err)
    } finally {
      setLoading(false)
    }
  }

  const createInquiry = async (inquiryData: any) => {
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryData),
      })

      const data = await response.json()

      if (data.success) {
        await fetchInquiries() // Refresh the list
        return data.inquiry
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Create inquiry error:", err)
      throw err
    }
  }

  const replyToInquiry = async (id: string, reply: string) => {
    try {
      const response = await fetch(`/api/inquiries/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchInquiries() // Refresh the list
        return data.inquiry
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("Reply to inquiry error:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
    createInquiry,
    replyToInquiry,
  }
}
