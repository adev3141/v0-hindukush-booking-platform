"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Calendar,
  ChevronLeft,
  Clock,
  Home,
  Hotel,
  Inbox,
  LogOut,
  Mountain,
  Plus,
  Search,
  Settings,
  Users,
  Menu,
  Check,
  X,
  Mail,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiStepBooking } from "@/components/multi-step-booking"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { useBookings } from "@/hooks/use-bookings"
import { useInquiries } from "@/hooks/use-inquiries"
import { useRooms } from "@/hooks/use-rooms"

// Transform booking data to match UI expectations
const transformBookingData = (booking: any) => ({
  id: booking.id,
  bookingReference: booking.booking_reference,
  guestName: booking.guest_name,
  email: booking.email,
  phone: booking.phone,
  nationality: booking.nationality,
  checkIn: booking.check_in,
  checkOut: booking.check_out,
  roomType: booking.room_type,
  guests: booking.guests,
  nights: booking.nights,
  totalAmount: booking.total_amount,
  currency: booking.currency,
  specialRequests: booking.special_requests,
  purposeOfVisit: booking.purpose_of_visit,
  paymentMethod: booking.payment_method,
  paymentStatus: booking.payment_status,
  status: booking.booking_status,
  createdAt: booking.created_at,
  updatedAt: booking.updated_at,
})

// Room availability data - this should come from the database
const roomAvailability = {
  dormitory_male: { total: 12, available: 8 },
  dormitory_female: { total: 8, available: 6 },
  budget_single: { total: 6, available: 4 },
  budget_double: { total: 4, available: 3 },
  standard: { total: 10, available: 6 },
  deluxe: { total: 8, available: 3 },
  family: { total: 5, available: 2 },
  executive: { total: 3, available: 1 },
}

export default function HotelAdminPage() {
  const {
    bookings: rawBookings,
    loading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useBookings()
  const { rooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms()
  const { inquiries, loading: inquiriesLoading, error: inquiriesError, refetch: refetchInquiries } = useInquiries()

  // Transform bookings data
  const bookings = rawBookings.map(transformBookingData)

  console.log("🏨 Admin Dashboard Data:")
  console.log("Raw bookings:", rawBookings)
  console.log("Transformed bookings:", bookings)
  console.log("Rooms:", rooms)
  console.log("Inquiries:", inquiries)

  const [activeTab, setActiveTab] = useState("dashboard")
  const [showNewBookingForm, setShowNewBookingForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<any>(null)

  // Calculate dashboard metrics
  const totalBookings = bookings.length
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
  const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
  const pendingInquiries = inquiries.filter((inquiry) => inquiry.status === "new").length

  // Use the hooks to get real data from Supabase
  const {
    bookings: oldBookings,
    loading: oldBookingsLoading,
    createBooking,
    updateBooking,
    cancelBooking,
  } = useBookings()
  const { inquiries: oldInquiries, loading: oldInquiriesLoading, replyToInquiry } = useInquiries()
  const { rooms: oldRooms, loading: oldRoomsLoading, createRoom, updateRoom, deleteRoom } = useRooms()

  // Room management state
  const [showRoomManagement, setShowRoomManagement] = useState(false)
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false)
  const [showEditRoomDialog, setShowEditRoomDialog] = useState(false)
  const [showDeleteRoomDialog, setShowDeleteRoomDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [roomFormData, setRoomFormData] = useState({
    number: "",
    type: "",
    capacity: 1,
    amenities: [],
    status: "available",
    floor: 1,
    description: "",
  })
  const [formErrors, setFormErrors] = useState({})

  // Centralized pricing management - updated with new room types
  const [roomPricing, setRoomPricing] = useState({
    dormitory_male: 2000,
    dormitory_female: 2000,
    budget_single: 6000,
    budget_double: 10000,
    standard: 80,
    deluxe: 120,
    family: 180,
    executive: 220,
  })

  const [pricingRules, setPricingRules] = useState({
    peakSeasonMultiplier: 25,
    groupDiscount: 10,
    extendedStayDiscount: 15,
    corporateDiscount: 20,
  })

  const availableAmenities = [
    "WiFi",
    "AC",
    "TV",
    "Private Bathroom",
    "Attached bathroom",
    "Mini Bar",
    "Balcony",
    "Kitchenette",
    "Work Desk",
    "Premium Bedding",
    "Safe",
    "Hair Dryer",
    "Coffee Maker",
    "Mountain View",
    "Garden View",
    "Shared accommodation",
    "Clean washrooms",
    "Lockers",
    "Secure lockers",
    "Female-only accommodation",
  ]

  const roomTypes = [
    { value: "dormitory_male", label: "Dormitory - Male" },
    { value: "dormitory_female", label: "Dormitory - Female" },
    { value: "budget_single", label: "Budget Room - Single" },
    { value: "budget_double", label: "Budget Room - Double" },
    { value: "standard", label: "Standard Room" },
    { value: "deluxe", label: "Deluxe Room" },
    { value: "family", label: "Family Suite" },
    { value: "executive", label: "Executive Suite" },
  ]

  // Dialog states
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Form states
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [editFormData, setEditFormData] = useState({})
  const [cancelReason, setCancelReason] = useState("")

  // Transform database booking data to match UI expectations
  const transformBookingDataOld = (dbBooking) => {
    if (!dbBooking) return null

    return {
      id: dbBooking.id,
      guestName: dbBooking.guest_name,
      checkIn: new Date(dbBooking.check_in),
      checkOut: new Date(dbBooking.check_out),
      roomType: dbBooking.room_type,
      roomNumber: dbBooking.room_number || "TBD",
      guests: dbBooking.guests,
      status: dbBooking.booking_status,
      totalAmount: dbBooking.total_amount,
      paymentStatus: dbBooking.payment_status,
      email: dbBooking.email,
      phone: dbBooking.phone,
      specialRequests: dbBooking.special_requests,
      bookingReference: dbBooking.booking_reference,
      currency: dbBooking.currency || "PKR",
    }
  }

  // Transform bookings data for UI
  const transformedBookings = oldBookings?.map(transformBookingDataOld).filter(Boolean) || []

  const filteredBookings = transformedBookings.filter(
    (booking) =>
      booking.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Helper function to get room price from centralized pricing
  const getRoomPrice = (roomType) => {
    return roomPricing[roomType] || 0
  }

  // Helper function to get room type label
  const getRoomTypeLabel = (roomType) => {
    const type = roomTypes.find((t) => t.value === roomType)
    return type ? type.label : roomType
  }

  // Helper function to get currency for room type
  const getRoomCurrency = (roomType) => {
    if (roomType?.includes("dormitory") || roomType?.includes("budget")) {
      return "Rs"
    }
    return "$"
  }

  // Validation functions
  const validateRoomData = (data) => {
    const errors = {}

    if (!data.number || data.number.trim() === "") {
      errors.number = "Room/bed number is required"
    } else if (!/^[A-Z0-9\s]{1,10}$/i.test(data.number)) {
      errors.number = "Room/bed number must be 1-10 alphanumeric characters"
    }

    if (!data.type) {
      errors.type = "Room type is required"
    }

    if (!data.capacity || data.capacity < 1 || data.capacity > 10) {
      errors.capacity = "Capacity must be between 1 and 10 guests"
    }

    if (!data.floor || data.floor < 1 || data.floor > 20) {
      errors.floor = "Floor must be between 1 and 20"
    }

    if (!data.amenities || data.amenities.length === 0) {
      errors.amenities = "At least one amenity is required"
    }

    return errors
  }

  // Simulate async operations
  const simulateAsyncOperation = async (operation, delay = 1000) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Simulate random failures for demonstration
      if (Math.random() < 0.1) {
        // 10% failure rate
        throw new Error("Network connection failed. Please try again.")
      }

      return { success: true }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Show toast notification with enhanced feedback
  const showToast = (title, description, variant = "default") => {
    const icon = variant === "destructive" ? "❌" : variant === "warning" ? "⚠️" : "✅"
    alert(`${icon} ${title}: ${description}`)
  }

  // Enhanced error handling
  const handleError = (error, operation) => {
    console.error(`Error in ${operation}:`, error)

    if (error.message.includes("Network")) {
      showToast("Connection Error", "Please check your internet connection and try again.", "destructive")
    } else if (error.message.includes("Validation")) {
      showToast("Validation Error", error.message, "destructive")
    } else if (error.message.includes("Permission")) {
      showToast("Permission Denied", "You don't have permission to perform this action.", "destructive")
    } else {
      showToast("Error", `Failed to ${operation}. Please try again.`, "destructive")
    }
  }

  // Add debugging console logs to verify button clicks
  const handleCheckIn = async () => {
    if (!selectedBooking) return
    try {
      await updateBooking(selectedBooking.id, { booking_status: "checked-in" })
      setShowCheckInDialog(false)
      showToast("Success", `${selectedBooking.guestName} has been checked in`)
    } catch (error) {
      showToast("Error", "Failed to check in guest", "destructive")
    }
  }

  const handleCheckOut = async () => {
    console.log("Check-out button clicked for:", selectedBooking?.guestName)
    if (!selectedBooking) return

    try {
      await updateBooking(selectedBooking.id, { booking_status: "checked-out" })
      setSelectedBooking((prev) => ({ ...prev, status: "checked-out" }))
      setShowCheckOutDialog(false)
      showToast("Success", `${selectedBooking.guestName} has been checked out from ${selectedBooking.roomNumber}`)
    } catch (error) {
      handleError(error, "check out guest")
    }
  }

  const handleSendEmail = async () => {
    console.log("Send email button clicked")
    if (!selectedBooking || !emailSubject || !emailMessage) {
      showToast("Error", "Please fill in all email fields", "destructive")
      return
    }

    try {
      await simulateAsyncOperation("send-email")

      console.log("Sending email:", {
        to: selectedBooking.email,
        subject: emailSubject,
        message: emailMessage,
      })

      setShowEmailDialog(false)
      setEmailSubject("")
      setEmailMessage("")
      showToast("Success", `Confirmation email sent to ${selectedBooking.email}`)
    } catch (error) {
      handleError(error, "send email")
    }
  }

  const handleEditBooking = async () => {
    console.log("Edit booking button clicked")
    if (!selectedBooking) return

    try {
      await updateBooking(selectedBooking.id, editFormData)
      setSelectedBooking((prev) => ({ ...prev, ...editFormData }))
      setShowEditDialog(false)
      setEditFormData({})
      showToast("Success", "Booking details updated successfully")
    } catch (error) {
      handleError(error, "update booking")
    }
  }

  const handleCancelBooking = async () => {
    console.log("Cancel booking button clicked")
    if (!selectedBooking || !cancelReason) {
      showToast("Error", "Please provide a cancellation reason", "destructive")
      return
    }

    try {
      await cancelBooking(selectedBooking.id, cancelReason)
      setSelectedBooking((prev) => ({ ...prev, status: "cancelled", cancelReason }))
      setShowCancelDialog(false)
      setCancelReason("")
      showToast("Success", "Booking has been cancelled")
    } catch (error) {
      handleError(error, "cancel booking")
    }
  }

  // Handle status changes
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBooking(bookingId, { booking_status: newStatus })
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }))
      }
      showToast("Success", `Booking status updated to ${newStatus}`)
    } catch (error) {
      handleError(error, "update status")
    }
  }

  const handlePaymentStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBooking(bookingId, { payment_status: newStatus })
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, paymentStatus: newStatus }))
      }
      showToast("Success", `Payment status updated to ${newStatus}`)
    } catch (error) {
      handleError(error, "update payment status")
    }
  }

  // Handle inquiry status changes
  const handleInquiryStatusChange = async (inquiryId, newStatus) => {
    try {
      await simulateAsyncOperation("inquiry-status-change", 500)
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }))
      }
      showToast("Success", `Inquiry status updated to ${newStatus}`)
    } catch (error) {
      handleError(error, "update inquiry status")
    }
  }

  // Send inquiry reply
  const handleSendInquiryReply = async (reply) => {
    if (!selectedInquiry || !reply.trim()) {
      showToast("Error", "Please enter a reply message", "destructive")
      return
    }

    try {
      await replyToInquiry(selectedInquiry.id, reply.trim())
      setSelectedInquiry((prev) => ({ ...prev, status: "replied", reply: reply.trim() }))
      showToast("Success", `Reply sent to ${selectedInquiry.email}`)
    } catch (error) {
      handleError(error, "send reply")
    }
  }

  // Room management functions with enhanced error handling
  const handleAddRoom = async () => {
    const errors = validateRoomData(roomFormData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      showToast("Validation Error", "Please fix the errors in the form", "destructive")
      return
    }

    try {
      const newRoom = {
        ...roomFormData,
        capacity: Number.parseInt(roomFormData.capacity),
        floor: Number.parseInt(roomFormData.floor),
      }

      await createRoom(newRoom)
      setShowAddRoomDialog(false)
      setRoomFormData({
        number: "",
        type: "",
        capacity: 1,
        amenities: [],
        status: "available",
        floor: 1,
        description: "",
      })
      setFormErrors({})
      showToast("Success", `${getRoomTypeLabel(roomFormData.type)} ${roomFormData.number} added successfully`)
    } catch (error) {
      handleError(error, "add room")
    }
  }

  const handleEditRoom = async () => {
    const errors = validateRoomData(roomFormData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      showToast("Validation Error", "Please fix the errors in the form", "destructive")
      return
    }

    try {
      const updatedRoom = {
        ...roomFormData,
        capacity: Number.parseInt(roomFormData.capacity),
        floor: Number.parseInt(roomFormData.floor),
      }

      await updateRoom(selectedRoom.id, updatedRoom)
      setShowEditRoomDialog(false)
      setSelectedRoom(null)
      setRoomFormData({
        number: "",
        type: "",
        capacity: 1,
        amenities: [],
        status: "available",
        floor: 1,
        description: "",
      })
      setFormErrors({})
      showToast("Success", "Room updated successfully")
    } catch (error) {
      handleError(error, "update room")
    }
  }

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return

    // Check if room is currently occupied
    if (selectedRoom.status === "occupied") {
      showToast("Error", "Cannot delete occupied room/bed. Please check out the guest first.", "destructive")
      return
    }

    try {
      await deleteRoom(selectedRoom.id)
      setShowDeleteRoomDialog(false)
      setSelectedRoom(null)
      showToast("Success", `${getRoomTypeLabel(selectedRoom.type)} ${selectedRoom.number} deleted successfully`)
    } catch (error) {
      handleError(error, "delete room")
    }
  }

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoom(roomId, { status: newStatus })
      showToast("Success", `Room status updated to ${newStatus}`)
    } catch (error) {
      handleError(error, "update room status")
    }
  }

  // Handle pricing updates
  const handlePricingUpdate = async () => {
    try {
      await simulateAsyncOperation("update-pricing", 500)
      showToast("Success", "Room rates updated successfully")
    } catch (error) {
      handleError(error, "update pricing")
    }
  }

  const toggleAmenity = (amenity) => {
    setRoomFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const resetRoomForm = () => {
    setRoomFormData({
      number: "",
      type: "",
      capacity: 1,
      amenities: [],
      status: "available",
      floor: 1,
      description: "",
    })
    setFormErrors({})
  }

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      "checked-in": "bg-blue-100 text-blue-800",
      "checked-out": "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }

    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    }

    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const getRoomStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      available: "bg-green-100 text-green-800",
      occupied: "bg-red-100 text-red-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      "out-of-order": "bg-gray-100 text-gray-800",
    }

    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const handleRefreshAll = () => {
    console.log("🔄 Refreshing all data...")
    refetchBookings()
    refetchRooms()
    refetchInquiries()
  }

  if (bookingsLoading || roomsLoading || inquiriesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (bookingsError || roomsError || inquiriesError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-red-600 mb-4">{bookingsError || roomsError || inquiriesError}</p>
          <Button onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Debug logging
  console.log("=== ADMIN PAGE DEBUG ===")
  console.log("Bookings loading:", bookingsLoading)
  console.log("Raw bookings from hook:", oldBookings)
  console.log("Transformed bookings:", transformedBookings)
  console.log("Filtered bookings:", filteredBookings)

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
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
            <li>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeTab === "dashboard" ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeTab === "bookings" ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("bookings")}
              >
                <Calendar className="h-5 w-5" />
                <span>Bookings</span>
                {transformedBookings.length > 0 && (
                  <Badge className="ml-auto bg-blue-500">{transformedBookings.length}</Badge>
                )}
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeTab === "inquiries" ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("inquiries")}
              >
                <Inbox className="h-5 w-5" />
                <span>Inquiries</span>
                <Badge className="ml-auto bg-red-500">
                  {oldInquiries?.filter((i) => i.status === "new").length || 0}
                </Badge>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeTab === "rooms" ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("rooms")}
              >
                <Hotel className="h-5 w-5" />
                <span>Rooms</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeTab === "guests" ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("guests")}
              >
                <Users className="h-5 w-5" />
                <span>Guests</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeTab === "settings" ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
            </li>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "bookings" && "Bookings"}
              {activeTab === "inquiries" && "Inquiries"}
              {activeTab === "rooms" && "Room Management"}
              {activeTab === "guests" && "Guest Directory"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/" target="_blank">
                View Website
              </Link>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{transformedBookings?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {oldBookingsLoading ? "Loading..." : "Real-time data"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Occupancy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {transformedBookings?.filter((b) => b.status === "checked-in").length || 0}
                    </div>
                    <p className="text-xs text-emerald-500 mt-1">Currently checked in</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">New Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {oldInquiries?.filter((i) => i.status === "new").length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (This Month)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      Rs{" "}
                      {transformedBookings
                        ?.reduce((total, booking) => total + (booking.totalAmount || 0), 0)
                        .toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-emerald-500 mt-1">From current bookings</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest bookings from database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {oldBookingsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading bookings...</span>
                      </div>
                    ) : transformedBookings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No bookings found</p>
                        <p className="text-sm mt-1">New bookings will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transformedBookings.slice(0, 5).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{booking.guestName}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                              </div>
                            </div>
                            <div className="text-right">
                              <div>{booking.roomType}</div>
                              <Badge
                                className={
                                  booking.status === "confirmed"
                                    ? "bg-blue-500"
                                    : booking.status === "checked-in"
                                      ? "bg-emerald-500"
                                      : booking.status === "checked-out"
                                        ? "bg-gray-500"
                                        : "bg-red-500"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setActiveTab("bookings")}
                    >
                      View All Bookings
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Room Availability</CardTitle>
                    <CardDescription>Current accommodation status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(roomAvailability).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{getRoomTypeLabel(type)}</div>
                            <div className="text-sm text-muted-foreground">
                              {data.available} of {data.total} available
                            </div>
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${(data.available / data.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        setActiveTab("rooms")
                        setShowRoomManagement(true)
                      }}
                    >
                      Manage Rooms
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Check-ins, check-outs, and events for today</CardDescription>
                </CardHeader>
                <CardContent>
                  {oldBookingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading schedule...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transformedBookings
                        .filter((booking) => {
                          const today = new Date().toDateString()
                          return booking.checkIn.toDateString() === today || booking.checkOut.toDateString() === today
                        })
                        .map((booking) => (
                          <div key={booking.id} className="flex items-start gap-4">
                            <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {booking.checkIn.toDateString() === new Date().toDateString()
                                  ? "Check-in"
                                  : "Check-out"}
                                : {booking.guestName} ({booking.bookingReference})
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.roomType} - {booking.guests} guests
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-auto bg-transparent"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setActiveTab("bookings")
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        ))}
                      {transformedBookings.filter((booking) => {
                        const today = new Date().toDateString()
                        return booking.checkIn.toDateString() === today || booking.checkOut.toDateString() === today
                      }).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No scheduled activities for today</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "bookings" && !showNewBookingForm && !selectedBooking && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">All Bookings</h2>
                <Button onClick={() => setShowNewBookingForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Walk-in Booking
                </Button>
              </div>

              {oldBookingsLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading bookings...</span>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All ({transformedBookings.length})</TabsTrigger>
                    <TabsTrigger value="confirmed">
                      Confirmed ({transformedBookings.filter((b) => b.status === "confirmed").length})
                    </TabsTrigger>
                    <TabsTrigger value="checked-in">
                      Checked In ({transformedBookings.filter((b) => b.status === "checked-in").length})
                    </TabsTrigger>
                    <TabsTrigger value="checked-out">
                      Checked Out ({transformedBookings.filter((b) => b.status === "checked-out").length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled">
                      Cancelled ({transformedBookings.filter((b) => b.status === "cancelled").length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        {filteredBookings.length === 0 ? (
                          <div className="text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No bookings found</p>
                            <p className="text-muted-foreground mt-2">
                              {searchQuery ? "Try adjusting your search" : "New bookings will appear here"}
                            </p>
                          </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-4">Booking ID</th>
                                <th className="text-left p-4">Guest</th>
                                <th className="text-left p-4">Dates</th>
                                <th className="text-left p-4">Room</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Payment</th>
                                <th className="text-left p-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="border-b hover:bg-muted/50">
                                  <td className="p-4 font-medium">{booking.bookingReference}</td>
                                  <td className="p-4">{booking.guestName}</td>
                                  <td className="p-4">
                                    {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                                  </td>
                                  <td className="p-4">{booking.roomType}</td>
                                  <td className="p-4">
                                    <Badge
                                      className={
                                        booking.status === "confirmed"
                                          ? "bg-blue-500"
                                          : booking.status === "checked-in"
                                            ? "bg-emerald-500"
                                            : booking.status === "checked-out"
                                              ? "bg-gray-500"
                                              : "bg-red-500"
                                      }
                                    >
                                      {booking.status}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <Badge
                                      className={booking.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500"}
                                    >
                                      {booking.paymentStatus}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="confirmed" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-4">Booking ID</th>
                              <th className="text-left p-4">Guest</th>
                              <th className="text-left p-4">Dates</th>
                              <th className="text-left p-4">Room</th>
                              <th className="text-left p-4">Payment</th>
                              <th className="text-left p-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBookings
                              .filter((b) => b.status === "confirmed")
                              .map((booking) => (
                                <tr key={booking.id} className="border-b hover:bg-muted/50">
                                  <td className="p-4 font-medium">{booking.bookingReference}</td>
                                  <td className="p-4">{booking.guestName}</td>
                                  <td className="p-4">
                                    {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                                  </td>
                                  <td className="p-4">{booking.roomType}</td>
                                  <td className="p-4">
                                    <Badge
                                      className={booking.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500"}
                                    >
                                      {booking.paymentStatus}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="checked-in" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-4">Booking ID</th>
                              <th className="text-left p-4">Guest</th>
                              <th className="text-left p-4">Room</th>
                              <th className="text-left p-4">Check-out Date</th>
                              <th className="text-left p-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBookings
                              .filter((b) => b.status === "checked-in")
                              .map((booking) => (
                                <tr key={booking.id} className="border-b hover:bg-muted/50">
                                  <td className="p-4 font-medium">{booking.bookingReference}</td>
                                  <td className="p-4">{booking.guestName}</td>
                                  <td className="p-4">{booking.roomNumber}</td>
                                  <td className="p-4">{format(booking.checkOut, "MMM d, yyyy")}</td>
                                  <td className="p-4">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="checked-out" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-4">Booking ID</th>
                              <th className="text-left p-4">Guest</th>
                              <th className="text-left p-4">Dates</th>
                              <th className="text-left p-4">Total Amount</th>
                              <th className="text-left p-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBookings
                              .filter((b) => b.status === "checked-out")
                              .map((booking) => (
                                <tr key={booking.id} className="border-b hover:bg-muted/50">
                                  <td className="p-4 font-medium">{booking.bookingReference}</td>
                                  <td className="p-4">{booking.guestName}</td>
                                  <td className="p-4">
                                    {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                                  </td>
                                  <td className="p-4">
                                    {booking.currency === "PKR" ? "Rs" : "$"}
                                    {booking.totalAmount?.toLocaleString()}
                                  </td>
                                  <td className="p-4">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="cancelled" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-4">Booking ID</th>
                              <th className="text-left p-4">Guest</th>
                              <th className="text-left p-4">Dates</th>
                              <th className="text-left p-4">Reason</th>
                              <th className="text-left p-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBookings
                              .filter((b) => b.status === "cancelled")
                              .map((booking) => (
                                <tr key={booking.id} className="border-b hover:bg-muted/50">
                                  <td className="p-4 font-medium">{booking.bookingReference}</td>
                                  <td className="p-4">{booking.guestName}</td>
                                  <td className="p-4">
                                    {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                                  </td>
                                  <td className="p-4">{booking.cancelReason || "No reason provided"}</td>
                                  <td className="p-4">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          {activeTab === "bookings" && showNewBookingForm && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowNewBookingForm(false)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h2 className="text-2xl font-bold">New Walk-in Booking</h2>
              </div>
              <MultiStepBooking />
            </div>
          )}

          {activeTab === "bookings" && selectedBooking && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h2 className="text-2xl font-bold">Booking Details</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Booking Information</CardTitle>
                    <CardDescription>Details for booking {selectedBooking.bookingReference}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Booking ID</h3>
                        <p className="font-medium">{selectedBooking.bookingReference}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Guest Name</h3>
                        <p className="font-medium">{selectedBooking.guestName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Check-in Date</h3>
                        <p className="font-medium">{format(selectedBooking.checkIn, "MMMM d, yyyy")}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Check-out Date</h3>
                        <p className="font-medium">{format(selectedBooking.checkOut, "MMMM d, yyyy")}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Room Type</h3>
                        <p className="font-medium">{selectedBooking.roomType}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Room/Bed Number</h3>
                        <p className="font-medium">{selectedBooking.roomNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Number of Guests</h3>
                        <p className="font-medium">{selectedBooking.guests}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                        <p className="font-medium">{selectedBooking.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                        <p className="font-medium">{selectedBooking.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Amount</h3>
                        <p className="font-medium">
                          {selectedBooking.currency === "PKR" ? "Rs" : "$"}
                          {selectedBooking.totalAmount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Status</h3>
                        <Select
                          defaultValue={selectedBooking.paymentStatus}
                          onValueChange={(value) => handlePaymentStatusChange(selectedBooking.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Booking Status</h3>
                        <Select
                          defaultValue={selectedBooking.status}
                          onValueChange={(value) => handleStatusChange(selectedBooking.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="checked-in">Checked In</SelectItem>
                            <SelectItem value="checked-out">Checked Out</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedBooking.specialRequests && (
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Special Requests</h3>
                          <p className="font-medium">{selectedBooking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => window.print()}>
                      Print Receipt
                    </Button>
                    <Button onClick={() => showToast("Success", "Changes saved successfully")}>Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className="w-full"
                      disabled={selectedBooking.status !== "confirmed" || isLoading}
                      onClick={() => setShowCheckInDialog(true)}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Check In Guest
                    </Button>
                    <Button
                      className="w-full"
                      disabled={selectedBooking.status !== "checked-in" || isLoading}
                      onClick={() => setShowCheckOutDialog(true)}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                      Check Out Guest
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={isLoading}
                      onClick={() => {
                        setEmailSubject(`Booking Confirmation - ${selectedBooking.bookingReference}`)
                        setEmailMessage(
                          `Dear ${selectedBooking.guestName},\n\nYour booking at Hindukush Sarai Chitral has been confirmed.\n\nBooking Details:\n- Booking ID: ${selectedBooking.bookingReference}\n- Check-in: ${format(selectedBooking.checkIn, "MMMM d, yyyy")}\n- Check-out: ${format(selectedBooking.checkOut, "MMMM d, yyyy")}\n- Accommodation: ${selectedBooking.roomType}\n- Total Amount: ${selectedBooking.currency === "PKR" ? "Rs" : "$"}${selectedBooking.totalAmount?.toLocaleString()}\n\nWe look forward to welcoming you with traditional mountain hospitality!\n\nBest regards,\nHindukush Sarai Chitral Team`,
                        )
                        setShowEmailDialog(true)
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Confirmation Email
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={isLoading}
                      onClick={() => {
                        setEditFormData({
                          guest_name: selectedBooking.guestName,
                          email: selectedBooking.email,
                          phone: selectedBooking.phone,
                          room_number: selectedBooking.roomNumber,
                          special_requests: selectedBooking.specialRequests || "",
                        })
                        setShowEditDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Booking
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={
                        selectedBooking.status === "cancelled" || selectedBooking.status === "checked-out" || isLoading
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "inquiries" && !selectedInquiry && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Inquiries</h2>

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="new">
                    New{" "}
                    <Badge className="ml-1 bg-red-500">{oldInquiries?.filter((i) => i.status === "new").length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="replied">Replied</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">ID</th>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Message</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {oldInquiries?.map((inquiry) => (
                            <tr key={inquiry.id} className="border-b hover:bg-muted/50">
                              <td className="p-4 font-medium">{inquiry.id}</td>
                              <td className="p-4">{inquiry.name}</td>
                              <td className="p-4">{format(new Date(inquiry.created_at), "MMM d, yyyy")}</td>
                              <td className="p-4 max-w-xs truncate">{inquiry.message}</td>
                              <td className="p-4">
                                <Badge className={inquiry.status === "new" ? "bg-red-500" : "bg-emerald-500"}>
                                  {inquiry.status}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Button size="sm" variant="outline" onClick={() => setSelectedInquiry(inquiry)}>
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="new" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">ID</th>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Message</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {oldInquiries
                            ?.filter((inquiry) => inquiry.status === "new")
                            .map((inquiry) => (
                              <tr key={inquiry.id} className="border-b hover:bg-muted/50">
                                <td className="p-4 font-medium">{inquiry.id}</td>
                                <td className="p-4">{inquiry.name}</td>
                                <td className="p-4">{format(new Date(inquiry.created_at), "MMM d, yyyy")}</td>
                                <td className="p-4 max-w-xs truncate">{inquiry.message}</td>
                                <td className="p-4">
                                  <Button size="sm" variant="outline" onClick={() => setSelectedInquiry(inquiry)}>
                                    Reply
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="replied" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">ID</th>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Message</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {oldInquiries
                            ?.filter((inquiry) => inquiry.status === "replied")
                            .map((inquiry) => (
                              <tr key={inquiry.id} className="border-b hover:bg-muted/50">
                                <td className="p-4 font-medium">{inquiry.id}</td>
                                <td className="p-4">{inquiry.name}</td>
                                <td className="p-4">{format(new Date(inquiry.created_at), "MMM d, yyyy")}</td>
                                <td className="p-4 max-w-xs truncate">{inquiry.message}</td>
                                <td className="p-4">
                                  <Button size="sm" variant="outline" onClick={() => setSelectedInquiry(inquiry)}>
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "inquiries" && selectedInquiry && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(null)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h2 className="text-2xl font-bold">Inquiry Details</h2>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedInquiry.name}</CardTitle>
                      <CardDescription>
                        {format(new Date(selectedInquiry.created_at), "MMMM d, yyyy")} · {selectedInquiry.email} ·{" "}
                        {selectedInquiry.phone}
                      </CardDescription>
                    </div>
                    <Badge className={selectedInquiry.status === "new" ? "bg-red-500" : "bg-emerald-500"}>
                      {selectedInquiry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md mb-6">
                    <h4 className="font-medium mb-2">Original Message:</h4>
                    <p>{selectedInquiry.message}</p>
                  </div>

                  {selectedInquiry.reply && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md mb-6">
                      <h4 className="font-medium mb-2 text-emerald-800">Your Reply:</h4>
                      <p className="text-emerald-700">{selectedInquiry.reply}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-medium">Reply to Inquiry</h3>
                    <Textarea
                      placeholder="Type your response here..."
                      className="min-h-[200px]"
                      defaultValue={selectedInquiry.reply || ""}
                      id="inquiry-reply"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="status">Status:</Label>
                    <Select
                      defaultValue={selectedInquiry.status}
                      onValueChange={(value) => handleInquiryStatusChange(selectedInquiry.id, value)}
                    >
                      <SelectTrigger id="status" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={isLoading}
                      onClick={() => {
                        const textarea = document.getElementById("inquiry-reply") as HTMLTextAreaElement
                        if (textarea) {
                          localStorage.setItem(`inquiry-draft-${selectedInquiry.id}`, textarea.value)
                          showToast("Success", "Draft saved")
                        }
                      }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      disabled={isLoading}
                      onClick={() => {
                        const textarea = document.getElementById("inquiry-reply") as HTMLTextAreaElement
                        if (textarea && textarea.value.trim()) {
                          handleSendInquiryReply(textarea.value.trim())
                        }
                      }}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Send Reply
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "rooms" && !showRoomManagement && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Room Management</h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(roomAvailability).map(([type, data]) => (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle>{getRoomTypeLabel(type)}</CardTitle>
                      <CardDescription>
                        {data.available} of {data.total} available
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(data.available / data.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: Math.min(data.total, 10) }, (_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                              i < data.total - data.available
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {i + 1}
                          </div>
                        ))}
                        {data.total > 10 && (
                          <div className="aspect-square rounded-md flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600">
                            +{data.total - 10}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setShowRoomManagement(true)}
                      >
                        Manage
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Room Availability Calendar</CardTitle>
                  <CardDescription>View and manage room availability for the next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-12">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Calendar view would be displayed here</p>
                    <p className="text-sm mt-2">Feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "rooms" && showRoomManagement && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowRoomManagement(false)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Overview
                </Button>
                <h2 className="text-2xl font-bold">Room Management</h2>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Manage individual rooms, beds, and their availability</p>
                <Button onClick={() => setShowAddRoomDialog(true)} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Room/Bed
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Number</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Capacity</th>
                        <th className="text-left p-4">Floor</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {oldRooms?.map((room) => (
                        <tr key={room.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{room.number}</td>
                          <td className="p-4">{getRoomTypeLabel(room.type)}</td>
                          <td className="p-4">
                            {room.capacity} guest{room.capacity !== 1 ? "s" : ""}
                          </td>
                          <td className="p-4">Floor {room.floor}</td>
                          <td className="p-4">
                            {getRoomCurrency(room.type)}
                            {getRoomPrice(room.type).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Select
                              defaultValue={room.status}
                              onValueChange={(value) => handleRoomStatusChange(room.id, value)}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="occupied">Occupied</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => {
                                  setSelectedRoom(room)
                                  setRoomFormData({
                                    number: room.number,
                                    type: room.type,
                                    capacity: room.capacity,
                                    amenities: room.amenities,
                                    status: room.status,
                                    floor: room.floor,
                                    description: room.description,
                                  })
                                  setShowEditRoomDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={room.status === "occupied" || isLoading}
                                onClick={() => {
                                  setSelectedRoom(room)
                                  setShowDeleteRoomDialog(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Room Rates & Pricing</CardTitle>
                  <CardDescription>Manage accommodation pricing for all room categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Dormitory - Male (per bed)</Label>
                        <Input
                          value={`Rs ${roomPricing.dormitory_male.toLocaleString()}`}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[Rs,\s]/g, "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, dormitory_male: Number(value) }))
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dormitory - Female (per bed)</Label>
                        <Input
                          value={`Rs ${roomPricing.dormitory_female.toLocaleString()}`}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[Rs,\s]/g, "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, dormitory_female: Number(value) }))
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Budget Room - Single</Label>
                        <Input
                          value={`Rs ${roomPricing.budget_single.toLocaleString()}`}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[Rs,\s]/g, "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, budget_single: Number(value) }))
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Budget Room - Double</Label>
                        <Input
                          value={`Rs ${roomPricing.budget_double.toLocaleString()}`}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[Rs,\s]/g, "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, budget_double: Number(value) }))
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Standard Room Rate</Label>
                        <Input
                          value={`$${roomPricing.standard}`}
                          onChange={(e) => {
                            const value = e.target.value.replace("$", "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, standard: Number(value) }))
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Deluxe Room Rate</Label>
                        <Input
                          value={`$${roomPricing.deluxe}`}
                          onChange={(e) => {
                            const value = e.target.value.replace("$", "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, deluxe: Number(value) }))
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Family Suite Rate</Label>
                        <Input
                          value={`$${roomPricing.family}`}
                          onChange={(e) => {
                            const value = e.target.value.replace("$", "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, family: Number(value) }))
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Executive Suite Rate</Label>
                        <Input
                          value={`$${roomPricing.executive}`}
                          onChange={(e) => {
                            const value = e.target.value.replace("$", "")
                            if (!isNaN(Number(value))) {
                              setRoomPricing((prev) => ({ ...prev, executive: Number(value) }))
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Pricing Rules</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Peak Season Multiplier (%)</Label>
                          <Input
                            value={pricingRules.peakSeasonMultiplier}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              if (!isNaN(value)) {
                                setPricingRules((prev) => ({ ...prev, peakSeasonMultiplier: value }))
                              }
                            }}
                            placeholder="e.g., 25 for 25% increase"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Group Discount (5+ rooms/beds) (%)</Label>
                          <Input
                            value={pricingRules.groupDiscount}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              if (!isNaN(value)) {
                                setPricingRules((prev) => ({ ...prev, groupDiscount: value }))
                              }
                            }}
                            placeholder="e.g., 10 for 10% discount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Extended Stay Discount (7+ nights) (%)</Label>
                          <Input
                            value={pricingRules.extendedStayDiscount}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              if (!isNaN(value)) {
                                setPricingRules((prev) => ({ ...prev, extendedStayDiscount: value }))
                              }
                            }}
                            placeholder="e.g., 15 for 15% discount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Corporate/NGO Discount (%)</Label>
                          <Input
                            value={pricingRules.corporateDiscount}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              if (!isNaN(value)) {
                                setPricingRules((prev) => ({ ...prev, corporateDiscount: value }))
                              }
                            }}
                            placeholder="e.g., 20 for 20% discount"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handlePricingUpdate}>Update Rates</Button>
                </CardFooter>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {oldRooms?.map((room) => (
                  <Card key={room.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {getRoomTypeLabel(room.type)} {room.number}
                          </CardTitle>
                          <CardDescription className="capitalize">{room.type.replace("_", " ")}</CardDescription>
                        </div>
                        <Badge
                          className={
                            room.status === "available"
                              ? "bg-emerald-500"
                              : room.status === "occupied"
                                ? "bg-red-500"
                                : room.status === "maintenance"
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                          }
                        >
                          {room.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Capacity:</span>
                          <span>
                            {room.capacity} guest{room.capacity !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Floor:</span>
                          <span>Floor {room.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">
                            {getRoomCurrency(room.type)}
                            {getRoomPrice(room.type).toLocaleString()}
                            {room.type.includes("dormitory") ? "/bed" : "/night"}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="text-muted-foreground text-xs">Amenities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {room.amenities.slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {room.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{room.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        {room.description && <p className="text-xs text-muted-foreground mt-2">{room.description}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "guests" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Guest Directory</h2>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Phone</th>
                        <th className="text-left p-4">Last Stay</th>
                        <th className="text-left p-4">Total Stays</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transformedBookings?.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{booking.guestName}</td>
                          <td className="p-4">{booking.email}</td>
                          <td className="p-4">{booking.phone}</td>
                          <td className="p-4">{format(booking.checkOut, "MMM d, yyyy")}</td>
                          <td className="p-4">1</td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                showToast("Info", `Viewing profile for ${booking.guestName} - Feature coming soon`)
                              }
                            >
                              View Profile
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Information</CardTitle>
                  <CardDescription>Update your hotel details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-name">Hotel Name</Label>
                      <Input id="hotel-name" defaultValue="Hindukush Sarai Chitral" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-email">Email</Label>
                      <Input id="hotel-email" defaultValue="hindukushsarai@gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-phone">Phone</Label>
                      <Input id="hotel-phone" defaultValue="+92 322 1848940" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-address">Address</Label>
                      <Input id="hotel-address" defaultValue="Chitral City, Khyber Pakhtunkhwa, Pakistan" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => showToast("Success", "Hotel information updated successfully")}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage staff accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p>User management interface would be displayed here</p>
                    <p className="text-sm mt-2">Feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}

      {/* Check In Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In Guest</DialogTitle>
            <DialogDescription>
              Confirm check-in for {selectedBooking?.guestName} to {selectedBooking?.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-md">
                <Check className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Ready to check in</p>
                  <p className="text-sm text-muted-foreground">
                    Guest will be marked as checked-in and {selectedBooking?.roomNumber} will be occupied
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckInDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Out Dialog */}
      <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out Guest</DialogTitle>
            <DialogDescription>
              Confirm check-out for {selectedBooking?.guestName} from {selectedBooking?.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-md">
                <X className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Ready to check out</p>
                  <p className="text-sm text-muted-foreground">
                    Guest will be marked as checked-out and {selectedBooking?.roomNumber} will be available
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckOutDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCheckOut} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Check Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Confirmation Email</DialogTitle>
            <DialogDescription>
              Send a confirmation email to {selectedBooking?.guestName} at {selectedBooking?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Email message"
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>Update booking details for {selectedBooking?.guestName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-guest-name">Guest Name</Label>
                <Input
                  id="edit-guest-name"
                  value={editFormData.guest_name || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, guest_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-number">Room/Bed Number</Label>
                <Input
                  id="edit-room-number"
                  value={editFormData.room_number || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, room_number: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-special-requests">Special Requests</Label>
              <Textarea
                id="edit-special-requests"
                value={editFormData.special_requests || ""}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, special_requests: e.target.value }))}
                placeholder="Any special requests"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditBooking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the booking for {selectedBooking?.guestName}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Please provide a reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room/Bed</DialogTitle>
            <DialogDescription>Fill in the details for the new accommodation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="room-number">Room/Bed Number</Label>
                <Input
                  id="room-number"
                  value={roomFormData.number}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder="e.g., 101, Bed 3"
                />
                {formErrors.number && <p className="text-red-500 text-sm">{formErrors.number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-type">Room Type</Label>
                <Select onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger id="room-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && <p className="text-red-500 text-sm">{formErrors.type}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Capacity</Label>
                <Input
                  type="number"
                  id="room-capacity"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Number of guests"
                />
                {formErrors.capacity && <p className="text-red-500 text-sm">{formErrors.capacity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-floor">Floor</Label>
                <Input
                  type="number"
                  id="room-floor"
                  value={roomFormData.floor}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: e.target.value }))}
                  placeholder="Floor number"
                />
                {formErrors.floor && <p className="text-red-500 text-sm">{formErrors.floor}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {availableAmenities.map((amenity) => (
                  <Button
                    key={amenity}
                    variant={roomFormData.amenities.includes(amenity) ? "default" : "outline"}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Button>
                ))}
              </div>
              {formErrors.amenities && <p className="text-red-500 text-sm">{formErrors.amenities}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                value={roomFormData.description}
                onChange={(e) => setRoomFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about the room/bed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddRoomDialog(false)
                resetRoomForm()
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRoom} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Room/Bed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditRoomDialog} onOpenChange={setShowEditRoomDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Room/Bed</DialogTitle>
            <DialogDescription>Update the details for the accommodation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-room-number">Room/Bed Number</Label>
                <Input
                  id="edit-room-number"
                  value={roomFormData.number}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder="e.g., 101, Bed 3"
                />
                {formErrors.number && <p className="text-red-500 text-sm">{formErrors.number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-type">Room Type</Label>
                <Select
                  defaultValue={roomFormData.type}
                  onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="edit-room-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && <p className="text-red-500 text-sm">{formErrors.type}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-capacity">Capacity</Label>
                <Input
                  type="number"
                  id="edit-room-capacity"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Number of guests"
                />
                {formErrors.capacity && <p className="text-red-500 text-sm">{formErrors.capacity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-floor">Floor</Label>
                <Input
                  type="number"
                  id="edit-room-floor"
                  value={roomFormData.floor}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: e.target.value }))}
                  placeholder="Floor number"
                />
                {formErrors.floor && <p className="text-red-500 text-sm">{formErrors.floor}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {availableAmenities.map((amenity) => (
                  <Button
                    key={amenity}
                    variant={roomFormData.amenities.includes(amenity) ? "default" : "outline"}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Button>
                ))}
              </div>
              {formErrors.amenities && <p className="text-red-500 text-sm">{formErrors.amenities}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-room-description">Description</Label>
              <Textarea
                id="edit-room-description"
                value={roomFormData.description}
                onChange={(e) => setRoomFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about the room/bed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditRoomDialog(false)
                resetRoomForm()
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditRoom} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update Room/Bed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog open={showDeleteRoomDialog} onOpenChange={setShowDeleteRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room/Bed</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {getRoomTypeLabel(selectedRoom?.type)} {selectedRoom?.number}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-md">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Confirm deletion</p>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. All associated data will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteRoomDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
