"use client"

/**
 * Admin Bookings Page
 *
 * Data sources:
 * - GET /api/bookings - List all bookings with optional filters
 * - GET/PUT/DELETE /api/bookings/[id] - Get, update, or delete a specific booking
 *
 * Features:
 * - Table view with sorting and filtering
 * - Search by guest name, booking reference, email
 * - Status-based tabs (All, Confirmed, Checked-in, Checked-out, Cancelled)
 * - Actions: View, Edit, Check-in, Check-out, Send Confirmation Email, Cancel
 * - Pagination (client-side)
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Mail,
  MoreHorizontal,
  Search,
  Trash,
  User,
  XCircle,
  LogIn,
  LogOut,
  Edit,
  Loader2,
} from "lucide-react"
import { format, parseISO, isAfter, addDays } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

import { useBookings } from "@/hooks/use-bookings"
import { useRooms } from "@/hooks/use-rooms"

// Page size for pagination
const PAGE_SIZE = 20

export default function AdminBookingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { bookings, loading, error, updateBooking, cancelBooking } = useBookings()
  const { rooms } = useRooms()

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Form states
  const [editFormData, setEditFormData] = useState({
    guest_name: "",
    email: "",
    phone: "",
    nationality: "",
    check_in: "",
    check_out: "",
    room_type: "",
    room_number: "",
    guests: 1,
    special_requests: "",
    purpose_of_visit: "",
    payment_status: "",
    booking_status: "",
  })

  const [cancelReason, setCancelReason] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [checkInNotes, setCheckInNotes] = useState("")
  const [checkOutNotes, setCheckOutNotes] = useState("")
  const [formErrors, setFormErrors] = useState({})

  // Filter bookings based on search query and active tab
  const filteredBookings = bookings
    ? bookings.filter((booking) => {
        // Filter by search query
        const matchesSearch =
          !searchQuery ||
          booking.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.email.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter by status tab
        const matchesTab =
          activeTab === "all" ||
          (activeTab === "confirmed" && booking.booking_status === "confirmed") ||
          (activeTab === "checked-in" && booking.booking_status === "checked-in") ||
          (activeTab === "checked-out" && booking.booking_status === "checked-out") ||
          (activeTab === "cancelled" && booking.booking_status === "cancelled")

        return matchesSearch && matchesTab
      })
    : []

  // Sort bookings by check-in date (most recent first)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
  })

  // Paginate bookings
  const totalPages = Math.ceil(sortedBookings.length / PAGE_SIZE)
  const paginatedBookings = sortedBookings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Helper function to get status badge
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

  // Helper function to get payment status badge
  const getPaymentBadge = (status) => {
    const paymentStyles = {
      paid: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-purple-100 text-purple-800 border-purple-200",
    }

    return <Badge className={paymentStyles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  // Handle view booking
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking)
    setShowViewDialog(true)
  }

  // Handle edit booking
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking)
    setEditFormData({
      guest_name: booking.guest_name,
      email: booking.email,
      phone: booking.phone,
      nationality: booking.nationality || "",
      check_in: booking.check_in,
      check_out: booking.check_out,
      room_type: booking.room_type,
      room_number: booking.room_number || "",
      guests: booking.guests,
      special_requests: booking.special_requests || "",
      purpose_of_visit: booking.purpose_of_visit || "",
      payment_status: booking.payment_status,
      booking_status: booking.booking_status,
    })
    setShowEditDialog(true)
  }

  // Handle check-in
  const handleCheckIn = (booking) => {
    setSelectedBooking(booking)
    setCheckInNotes("")
    setShowCheckInDialog(true)
  }

  // Handle check-out
  const handleCheckOut = (booking) => {
    setSelectedBooking(booking)
    setCheckOutNotes("")
    setShowCheckOutDialog(true)
  }

  // Handle send email
  const handleSendEmail = (booking) => {
    setSelectedBooking(booking)
    // Pre-populate email subject and body
    setEmailSubject(`Your booking confirmation #${booking.booking_reference}`)
    setEmailBody(
      `Dear ${booking.guest_name},\n\nThank you for booking with Hindukush Sarai. Your booking details are as follows:\n\nBooking Reference: ${booking.booking_reference}\nCheck-in: ${formatDate(
        booking.check_in,
      )}\nCheck-out: ${formatDate(booking.check_out)}\nRoom Type: ${booking.room_type}\nGuests: ${
        booking.guests
      }\n\nWe look forward to welcoming you!\n\nBest regards,\nHindukush Sarai Team`,
    )
    setShowEmailDialog(true)
  }

  // Handle cancel booking
  const handleCancelBookingClick = (booking) => {
    setSelectedBooking(booking)
    setCancelReason("")
    setShowCancelDialog(true)
  }

  // Submit edit booking
  const submitEditBooking = async () => {
    setIsLoading(true)
    try {
      await updateBooking(selectedBooking.id, editFormData)
      setShowEditDialog(false)
      toast({
        title: "Success",
        description: "Booking updated successfully",
      })
    } catch (error) {
      console.error("Error updating booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Submit check-in
  const submitCheckIn = async () => {
    setIsLoading(true)
    try {
      const updates = {
        booking_status: "checked-in",
        special_requests: checkInNotes
          ? `${selectedBooking.special_requests || ""}\n\nCheck-in notes: ${checkInNotes}`
          : selectedBooking.special_requests,
      }
      await updateBooking(selectedBooking.id, updates)
      setShowCheckInDialog(false)
      toast({
        title: "Success",
        description: "Guest checked in successfully",
      })
    } catch (error) {
      console.error("Error checking in:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to check in guest",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Submit check-out
  const submitCheckOut = async () => {
    setIsLoading(true)
    try {
      const updates = {
        booking_status: "checked-out",
        special_requests: checkOutNotes
          ? `${selectedBooking.special_requests || ""}\n\nCheck-out notes: ${checkOutNotes}`
          : selectedBooking.special_requests,
      }
      await updateBooking(selectedBooking.id, updates)
      setShowCheckOutDialog(false)
      toast({
        title: "Success",
        description: "Guest checked out successfully",
      })
    } catch (error) {
      console.error("Error checking out:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to check out guest",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Submit send email
  const submitSendEmail = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would send the email here
      // For now, we'll just simulate it with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setShowEmailDialog(false)
      toast({
        title: "Success",
        description: "Email sent successfully",
      })
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Submit cancel booking
  const submitCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await cancelBooking(selectedBooking.id, cancelReason)
      setShowCancelDialog(false)
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      })
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Export bookings as CSV
  const exportBookingsCSV = () => {
    // Create CSV content
    const headers = [
      "Booking Reference",
      "Guest Name",
      "Email",
      "Phone",
      "Check-in",
      "Check-out",
      "Room Type",
      "Guests",
      "Total Amount",
      "Status",
      "Payment Status",
    ]
    const csvContent = [
      headers.join(","),
      ...sortedBookings.map((booking) =>
        [
          booking.booking_reference,
          `"${booking.guest_name}"`,
          booking.email,
          booking.phone,
          booking.check_in,
          booking.check_out,
          `"${booking.room_type}"`,
          booking.guests,
          booking.total_amount,
          booking.booking_status,
          booking.payment_status,
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bookings_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Check if a booking can be checked in
  const canCheckIn = (booking) => {
    return (
      booking.booking_status === "confirmed" &&
      (isAfter(new Date(), addDays(parseISO(booking.check_in), -1)) || // Allow check-in 1 day before
        format(new Date(), "yyyy-MM-dd") === format(parseISO(booking.check_in), "yyyy-MM-dd"))
    )
  }

  // Check if a booking can be checked out
  const canCheckOut = (booking) => {
    return booking.booking_status === "checked-in"
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage guest bookings and reservations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportBookingsCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="checked-in">Checked-in</TabsTrigger>
            <TabsTrigger value="checked-out">Checked-out</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
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
              <span>Loading bookings...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium">Failed to load bookings</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : paginatedBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : activeTab !== "all"
                    ? `No ${activeTab} bookings found`
                    : "No bookings have been made yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.guest_name}</div>
                        <div className="text-sm text-muted-foreground">{booking.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{formatDate(booking.check_in)}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{booking.nights} nights</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{booking.room_type}</div>
                        {booking.room_number && (
                          <div className="text-sm text-muted-foreground">Room {booking.room_number}</div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.booking_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentBadge(booking.payment_status)}
                          <span className="text-sm font-medium">
                            {booking.currency} {booking.total_amount}
                          </span>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                              <User className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Booking
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCheckIn(booking)} disabled={!canCheckIn(booking)}>
                              <LogIn className="h-4 w-4 mr-2" />
                              Check-in Guest
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCheckOut(booking)} disabled={!canCheckOut(booking)}>
                              <LogOut className="h-4 w-4 mr-2" />
                              Check-out Guest
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSendEmail(booking)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancelBookingClick(booking)}
                              disabled={
                                booking.booking_status === "cancelled" || booking.booking_status === "checked-out"
                              }
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Cancel Booking
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
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, sortedBookings.length)}{" "}
              of {sortedBookings.length} bookings
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

      {/* View Booking Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Booking Reference: {selectedBooking?.booking_reference}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Guest Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedBooking.guest_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedBooking.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedBooking.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nationality</p>
                      <p className="font-medium">{selectedBooking.nationality || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Stay Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in</p>
                      <p className="font-medium">{formatDate(selectedBooking.check_in)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Check-out</p>
                      <p className="font-medium">{formatDate(selectedBooking.check_out)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nights</p>
                      <p className="font-medium">{selectedBooking.nights}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="font-medium">{selectedBooking.guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room Type</p>
                      <p className="font-medium">{selectedBooking.room_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Room Number</p>
                      <p className="font-medium">{selectedBooking.room_number || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium">
                        {selectedBooking.currency} {selectedBooking.total_amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <p className="font-medium">{getPaymentBadge(selectedBooking.payment_status)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{selectedBooking.payment_method || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Booking Status</p>
                      <p className="font-medium">{getStatusBadge(selectedBooking.booking_status)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                  <div>
                    <p className="text-sm text-muted-foreground">Purpose of Visit</p>
                    <p className="font-medium">{selectedBooking.purpose_of_visit || "Not specified"}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Special Requests</p>
                    <p className="font-medium whitespace-pre-line">{selectedBooking.special_requests || "None"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Booking Timeline</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(selectedBooking.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{formatDate(selectedBooking.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowViewDialog(false)
                handleEditBooking(selectedBooking)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>Update booking details for {selectedBooking?.booking_reference}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Guest Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="guest_name">Guest Name</Label>
                    <Input
                      id="guest_name"
                      value={editFormData.guest_name}
                      onChange={(e) => setEditFormData({ ...editFormData, guest_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={editFormData.nationality}
                      onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Stay Details</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="check_in">Check-in Date</Label>
                      <Input
                        id="check_in"
                        type="date"
                        value={editFormData.check_in ? editFormData.check_in.split("T")[0] : ""}
                        onChange={(e) => setEditFormData({ ...editFormData, check_in: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="check_out">Check-out Date</Label>
                      <Input
                        id="check_out"
                        type="date"
                        value={editFormData.check_out ? editFormData.check_out.split("T")[0] : ""}
                        onChange={(e) => setEditFormData({ ...editFormData, check_out: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="room_type">Room Type</Label>
                      <Select
                        value={editFormData.room_type}
                        onValueChange={(value) => setEditFormData({ ...editFormData, room_type: value })}
                      >
                        <SelectTrigger id="room_type">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard Room">Standard Room</SelectItem>
                          <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                          <SelectItem value="Family Suite">Family Suite</SelectItem>
                          <SelectItem value="Executive Suite">Executive Suite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="room_number">Room Number</Label>
                      <Input
                        id="room_number"
                        value={editFormData.room_number}
                        onChange={(e) => setEditFormData({ ...editFormData, room_number: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      value={editFormData.guests}
                      onChange={(e) => setEditFormData({ ...editFormData, guests: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Booking Status</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="booking_status">Booking Status</Label>
                    <Select
                      value={editFormData.booking_status}
                      onValueChange={(value) => setEditFormData({ ...editFormData, booking_status: value })}
                    >
                      <SelectTrigger id="booking_status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="checked-in">Checked-in</SelectItem>
                        <SelectItem value="checked-out">Checked-out</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select
                      value={editFormData.payment_status}
                      onValueChange={(value) => setEditFormData({ ...editFormData, payment_status: value })}
                    >
                      <SelectTrigger id="payment_status">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="purpose_of_visit">Purpose of Visit</Label>
                    <Input
                      id="purpose_of_visit"
                      value={editFormData.purpose_of_visit}
                      onChange={(e) => setEditFormData({ ...editFormData, purpose_of_visit: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="special_requests">Special Requests</Label>
                    <Textarea
                      id="special_requests"
                      value={editFormData.special_requests}
                      onChange={(e) => setEditFormData({ ...editFormData, special_requests: e.target.value })}
                      placeholder="Optional"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={submitEditBooking} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in Guest</DialogTitle>
            <DialogDescription>
              Check in {selectedBooking?.guest_name} for booking {selectedBooking?.booking_reference}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Check-in Date</p>
                <p className="font-medium">{selectedBooking && formatDate(selectedBooking.check_in)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out Date</p>
                <p className="font-medium">{selectedBooking && formatDate(selectedBooking.check_out)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room Type</p>
                <p className="font-medium">{selectedBooking?.room_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-medium">{selectedBooking?.room_number || "Not assigned"}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="check_in_notes">Check-in Notes</Label>
              <Textarea
                id="check_in_notes"
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                placeholder="Add any notes about the check-in process"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="id_verified" />
              <Label htmlFor="id_verified">ID verified</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="payment_collected" />
              <Label htmlFor="payment_collected">Payment collected</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckInDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={submitCheckIn} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Complete Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-out Guest</DialogTitle>
            <DialogDescription>
              Check out {selectedBooking?.guest_name} from booking {selectedBooking?.booking_reference}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Check-in Date</p>
                <p className="font-medium">{selectedBooking && formatDate(selectedBooking.check_in)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out Date</p>
                <p className="font-medium">{selectedBooking && formatDate(selectedBooking.check_out)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room Type</p>
                <p className="font-medium">{selectedBooking?.room_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-medium">{selectedBooking?.room_number || "Not assigned"}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="check_out_notes">Check-out Notes</Label>
              <Textarea
                id="check_out_notes"
                value={checkOutNotes}
                onChange={(e) => setCheckOutNotes(e.target.value)}
                placeholder="Add any notes about the check-out process"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="room_inspected" />
              <Label htmlFor="room_inspected">Room inspected</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="all_charges_settled" />
              <Label htmlFor="all_charges_settled">All charges settled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckOutDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={submitCheckOut} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Complete Check-out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedBooking?.guest_name} ({selectedBooking?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email_subject">Subject</Label>
              <Input id="email_subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email_body">Message</Label>
              <Textarea id="email_body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={10} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={submitSendEmail} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {selectedBooking?.booking_reference} for{" "}
              {selectedBooking?.guest_name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel_reason">Reason for Cancellation</Label>
              <Textarea
                id="cancel_reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                rows={4}
              />
            </div>

            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The booking will be marked as cancelled and the
                room will be made available for new bookings.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isLoading}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={submitCancelBooking} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
