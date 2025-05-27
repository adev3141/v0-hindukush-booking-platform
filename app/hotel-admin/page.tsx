"use client"

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
  AlertTriangle,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Mock data for bookings
const initialBookings = [
  {
    id: "HKS-123456",
    guestName: "Ahmed Khan",
    checkIn: new Date(2023, 6, 15),
    checkOut: new Date(2023, 6, 18),
    roomType: "Deluxe Room",
    guests: 2,
    status: "confirmed",
    totalAmount: 360,
    paymentStatus: "paid",
    email: "ahmed.khan@example.com",
    phone: "+92 300 1234567",
    roomNumber: "201",
    specialRequests: "Late check-in requested",
  },
  {
    id: "HKS-234567",
    guestName: "Sarah Johnson",
    checkIn: new Date(2023, 6, 20),
    checkOut: new Date(2023, 6, 25),
    roomType: "Family Suite",
    guests: 4,
    status: "confirmed",
    totalAmount: 900,
    paymentStatus: "pending",
    email: "sarah.j@example.com",
    phone: "+92 321 9876543",
    roomNumber: "301",
    specialRequests: "Ground floor room preferred",
  },
  {
    id: "HKS-345678",
    guestName: "Michael Brown",
    checkIn: new Date(2023, 6, 10),
    checkOut: new Date(2023, 6, 12),
    roomType: "Standard Room",
    guests: 1,
    status: "checked-in",
    totalAmount: 160,
    paymentStatus: "paid",
    email: "michael.b@example.com",
    phone: "+92 333 4567890",
    roomNumber: "101",
    specialRequests: "",
  },
  {
    id: "HKS-456789",
    guestName: "Emma Wilson",
    checkIn: new Date(2023, 6, 5),
    checkOut: new Date(2023, 6, 10),
    roomType: "Executive Suite",
    guests: 2,
    status: "checked-out",
    totalAmount: 1100,
    paymentStatus: "paid",
    email: "emma.w@example.com",
    phone: "+92 345 6789012",
    roomNumber: "401",
    specialRequests: "Airport pickup arranged",
  },
  {
    id: "HKS-567890",
    guestName: "Ali Hassan",
    checkIn: new Date(2023, 6, 25),
    checkOut: new Date(2023, 6, 30),
    roomType: "Deluxe Room",
    guests: 3,
    status: "confirmed",
    totalAmount: 600,
    paymentStatus: "pending",
    email: "ali.h@example.com",
    phone: "+92 312 3456789",
    roomNumber: "202",
    specialRequests: "Vegetarian meals only",
  },
]

// Mock data for inquiries
const initialInquiries = [
  {
    id: "INQ-123",
    name: "Fatima Ahmed",
    email: "fatima.a@example.com",
    phone: "+92 321 1234567",
    date: new Date(2023, 6, 5),
    message: "I'm interested in booking a family suite for 5 people in August. Do you have availability?",
    status: "new",
    reply: "",
  },
  {
    id: "INQ-124",
    name: "John Smith",
    email: "john.s@example.com",
    phone: "+92 300 9876543",
    date: new Date(2023, 6, 4),
    message: "Do you offer airport pickup services? We'll be arriving at Chitral Airport on July 20.",
    status: "replied",
    reply: "Yes, we offer airport pickup services for $15. Please confirm your flight details.",
  },
  {
    id: "INQ-125",
    name: "Ayesha Khan",
    email: "ayesha.k@example.com",
    phone: "+92 333 5678901",
    date: new Date(2023, 6, 3),
    message: "We're a group of 10 people from an NGO. Do you offer special rates for groups?",
    status: "new",
    reply: "",
  },
  {
    id: "INQ-126",
    name: "Robert Chen",
    email: "robert.c@example.com",
    phone: "+92 345 2345678",
    date: new Date(2023, 6, 2),
    message: "Is it possible to arrange a guided tour to Kalash Valley from your hotel?",
    status: "replied",
    reply: "Yes, we can arrange guided tours to Kalash Valley. The cost is $50 per person for a full day tour.",
  },
]

// Mock data for room availability
const roomAvailability = {
  standard: { total: 10, available: 6 },
  deluxe: { total: 8, available: 3 },
  family: { total: 5, available: 2 },
  executive: { total: 3, available: 1 },
}

export default function HotelAdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showNewBookingForm, setShowNewBookingForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [bookings, setBookings] = useState(initialBookings)
  const [inquiries, setInquiries] = useState(initialInquiries)

  // Room management state
  const [showRoomManagement, setShowRoomManagement] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
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
    price: 0,
    description: "",
  })
  const [formErrors, setFormErrors] = useState({})

  // Mock data for individual rooms
  const initialRooms = [
    {
      id: "room-101",
      number: "101",
      type: "standard",
      capacity: 2,
      amenities: ["WiFi", "AC", "TV", "Private Bathroom"],
      status: "available",
      floor: 1,
      price: 80,
      description: "Comfortable standard room with mountain view",
    },
    {
      id: "room-102",
      number: "102",
      type: "standard",
      capacity: 2,
      amenities: ["WiFi", "AC", "TV", "Private Bathroom"],
      status: "occupied",
      floor: 1,
      price: 80,
      description: "Comfortable standard room with garden view",
    },
    {
      id: "room-201",
      number: "201",
      type: "deluxe",
      capacity: 3,
      amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Mini Bar", "Balcony"],
      status: "available",
      floor: 2,
      price: 120,
      description: "Spacious deluxe room with panoramic mountain views",
    },
    {
      id: "room-301",
      number: "301",
      type: "family",
      capacity: 4,
      amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Mini Bar", "Kitchenette"],
      status: "maintenance",
      floor: 3,
      price: 180,
      description: "Large family suite perfect for groups",
    },
    {
      id: "room-401",
      number: "401",
      type: "executive",
      capacity: 2,
      amenities: ["WiFi", "AC", "TV", "Private Bathroom", "Mini Bar", "Balcony", "Work Desk", "Premium Bedding"],
      status: "available",
      floor: 4,
      price: 220,
      description: "Luxury executive suite with premium amenities",
    },
  ]

  const [rooms, setRooms] = useState(initialRooms)

  const availableAmenities = [
    "WiFi",
    "AC",
    "TV",
    "Private Bathroom",
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
  ]

  const roomTypes = [
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

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Validation functions
  const validateRoomData = (data) => {
    const errors = {}

    if (!data.number || data.number.trim() === "") {
      errors.number = "Room number is required"
    } else if (!/^[A-Z0-9]{1,4}$/i.test(data.number)) {
      errors.number = "Room number must be 1-4 alphanumeric characters"
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

    if (!data.price || data.price < 50 || data.price > 2000) {
      errors.price = "Price must be between $50 and $2000"
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
    console.log("Check-in button clicked for:", selectedBooking?.guestName)
    if (!selectedBooking) return

    try {
      await simulateAsyncOperation("check-in")

      setBookings((prev) =>
        prev.map((booking) => (booking.id === selectedBooking.id ? { ...booking, status: "checked-in" } : booking)),
      )

      setSelectedBooking((prev) => ({ ...prev, status: "checked-in" }))
      setShowCheckInDialog(false)
      showToast("Success", `${selectedBooking.guestName} has been checked in to room ${selectedBooking.roomNumber}`)
    } catch (error) {
      handleError(error, "check in guest")
    }
  }

  const handleCheckOut = async () => {
    console.log("Check-out button clicked for:", selectedBooking?.guestName)
    if (!selectedBooking) return

    try {
      await simulateAsyncOperation("check-out")

      setBookings((prev) =>
        prev.map((booking) => (booking.id === selectedBooking.id ? { ...booking, status: "checked-out" } : booking)),
      )

      setSelectedBooking((prev) => ({ ...prev, status: "checked-out" }))
      setShowCheckOutDialog(false)
      showToast("Success", `${selectedBooking.guestName} has been checked out from room ${selectedBooking.roomNumber}`)
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
      await simulateAsyncOperation("edit-booking")

      setBookings((prev) =>
        prev.map((booking) => (booking.id === selectedBooking.id ? { ...booking, ...editFormData } : booking)),
      )

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
      await simulateAsyncOperation("cancel-booking")

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, status: "cancelled", cancelReason } : booking,
        ),
      )

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
      await simulateAsyncOperation("status-change", 500)

      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)),
      )

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
      await simulateAsyncOperation("payment-status-change", 500)

      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? { ...booking, paymentStatus: newStatus } : booking)),
      )

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

      setInquiries((prev) =>
        prev.map((inquiry) => (inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry)),
      )

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
      await simulateAsyncOperation("send-inquiry-reply")

      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === selectedInquiry.id ? { ...inquiry, status: "replied", reply: reply.trim() } : inquiry,
        ),
      )

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

    // Check if room number already exists
    if (rooms.find((room) => room.number === roomFormData.number)) {
      showToast("Error", "Room number already exists", "destructive")
      return
    }

    try {
      await simulateAsyncOperation("add-room")

      const newRoom = {
        id: `room-${roomFormData.number}-${Date.now()}`,
        ...roomFormData,
        capacity: Number.parseInt(roomFormData.capacity),
        floor: Number.parseInt(roomFormData.floor),
        price: Number.parseFloat(roomFormData.price),
      }

      setRooms((prev) => [...prev, newRoom])
      setShowAddRoomDialog(false)
      setRoomFormData({
        number: "",
        type: "",
        capacity: 1,
        amenities: [],
        status: "available",
        floor: 1,
        price: 0,
        description: "",
      })
      setFormErrors({})
      showToast("Success", `Room ${roomFormData.number} added successfully`)
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

    // Check if room number already exists (excluding current room)
    if (rooms.find((room) => room.number === roomFormData.number && room.id !== selectedRoom.id)) {
      showToast("Error", "Room number already exists", "destructive")
      return
    }

    try {
      await simulateAsyncOperation("edit-room")

      setRooms((prev) =>
        prev.map((room) =>
          room.id === selectedRoom.id
            ? {
                ...room,
                ...roomFormData,
                capacity: Number.parseInt(roomFormData.capacity),
                floor: Number.parseInt(roomFormData.floor),
                price: Number.parseFloat(roomFormData.price),
              }
            : room,
        ),
      )

      setShowEditRoomDialog(false)
      setSelectedRoom(null)
      setRoomFormData({
        number: "",
        type: "",
        capacity: 1,
        amenities: [],
        status: "available",
        floor: 1,
        price: 0,
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
      showToast("Error", "Cannot delete occupied room. Please check out the guest first.", "destructive")
      return
    }

    try {
      await simulateAsyncOperation("delete-room")

      setRooms((prev) => prev.filter((room) => room.id !== selectedRoom.id))
      setShowDeleteRoomDialog(false)
      setSelectedRoom(null)
      showToast("Success", `Room ${selectedRoom.number} deleted successfully`)
    } catch (error) {
      handleError(error, "delete room")
    }
  }

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await simulateAsyncOperation("room-status-change", 500)

      setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, status: newStatus } : room)))
      showToast("Success", `Room status updated to ${newStatus}`)
    } catch (error) {
      handleError(error, "update room status")
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
      price: 0,
      description: "",
    })
    setFormErrors({})
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-semibold">Hindukush Sarai</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">Hotel Admin Panel</div>
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
                <Badge className="ml-auto bg-red-500">{inquiries.filter((i) => i.status === "new").length}</Badge>
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
              <div className="text-xs text-muted-foreground">manager@hindukushsarai.com</div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 gap-2">
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
                    <div className="text-3xl font-bold">{bookings.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">+2 from yesterday</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Occupancy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">68%</div>
                    <p className="text-xs text-emerald-500 mt-1">+5% from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">New Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{inquiries.filter((i) => i.status === "new").length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (This Month)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">$3,240</div>
                    <p className="text-xs text-emerald-500 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest 5 bookings received</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
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
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("bookings")}>
                      View All Bookings
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Room Availability</CardTitle>
                    <CardDescription>Current room status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(roomAvailability).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Room</div>
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
                      className="w-full"
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
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Check-in: Ahmed Khan (HKS-123456)</div>
                        <div className="text-sm text-muted-foreground">Deluxe Room - 2 guests - 2:00 PM</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={() => {
                          const booking = bookings.find((b) => b.id === "HKS-123456")
                          if (booking) {
                            setSelectedBooking(booking)
                            setActiveTab("bookings")
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 text-red-700 p-2 rounded-full">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Check-out: Michael Brown (HKS-345678)</div>
                        <div className="text-sm text-muted-foreground">Standard Room - 1 guest - 12:00 PM</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={() => {
                          const booking = bookings.find((b) => b.id === "HKS-345678")
                          if (booking) {
                            setSelectedBooking(booking)
                            setActiveTab("bookings")
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">NGO Meeting: UNDP Pakistan</div>
                        <div className="text-sm text-muted-foreground">Conference Room - 10 attendees - 3:00 PM</div>
                      </div>
                      <Button size="sm" variant="outline" className="ml-auto">
                        View Details
                      </Button>
                    </div>
                  </div>
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

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                  <TabsTrigger value="checked-in">Checked In</TabsTrigger>
                  <TabsTrigger value="checked-out">Checked Out</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
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
                              <td className="p-4 font-medium">{booking.id}</td>
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
                                <Badge className={booking.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500"}>
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
                                <td className="p-4 font-medium">{booking.id}</td>
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
                                <td className="p-4 font-medium">{booking.id}</td>
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
                                <td className="p-4 font-medium">{booking.id}</td>
                                <td className="p-4">{booking.guestName}</td>
                                <td className="p-4">
                                  {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                                </td>
                                <td className="p-4">${booking.totalAmount}</td>
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
                                <td className="p-4 font-medium">{booking.id}</td>
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
                    <CardDescription>Details for booking {selectedBooking.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Booking ID</h3>
                        <p className="font-medium">{selectedBooking.id}</p>
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
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Room Number</h3>
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
                        <p className="font-medium">${selectedBooking.totalAmount}</p>
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
                      className="w-full"
                      disabled={isLoading}
                      onClick={() => {
                        setEmailSubject(`Booking Confirmation - ${selectedBooking.id}`)
                        setEmailMessage(
                          `Dear ${selectedBooking.guestName},\n\nYour booking at Hindukush Sarai has been confirmed.\n\nBooking Details:\n- Booking ID: ${selectedBooking.id}\n- Check-in: ${format(selectedBooking.checkIn, "MMMM d, yyyy")}\n- Check-out: ${format(selectedBooking.checkOut, "MMMM d, yyyy")}\n- Room: ${selectedBooking.roomType}\n- Total Amount: $${selectedBooking.totalAmount}\n\nWe look forward to welcoming you!\n\nBest regards,\nHindukush Sarai Team`,
                        )
                        setShowEmailDialog(true)
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Confirmation Email
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isLoading}
                      onClick={() => {
                        setEditFormData({
                          guestName: selectedBooking.guestName,
                          email: selectedBooking.email,
                          phone: selectedBooking.phone,
                          roomNumber: selectedBooking.roomNumber,
                          specialRequests: selectedBooking.specialRequests || "",
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
                    New <Badge className="ml-1 bg-red-500">{inquiries.filter((i) => i.status === "new").length}</Badge>
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
                          {inquiries.map((inquiry) => (
                            <tr key={inquiry.id} className="border-b hover:bg-muted/50">
                              <td className="p-4 font-medium">{inquiry.id}</td>
                              <td className="p-4">{inquiry.name}</td>
                              <td className="p-4">{format(inquiry.date, "MMM d, yyyy")}</td>
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
                          {inquiries
                            .filter((inquiry) => inquiry.status === "new")
                            .map((inquiry) => (
                              <tr key={inquiry.id} className="border-b hover:bg-muted/50">
                                <td className="p-4 font-medium">{inquiry.id}</td>
                                <td className="p-4">{inquiry.name}</td>
                                <td className="p-4">{format(inquiry.date, "MMM d, yyyy")}</td>
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
                          {inquiries
                            .filter((inquiry) => inquiry.status === "replied")
                            .map((inquiry) => (
                              <tr key={inquiry.id} className="border-b hover:bg-muted/50">
                                <td className="p-4 font-medium">{inquiry.id}</td>
                                <td className="p-4">{inquiry.name}</td>
                                <td className="p-4">{format(inquiry.date, "MMM d, yyyy")}</td>
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
                        {format(selectedInquiry.date, "MMMM d, yyyy")} · {selectedInquiry.email} ·{" "}
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
                      <CardTitle>{type.charAt(0).toUpperCase() + type.slice(1)} Rooms</CardTitle>
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
                        {Array.from({ length: data.total }, (_, i) => (
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
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setShowRoomManagement(true)}>
                        Manage Rooms
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
                <p className="text-muted-foreground">Manage individual rooms, their details, and availability</p>
                <Button onClick={() => setShowAddRoomDialog(true)} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Room
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Room Number</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Capacity</th>
                        <th className="text-left p-4">Floor</th>
                        <th className="text-left p-4">Price/Night</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={room.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{room.number}</td>
                          <td className="p-4 capitalize">{room.type}</td>
                          <td className="p-4">{room.capacity} guests</td>
                          <td className="p-4">Floor {room.floor}</td>
                          <td className="p-4">${room.price}</td>
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
                                    price: room.price,
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
                  <CardDescription>Manage room types and pricing for all room categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Standard Room Rate</Label>
                        <Input defaultValue="$80" />
                      </div>
                      <div className="space-y-2">
                        <Label>Deluxe Room Rate</Label>
                        <Input defaultValue="$120" />
                      </div>
                      <div className="space-y-2">
                        <Label>Family Suite Rate</Label>
                        <Input defaultValue="$180" />
                      </div>
                      <div className="space-y-2">
                        <Label>Executive Suite Rate</Label>
                        <Input defaultValue="$220" />
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Pricing Rules</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Peak Season Multiplier (%)</Label>
                          <Input defaultValue="25" placeholder="e.g., 25 for 25% increase" />
                        </div>
                        <div className="space-y-2">
                          <Label>Group Discount (5+ rooms) (%)</Label>
                          <Input defaultValue="10" placeholder="e.g., 10 for 10% discount" />
                        </div>
                        <div className="space-y-2">
                          <Label>Extended Stay Discount (7+ nights) (%)</Label>
                          <Input defaultValue="15" placeholder="e.g., 15 for 15% discount" />
                        </div>
                        <div className="space-y-2">
                          <Label>Corporate/NGO Discount (%)</Label>
                          <Input defaultValue="20" placeholder="e.g., 20 for 20% discount" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => showToast("Success", "Room rates updated successfully")}>Update Rates</Button>
                </CardFooter>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <Card key={room.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Room {room.number}</CardTitle>
                          <CardDescription className="capitalize">{room.type} Room</CardDescription>
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
                          <span>{room.capacity} guests</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Floor:</span>
                          <span>Floor {room.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">${room.price}/night</span>
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
                      {bookings.map((booking) => (
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
                      <Input id="hotel-name" defaultValue="Hindukush Sarai" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-email">Email</Label>
                      <Input id="hotel-email" defaultValue="info@hindukushsarai.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-phone">Phone</Label>
                      <Input id="hotel-phone" defaultValue="+92 345 1234567" />
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
              Confirm check-in for {selectedBooking?.guestName} to room {selectedBooking?.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-md">
                <Check className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Ready to check in</p>
                  <p className="text-sm text-muted-foreground">
                    Guest will be marked as checked-in and room {selectedBooking?.roomNumber} will be occupied
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
              Confirm check-out for {selectedBooking?.guestName} from room {selectedBooking?.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-md">
                <X className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Ready to check out</p>
                  <p className="text-sm text-muted-foreground">
                    Guest will be marked as checked-out and room {selectedBooking?.roomNumber} will be available
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
                  value={editFormData.guestName || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, guestName: e.target.value }))}
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
                <Label htmlFor="edit-room-number">Room Number</Label>
                <Input
                  id="edit-room-number"
                  value={editFormData.roomNumber || ""}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, roomNumber: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-special-requests">Special Requests</Label>
              <Textarea
                id="edit-special-requests"
                value={editFormData.specialRequests || ""}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, specialRequests: e.target.value }))}
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
              Save Changes
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
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">This action cannot be undone</p>
                <p className="text-sm text-red-600">The booking will be permanently cancelled</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isLoading}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>Create a new room with details and amenities</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-room-number">Room Number *</Label>
                <Input
                  id="add-room-number"
                  value={roomFormData.number}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder="e.g., 101"
                  className={formErrors.number ? "border-red-500" : ""}
                />
                {formErrors.number && <p className="text-sm text-red-500">{formErrors.number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room-type">Room Type *</Label>
                <Select
                  value={roomFormData.type}
                  onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={formErrors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && <p className="text-sm text-red-500">{formErrors.type}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room-capacity">Capacity *</Label>
                <Input
                  id="add-room-capacity"
                  type="number"
                  min="1"
                  max="10"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  className={formErrors.capacity ? "border-red-500" : ""}
                />
                {formErrors.capacity && <p className="text-sm text-red-500">{formErrors.capacity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room-floor">Floor *</Label>
                <Input
                  id="add-room-floor"
                  type="number"
                  min="1"
                  max="20"
                  value={roomFormData.floor}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: e.target.value }))}
                  className={formErrors.floor ? "border-red-500" : ""}
                />
                {formErrors.floor && <p className="text-sm text-red-500">{formErrors.floor}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room-price">Price per Night ($) *</Label>
                <Input
                  id="add-room-price"
                  type="number"
                  min="50"
                  max="2000"
                  step="0.01"
                  value={roomFormData.price}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className={formErrors.price ? "border-red-500" : ""}
                />
                {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-room-status">Status</Label>
                <Select
                  value={roomFormData.status}
                  onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amenities *</Label>
              <div
                className={`grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-3 ${formErrors.amenities ? "border-red-500" : ""}`}
              >
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomFormData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
              {formErrors.amenities && <p className="text-sm text-red-500">{formErrors.amenities}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-room-description">Description</Label>
              <Textarea
                id="add-room-description"
                value={roomFormData.description}
                onChange={(e) => setRoomFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the room"
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
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditRoomDialog} onOpenChange={setShowEditRoomDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>Update room details and amenities</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-room-number">Room Number *</Label>
                <Input
                  id="edit-room-number"
                  value={roomFormData.number}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder="e.g., 101"
                  className={formErrors.number ? "border-red-500" : ""}
                />
                {formErrors.number && <p className="text-sm text-red-500">{formErrors.number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-type">Room Type *</Label>
                <Select
                  value={roomFormData.type}
                  onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={formErrors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && <p className="text-sm text-red-500">{formErrors.type}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-capacity">Capacity *</Label>
                <Input
                  id="edit-room-capacity"
                  type="number"
                  min="1"
                  max="10"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  className={formErrors.capacity ? "border-red-500" : ""}
                />
                {formErrors.capacity && <p className="text-sm text-red-500">{formErrors.capacity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-floor">Floor *</Label>
                <Input
                  id="edit-room-floor"
                  type="number"
                  min="1"
                  max="20"
                  value={roomFormData.floor}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: e.target.value }))}
                  className={formErrors.floor ? "border-red-500" : ""}
                />
                {formErrors.floor && <p className="text-sm text-red-500">{formErrors.floor}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-price">Price per Night ($) *</Label>
                <Input
                  id="edit-room-price"
                  type="number"
                  min="50"
                  max="2000"
                  step="0.01"
                  value={roomFormData.price}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className={formErrors.price ? "border-red-500" : ""}
                />
                {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-status">Status</Label>
                <Select
                  value={roomFormData.status}
                  onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amenities *</Label>
              <div
                className={`grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-3 ${formErrors.amenities ? "border-red-500" : ""}`}
              >
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomFormData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
              {formErrors.amenities && <p className="text-sm text-red-500">{formErrors.amenities}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-room-description">Description</Label>
              <Textarea
                id="edit-room-description"
                value={roomFormData.description}
                onChange={(e) => setRoomFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the room"
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
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog open={showDeleteRoomDialog} onOpenChange={setShowDeleteRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">This action is permanent</p>
                <p className="text-sm text-red-600">
                  Room {selectedRoom?.number} and all its data will be permanently removed
                </p>
              </div>
            </div>
            {selectedRoom?.status === "occupied" && (
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-md mt-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Cannot delete occupied room</p>
                  <p className="text-sm text-amber-600">Please check out the guest first before deleting this room</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteRoomDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRoom}
              disabled={selectedRoom?.status === "occupied" || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
