"use client"

import { useState, useEffect } from "react"
import type { Inquiry } from "@/lib/types"

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInquiries = async () => {
    console.log("🔍 Fetching inquiries...")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/inquiries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      })

      console.log("📡 Inquiries API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to fetch inquiries:", errorData)
        throw new Error(errorData.error || "Failed to fetch inquiries")
      }

      const data = await response.json()
      console.log("📋 Inquiries data received:", data)

      const inquiriesArray = data.inquiries || data || []
      setInquiries(inquiriesArray)
      console.log(`✅ Successfully loaded ${inquiriesArray.length} inquiries`)
    } catch (err) {
      console.error("❌ Error fetching inquiries:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch inquiries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const refetch = () => {
    fetchInquiries()
  }

  return {
    inquiries,
    loading,
    error,
    refetch,
  }
}
