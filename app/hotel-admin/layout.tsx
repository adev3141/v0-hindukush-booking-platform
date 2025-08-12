"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Hotel, Inbox, LogOut, Mountain, Settings, Users, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function HotelAdminLayout({ children }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/hotel-admin", icon: Home },
    { name: "Bookings", href: "/hotel-admin/bookings", icon: Calendar },
    { name: "Inquiries", href: "/hotel-admin/inquiries", icon: Inbox },
    { name: "Rooms", href: "/hotel-admin/rooms", icon: Hotel },
    { name: "Guests", href: "/hotel-admin/guests", icon: Users },
    { name: "Settings", href: "/hotel-admin/settings", icon: Settings },
  ]

  const isActive = (path) => {
    if (path === "/hotel-admin") {
      return pathname === "/hotel-admin"
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-semibold">Hindukush Sarai</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">Sarai Admin Panel</div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                    isActive(item.href) ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-emerald-100 text-emerald-800">HM</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">Hotel Manager</div>
              <div className="text-xs text-muted-foreground">manager@hindukushheights.com</div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-semibold">Hindukush Sarai</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Sarai Admin Panel</div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive(item.href) ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-emerald-100 text-emerald-800">HM</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Hotel Manager</div>
                <div className="text-xs text-muted-foreground">manager@hindukushheights.com</div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <h1 className="text-xl font-semibold">
              {navItems.find((item) => isActive(item.href))?.name || "Admin Panel"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/" target="_blank">
                View Website
              </Link>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
