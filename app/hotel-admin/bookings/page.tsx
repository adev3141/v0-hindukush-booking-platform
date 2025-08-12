"use client"

/**
 * Bookings Management Page
 *
 * Features:
 * - Table view with sorting, filtering, and pagination
 * - Status-based tabs and search functionality
 * - Comprehensive booking actions (view, edit, check-in/out, cancel, etc.)
 * - Real-time data from useBookings hook and /api/bookings endpoints
 * - Uses supabaseAdmin for all mutations to bypass RLS
 */

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Mail,
  Download,
  User,
  Phone,
  MapPin,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useBookings } from "@/hooks/use-bookings"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  "checked-in": "bg-green-100 text-green-800",
  "checked-out": "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
}

export default function BookingsPage() {
  const { bookings, loading, error, updateBooking, deleteBooking } = useBookings()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return []

    return bookings.filter((booking) => {
      const matchesSearch =
        booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toString().includes(searchTerm)

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [bookings, searchTerm, statusFilter])

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setActionLoading(true)
    try {
      await updateBooking(bookingId, { status: newStatus })
      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}`,
      })
      setDialogOpen("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handlePaymentStatusUpdate = async (bookingId: string, paymentStatus: string) => {
    setActionLoading(true)
    try {
      await updateBooking(bookingId, { payment_status: paymentStatus })
      toast({
        title: "Success",
        description: `Payment status updated to ${paymentStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    setActionLoading(true)
    try {
      await updateBooking(bookingId, {
        status: "cancelled",
        cancellation_reason: reason,
      })
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      })
      setDialogOpen("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      [
        "Booking ID",
        "Guest Name",
        "Email",
        "Check-in",
        "Check-out",
        "Room Type",
        "Status",
        "Payment Status",
        "Total Amount",
      ],
      ...filteredBookings.map((booking) => [
        booking.id,
        booking.guest_name,
        booking.guest_email,
        booking.check_in_date,
        booking.check_out_date,
        booking.room_type,
        booking.status,
        booking.payment_status,
        booking.total_amount,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`
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
            <p className="text-red-600">Error loading bookings: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-600">Manage hotel bookings and reservations</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by guest name, email, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="checked-in">Checked In</TabsTrigger>
              <TabsTrigger value="checked-out">Checked Out</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">#{booking.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.guest_name}</div>
                              <div className="text-sm text-gray-500">{booking.guest_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{format(new Date(booking.check_in_date), "MMM dd, yyyy")}</div>
                              <div className="text-gray-500">
                                to {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.room_type}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                paymentStatusColors[booking.payment_status as keyof typeof paymentStatusColors]
                              }
                            >
                              {booking.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>${booking.total_amount}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setDialogOpen("view")
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setDialogOpen("edit")
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Booking
                                </DropdownMenuItem>
                                {booking.status === "confirmed" && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "checked-in")}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Check In
                                  </DropdownMenuItem>
                                )}
                                {booking.status === "checked-in" && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "checked-out")}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Check Out
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setDialogOpen("email")
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                {booking.status !== "cancelled" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setDialogOpen("cancel")
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Booking
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* View Booking Dialog */}
      <Dialog open={dialogOpen === "view"} onOpenChange={() => setDialogOpen("")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Complete information for booking #{selectedBooking?.id}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Guest Information</Label>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.guest_email}</span>
                    </div>
                    {selectedBooking.guest_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedBooking.guest_phone}</span>
                      </div>
                    )}
                    {selectedBooking.nationality && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedBooking.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Booking Information</Label>
                  <div className="mt-1 space-y-1">
                    <div>Check-in: {format(new Date(selectedBooking.check_in_date), "PPP")}</div>
                    <div>Check-out: {format(new Date(selectedBooking.check_out_date), "PPP")}</div>
                    <div>Room Type: {selectedBooking.room_type}</div>
                    <div>Guests: {selectedBooking.number_of_guests}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedBooking.status as keyof typeof statusColors]}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                  <div className="mt-1">
                    <Badge
                      className={
                        paymentStatusColors[selectedBooking.payment_status as keyof typeof paymentStatusColors]
                      }
                    >
                      {selectedBooking.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedBooking.special_requests && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Special Requests</Label>
                  <p className="mt-1 text-sm">{selectedBooking.special_requests}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total Amount: ${selectedBooking.total_amount}</span>
                <div className="space-x-2">
                  <Select
                    value={selectedBooking.payment_status}
                    onValueChange={(value) => handlePaymentStatusUpdate(selectedBooking.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
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
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={dialogOpen === "cancel"} onOpenChange={() => setDialogOpen("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea id="reason" placeholder="Enter reason for cancellation..." className="mt-1" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen("")}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const reason = (document.getElementById("reason") as HTMLTextAreaElement)?.value || ""
                  handleCancelBooking(selectedBooking?.id, reason)
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
