"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
// Simple date formatting function to replace date-fns
const format = (date: Date, formatStr: string) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  if (formatStr === "yyyy-MM-dd") {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  if (formatStr === "PPP") {
    const fullMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return `${fullMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  // Default fallback
  return date.toLocaleDateString()
}
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface BookingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  checkIn: string
  checkOut: string
  roomType: string
  guests: number
  specialRequests: string
  purposeOfVisit: string
}

export function MultiStepBooking() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const { toast } = useToast()

  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    checkIn: "",
    checkOut: "",
    roomType: "",
    guests: 1,
    specialRequests: "",
    purposeOfVisit: "",
  })

  const updateBookingData = (field: keyof BookingData, value: string | number) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive",
          })
          return false
        }
        return true
      case 2:
        if (!checkInDate || !checkOutDate || !bookingData.roomType) {
          toast({
            title: "Missing Information",
            description: "Please select check-in/check-out dates and room type.",
            variant: "destructive",
          })
          return false
        }
        return true
      case 3:
        return true
      default:
        return true
    }
  }

  const handleDateSelect = (type: "checkIn" | "checkOut", date: Date | undefined) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd")
      if (type === "checkIn") {
        setCheckInDate(date)
        updateBookingData("checkIn", dateString)
      } else {
        setCheckOutDate(date)
        updateBookingData("checkOut", dateString)
      }
    }
  }

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return 0
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const roomPrices: { [key: string]: number } = {
      "Deluxe Room": 8000,
      "Standard Room": 6000,
      "Budget Room": 4000,
      "Family Suite": 12000,
    }
    const basePrice = roomPrices[bookingData.roomType] || 6000
    return basePrice * nights
  }

  const handleSubmit = async () => {
    console.log("🚀 Starting booking submission...")
    setIsSubmitting(true)

    try {
      const totalAmount = calculateTotal()
      const nights =
        checkInDate && checkOutDate
          ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
          : 1

      const submissionData = {
        ...bookingData,
        totalAmount,
        nights,
      }

      console.log("📤 Submitting booking data:", submissionData)

      // Fix: Use absolute URL to ensure correct API endpoint
      const apiUrl = window.location.origin + "/api/bookings"
      console.log("📡 API URL:", apiUrl)

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
        // Fix: Add these options to handle potential network issues
        cache: "no-cache",
        credentials: "same-origin",
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("📡 Raw response text:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
        console.log("📡 Parsed response:", result)
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        console.error("❌ Booking failed:", result)
        throw new Error(result.details || result.error || "Booking failed")
      }

      if (result.success) {
        console.log("✅ Booking successful:", result)
        toast({
          title: "Booking Confirmed!",
          description: `Your booking reference is ${result.booking.booking_reference}`,
        })
        setCurrentStep(5) // Success step
      } else {
        console.error("❌ Booking failed:", result)
        throw new Error(result.error || "Booking failed")
      }
    } catch (error) {
      console.error("❌ Booking submission error:", error)
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "There was an error processing your booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={bookingData.firstName}
                  onChange={(e) => updateBookingData("firstName", e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={bookingData.lastName}
                  onChange={(e) => updateBookingData("lastName", e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={bookingData.email}
                onChange={(e) => updateBookingData("email", e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={bookingData.phone}
                onChange={(e) => updateBookingData("phone", e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={bookingData.nationality}
                onChange={(e) => updateBookingData("nationality", e.target.value)}
                placeholder="Enter your nationality"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkInDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => handleDateSelect("checkIn", date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Check-out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkOutDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={(date) => handleDateSelect("checkOut", date)}
                      disabled={(date) => date <= (checkInDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label htmlFor="roomType">Room Type *</Label>
              <Select value={bookingData.roomType} onValueChange={(value) => updateBookingData("roomType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Budget Room">Budget Room - PKR 4,000/night</SelectItem>
                  <SelectItem value="Standard Room">Standard Room - PKR 6,000/night</SelectItem>
                  <SelectItem value="Deluxe Room">Deluxe Room - PKR 8,000/night</SelectItem>
                  <SelectItem value="Family Suite">Family Suite - PKR 12,000/night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Select
                value={bookingData.guests.toString()}
                onValueChange={(value) => updateBookingData("guests", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Guest</SelectItem>
                  <SelectItem value="2">2 Guests</SelectItem>
                  <SelectItem value="3">3 Guests</SelectItem>
                  <SelectItem value="4">4 Guests</SelectItem>
                  <SelectItem value="5">5+ Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {checkInDate && checkOutDate && bookingData.roomType && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <p>Nights: {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))}</p>
                <p>Room: {bookingData.roomType}</p>
                <p className="font-semibold">Total: PKR {calculateTotal().toLocaleString()}</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={bookingData.specialRequests}
                onChange={(e) => updateBookingData("specialRequests", e.target.value)}
                placeholder="Any special requests or dietary requirements?"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
              <Select
                value={bookingData.purposeOfVisit}
                onValueChange={(value) => updateBookingData("purposeOfVisit", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose of visit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tourism">Tourism</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Adventure">Adventure/Trekking</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">What's Included</h4>
              <ul className="text-sm space-y-1">
                <li>• Traditional Pakistani breakfast</li>
                <li>• Free WiFi throughout the property</li>
                <li>• 24/7 front desk service</li>
                <li>• Mountain view from most rooms</li>
                <li>• Cultural experience programs</li>
              </ul>
            </div>
          </div>
        )

      case 4:
        const total = calculateTotal()
        const nights =
          checkInDate && checkOutDate
            ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0

        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Guest:</span>
                  <span>
                    {bookingData.firstName} {bookingData.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{bookingData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{bookingData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{checkInDate ? format(checkInDate, "PPP") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{checkOutDate ? format(checkOutDate, "PPP") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Type:</span>
                  <span>{bookingData.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{bookingData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{nights}</span>
                </div>
                {bookingData.purposeOfVisit && (
                  <div className="flex justify-between">
                    <span>Purpose:</span>
                    <span>{bookingData.purposeOfVisit}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>By confirming this booking, you agree to our terms and conditions.</p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-6xl">✓</div>
            <h3 className="text-2xl font-bold text-green-600">Booking Confirmed!</h3>
            <p>Thank you for your booking. You will receive a confirmation email shortly.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Make Another Booking
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information"
      case 2:
        return "Booking Details"
      case 3:
        return "Additional Information"
      case 4:
        return "Review & Confirm"
      case 5:
        return "Booking Confirmed"
      default:
        return ""
    }
  }

  if (currentStep === 5) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">{renderStep()}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{getStepTitle()}</CardTitle>
        <CardDescription>Step {currentStep} of 4</CardDescription>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
