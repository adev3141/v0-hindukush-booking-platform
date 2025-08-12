"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HotelAdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the rooms page
    router.push("/hotel-admin/rooms")
  }, [router])

  return null
}
