"use client"

/**
 * Admin Guests Page
 *
 * Data sources:
 * - Derived from bookings data via GET /api/bookings
 * - Computes guest metrics like total stays and lifetime revenue
 *
 * Features:
 * - Table view of all guests with key metrics
 * - Search by name, email, phone
 * - Filter by upcoming bookings
 * - View guest profile with booking history
 * - Export guest data as CSV
 */

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  MoreHorizontal,
  Search,
  User,
  Users,
  Flag,
  Phone,
  Loader2,
  XCircle,
  PlusCircle,
} from "lucide-react"
import { format, parseISO, isAfter, isBefore } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useBookings } from "@/hooks/use-bookings"

// Page size for pagination
const PAGE_SIZE = 20

export default function AdminGuestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { bookings, loading, error } = useBookings()

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog states
  const [showGuestProfileDialog, setShowGuestProfileDialog] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)

  // Process bookings to get unique guests with metrics
  const guests = useMemo(() => {
    if (!bookings || bookings.length === 0) return []

    const guestMap = new Map()

    bookings.forEach((booking) => {
      const { guest_name, email, phone, nationality, total_amount, check_in, check_out, booking_status } = booking

      // Skip if missing key information
      if (!guest_name || !email) return

      const key = email.toLowerCase()

      if (!guestMap.has(key)) {
        guestMap.set(key, {
          name: guest_name,
          email: email,
          phone: phone || "N/A",
          nationality: nationality || "N/A",
          totalStays: 0,
          lastStay: null,
          upcomingStay: null,
          lifetimeRevenue: 0,
          bookings: [],
        })
      }

      const guest = guestMap.get(key)

      // Only count completed or current stays
      if (booking_status === "checked-out" || booking_status === "checked-in") {
        guest.totalStays++
      }

      // Track revenue from paid bookings
      if (booking.payment_status === "paid") {
        guest.lifetimeRevenue += Number.parseFloat(total_amount) || 0
      }

      // Track last stay
      const checkInDate = parseISO(check_in)
      const today = new Date()

      if (!guest.lastStay || (isBefore(parseISO(guest.lastStay), checkInDate) && !isAfter(checkInDate, today))) {
        guest.lastStay = check_in
      }

      // Track upcoming stay
      if (isAfter(checkInDate, today) && booking_status !== "cancelled") {
        if (!guest.upcomingStay || isBefore(checkInDate, parseISO(guest.upcomingStay))) {
          guest.upcomingStay = check_in
        }
      }

      // Add booking to guest's bookings
      guest.bookings.push(booking)
    })

    return Array.from(guestMap.values())
  }, [bookings])

  // Filter guests based on search query and filters
  const filteredGuests = guests
    ? guests.filter((guest) => {
        // Filter by search query
        const matchesSearch =
          !searchQuery ||
          guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.phone.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter by upcoming bookings
        const matchesUpcoming = !showUpcomingOnly || guest.upcomingStay

        return matchesSearch && matchesUpcoming
      })
    : []

  // Sort guests by name
  const sortedGuests = [...filteredGuests].sort((a, b) => a.name.localeCompare(b.name))

  // Paginate guests
  const totalPages = Math.ceil(sortedGuests.length / PAGE_SIZE)
  const paginatedGuests = sortedGuests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, showUpcomingOnly])

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (error) {
      return "N/A"
    }
  }

  // View guest profile
  const handleViewGuestProfile = (guest) => {
    setSelectedGuest(guest)
    setShowGuestProfileDialog(true)
  }

  // Start new booking for guest
  const handleNewBooking = (guest) => {
    // In a real application, you would redirect to the booking form with pre-filled guest information
    toast({
      title: "New Booking",
      description: `Starting new booking for ${guest.name}`,
    })
    // Example: router.push(`/admin/bookings/new?email=${encodeURIComponent(guest.email)}`)
  }

  // Export guests as CSV
  const exportGuestsCSV = () => {
    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Nationality",
      "Total Stays",
      "Last Stay",
      "Upcoming Stay",
      "Lifetime Revenue",
    ]
    const csvContent = [
      headers.join(","),
      ...sortedGuests.map((guest) =>
        [
          `"${guest.name}"`,
          guest.email,
          guest.phone,
          `"${guest.nationality}"`,
          guest.totalStays,
          guest.lastStay ? formatDate(guest.lastStay) : "N/A",
          guest.upcomingStay ? formatDate(guest.upcomingStay) : "N/A",
          guest.lifetimeRevenue.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `guests_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Guests</h1>
          <p className="text-muted-foreground">Manage guest profiles and view booking history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportGuestsCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="upcoming-filter"
              checked={showUpcomingOnly}
              onCheckedChange={(checked) => setShowUpcomingOnly(!!checked)}
            />
            <Label htmlFor="upcoming-filter">Show guests with upcoming bookings only</Label>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-10 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading guests...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium">Failed to load guests</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : paginatedGuests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No guests found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : showUpcomingOnly
                    ? "No guests with upcoming bookings"
                    : "No guest records available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Total Stays</TableHead>
                    <TableHead>Last Stay</TableHead>
                    <TableHead>Lifetime Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGuests.map((guest, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.phone}</TableCell>
                      <TableCell>{guest.nationality}</TableCell>
                      <TableCell>{guest.totalStays}</TableCell>
                      <TableCell>
                        {guest.lastStay ? formatDate(guest.lastStay) : "N/A"}
                        {guest.upcomingStay && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">Upcoming</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {guest.lifetimeRevenue > 0 ? `PKR ${guest.lifetimeRevenue.toFixed(2)}` : "No revenue"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewGuestProfile(guest)}>
                              <User className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNewBooking(guest)}>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              New Booking
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => (window.location.href = `mailto:${guest.email}`)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, sortedGuests.length)} of{" "}
              {sortedGuests.length} guests
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Guest Profile Dialog */}
      <Dialog open={showGuestProfileDialog} onOpenChange={setShowGuestProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guest Profile</DialogTitle>
            <DialogDescription>Detailed information and booking history for {selectedGuest?.name}</DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedGuest.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedGuest.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedGuest.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedGuest.nationality}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Guest Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Stays</p>
                        <p className="text-2xl font-bold">{selectedGuest.totalStays}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Lifetime Revenue</p>
                        <p className="text-2xl font-bold">PKR {selectedGuest.lifetimeRevenue.toFixed(2)}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Last Stay</p>
                        <p className="text-lg font-medium">
                          {selectedGuest.lastStay ? formatDate(selectedGuest.lastStay) : "N/A"}
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Upcoming Stay</p>
                        <p className="text-lg font-medium">
                          {selectedGuest.upcomingStay ? formatDate(selectedGuest.upcomingStay) : "None"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Booking History</h3>
                  <div className="space-y-3">
                    {selectedGuest.bookings.length === 0 ? (
                      <p className="text-muted-foreground">No booking history available.</p>
                    ) : (
                      <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="past">Past</TabsTrigger>
                          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-4">
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {selectedGuest.bookings
                              .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
                              .map((booking) => (
                                <BookingHistoryCard key={booking.id} booking={booking} />
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="past" className="mt-4">
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {selectedGuest.bookings
                              .filter((booking) => new Date(booking.check_out) < new Date())
                              .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
                              .map((booking) => (
                                <BookingHistoryCard key={booking.id} booking={booking} />
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="upcoming" className="mt-4">
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {selectedGuest.bookings
                              .filter(
                                (booking) =>
                                  new Date(booking.check_in) > new Date() && booking.booking_status !== "cancelled",
                              )
                              .sort((a, b) => new Date(a.check_in) - new Date(b.check_in))
                              .map((booking) => (
                                <BookingHistoryCard key={booking.id} booking={booking} />
                              ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGuestProfileDialog(false)}>
              Close
            </Button>
            {selectedGuest && (
              <Button onClick={() => handleNewBooking(selectedGuest)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Booking History Card Component
function BookingHistoryCard({ booking }) {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      "checked-in": "bg-green-100 text-green-800 border-green-200",
      "checked-out": "bg-purple-100 text-purple-800 border-purple-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }

    return <Badge className={statusStyles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{booking.booking_reference}</CardTitle>
            <CardDescription>{booking.room_type}</CardDescription>
          </div>
          {getStatusBadge(booking.booking_status)}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Check-in</p>
            <p>{formatDate(booking.check_in)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-out</p>
            <p>{formatDate(booking.check_out)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Guests</p>
            <p>{booking.guests}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p>
              {booking.currency} {booking.total_amount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
