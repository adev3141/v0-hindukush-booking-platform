"use client"

/**
 * Guest Management Page
 *
 * Features:
 * - Guest profiles derived from booking data
 * - Key metrics like total stays and lifetime revenue
 * - Booking history for each guest
 * - Search and filter capabilities
 * - Guest profile dialog with detailed information
 * - CSV export functionality
 */

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Search, User, Mail, Phone, MapPin, Calendar, DollarSign, Download, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBookings } from "@/hooks/use-bookings"

interface GuestProfile {
  id: string
  name: string
  email: string
  phone?: string
  nationality?: string
  totalStays: number
  totalRevenue: number
  lastStay?: string
  upcomingBookings: number
  bookings: any[]
}

export default function GuestsPage() {
  const { bookings, loading, error } = useBookings()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")

  // Process bookings to create guest profiles
  const guestProfiles = useMemo(() => {
    if (!bookings) return []

    const guestMap = new Map<string, GuestProfile>()

    bookings.forEach((booking) => {
      const email = booking.guest_email
      if (!email) return

      if (!guestMap.has(email)) {
        guestMap.set(email, {
          id: email,
          name: booking.guest_name || "Unknown",
          email: email,
          phone: booking.guest_phone,
          nationality: booking.nationality,
          totalStays: 0,
          totalRevenue: 0,
          upcomingBookings: 0,
          bookings: [],
        })
      }

      const guest = guestMap.get(email)!
      guest.bookings.push(booking)

      // Count completed stays
      if (booking.status === "checked-out") {
        guest.totalStays++
        guest.totalRevenue += Number.parseFloat(booking.total_amount || "0")
      }

      // Count upcoming bookings
      if (["confirmed", "checked-in"].includes(booking.status)) {
        guest.upcomingBookings++
      }

      // Update last stay
      if (booking.status === "checked-out") {
        if (!guest.lastStay || new Date(booking.check_out_date) > new Date(guest.lastStay)) {
          guest.lastStay = booking.check_out_date
        }
      }
    })

    return Array.from(guestMap.values())
  }, [bookings])

  // Filter guests
  const filteredGuests = useMemo(() => {
    return guestProfiles.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone?.includes(searchTerm)

      const matchesFilter =
        filterType === "all" ||
        (filterType === "upcoming" && guest.upcomingBookings > 0) ||
        (filterType === "returning" && guest.totalStays > 1)

      return matchesSearch && matchesFilter
    })
  }, [guestProfiles, searchTerm, filterType])

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Nationality", "Total Stays", "Total Revenue", "Last Stay", "Upcoming Bookings"],
      ...filteredGuests.map((guest) => [
        guest.name,
        guest.email,
        guest.phone || "",
        guest.nationality || "",
        guest.totalStays,
        guest.totalRevenue,
        guest.lastStay ? format(new Date(guest.lastStay), "yyyy-MM-dd") : "",
        guest.upcomingBookings,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `guests-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading guest data: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Guests</h1>
          <p className="text-gray-600">Manage guest profiles and booking history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestProfiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Guests</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestProfiles.filter((g) => g.totalStays > 1).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Stays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestProfiles.reduce((sum, g) => sum + g.upcomingBookings, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${guestProfiles.reduce((sum, g) => sum + g.totalRevenue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filterType} onValueChange={setFilterType}>
            <TabsList>
              <TabsTrigger value="all">All Guests</TabsTrigger>
              <TabsTrigger value="upcoming">With Upcoming Stays</TabsTrigger>
              <TabsTrigger value="returning">Returning Guests</TabsTrigger>
            </TabsList>

            <TabsContent value={filterType} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Total Stays</TableHead>
                      <TableHead>Last Stay</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Upcoming</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No guests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGuests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                              <div>
                                <div className="font-medium">{guest.name}</div>
                                <div className="text-sm text-gray-500">{guest.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {guest.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  {guest.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {guest.nationality && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {guest.nationality}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{guest.totalStays}</Badge>
                          </TableCell>
                          <TableCell>
                            {guest.lastStay ? format(new Date(guest.lastStay), "MMM dd, yyyy") : "Never"}
                          </TableCell>
                          <TableCell>${guest.totalRevenue.toLocaleString()}</TableCell>
                          <TableCell>
                            {guest.upcomingBookings > 0 && (
                              <Badge className="bg-blue-100 text-blue-800">{guest.upcomingBookings}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedGuest(guest)
                                setDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Guest Profile Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guest Profile</DialogTitle>
            <DialogDescription>Complete profile and booking history for {selectedGuest?.name}</DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-6">
              {/* Guest Information */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedGuest.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedGuest.email}</span>
                    </div>
                    {selectedGuest.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedGuest.phone}</span>
                      </div>
                    )}
                    {selectedGuest.nationality && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedGuest.nationality}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Guest Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Stays:</span>
                      <Badge variant="secondary">{selectedGuest.totalStays}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Lifetime Revenue:</span>
                      <span className="font-semibold">${selectedGuest.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upcoming Bookings:</span>
                      <Badge className="bg-blue-100 text-blue-800">{selectedGuest.upcomingBookings}</Badge>
                    </div>
                    {selectedGuest.lastStay && (
                      <div className="flex justify-between">
                        <span>Last Stay:</span>
                        <span>{format(new Date(selectedGuest.lastStay), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Booking History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking History</CardTitle>
                  <CardDescription>All bookings for this guest ({selectedGuest.bookings.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Room Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedGuest.bookings
                          .sort((a, b) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime())
                          .map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>#{booking.id}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {format(new Date(booking.check_in_date), "MMM dd")} -{" "}
                                  {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                                </div>
                              </TableCell>
                              <TableCell>{booking.room_type}</TableCell>
                              <TableCell>
                                <Badge
                                  className={`
                                  ${booking.status === "confirmed" ? "bg-blue-100 text-blue-800" : ""}
                                  ${booking.status === "checked-in" ? "bg-green-100 text-green-800" : ""}
                                  ${booking.status === "checked-out" ? "bg-gray-100 text-gray-800" : ""}
                                  ${booking.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                                  ${booking.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                `}
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>${booking.total_amount}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
