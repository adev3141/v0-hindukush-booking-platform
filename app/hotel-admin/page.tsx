"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HotelAdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the rooms page as the default admin page
    router.push("/hotel-admin/rooms")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Redirecting to Admin Dashboard...</h2>
        <p className="text-muted-foreground">Please wait while we load the admin panel.</p>
      </div>
    </div>
  )
}
