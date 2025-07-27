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
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface BookingData {
  // Guest Information
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string

  // Booking Details
  checkIn: Date | undefined
  checkOut: Date | undefined
  roomType: string
  guests: number

  // Special Requests
  specialRequests: string

  // Emergency Contact
  emergencyName: string
  emergencyPhone: string
}

const initialBookingData: BookingData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nationality: "",
  checkIn: undefined,
  checkOut: undefined,
  roomType: "",
  guests: 1,
  specialRequests: "",
  emergencyName: "",
  emergencyPhone: "",
}

const roomTypes = [
  { value: "dormitory", label: "Dormitory Bed", price: 800 },
  { value: "standard", label: "Standard Room", price: 2500 },
  { value: "deluxe", label: "Deluxe Room", price: 4000 },
  { value: "suite", label: "Heritage Suite", price: 6500 },
]

export function MultiStepBooking() {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const totalSteps = 4

  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const diffTime = Math.abs(bookingData.checkOut.getTime() - bookingData.checkIn.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const calculateTotal = () => {
    const selectedRoom = roomTypes.find((room) => room.value === bookingData.roomType)
    const nights = calculateNights()
    return selectedRoom ? selectedRoom.price * nights : 0
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone
      case 2:
        return bookingData.checkIn && bookingData.checkOut && bookingData.roomType
      case 3:
        return true // Special requests are optional
      case 4:
        return bookingData.emergencyName && bookingData.emergencyPhone
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          totalAmount: calculateTotal(),
          nights: calculateNights(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking Confirmed!",
          description: "Your reservation has been successfully submitted. We'll contact you shortly.",
        })
        setBookingData(initialBookingData)
        setCurrentStep(1)
      } else {
        throw new Error("Booking failed")
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
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
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={bookingData.email}
                onChange={(e) => updateBookingData("email", e.target.value)}
                placeholder="Enter your email address"
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
                        !bookingData.checkIn && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.checkIn ? format(bookingData.checkIn, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.checkIn}
                      onSelect={(date) => updateBookingData("checkIn", date)}
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
                        !bookingData.checkOut && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.checkOut ? format(bookingData.checkOut, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.checkOut}
                      onSelect={(date) => updateBookingData("checkOut", date)}
                      disabled={(date) => date <= (bookingData.checkIn || new Date())}
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
                  {roomTypes.map((room) => (
                    <SelectItem key={room.value} value={room.value}>
                      {room.label} - PKR {room.price}/night
                    </SelectItem>
                  ))}
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
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {bookingData.checkIn && bookingData.checkOut && bookingData.roomType && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <p>Nights: {calculateNights()}</p>
                <p>Room: {roomTypes.find((r) => r.value === bookingData.roomType)?.label}</p>
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
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
              <Input
                id="emergencyName"
                value={bookingData.emergencyName}
                onChange={(e) => updateBookingData("emergencyName", e.target.value)}
                placeholder="Emergency contact full name"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
              <Input
                id="emergencyPhone"
                value={bookingData.emergencyPhone}
                onChange={(e) => updateBookingData("emergencyPhone", e.target.value)}
                placeholder="Emergency contact phone number"
              />
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold mb-2">Final Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Guest:</strong> {bookingData.firstName} {bookingData.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {bookingData.email}
                </p>
                <p>
                  <strong>Check-in:</strong> {bookingData.checkIn ? format(bookingData.checkIn, "PPP") : ""}
                </p>
                <p>
                  <strong>Check-out:</strong> {bookingData.checkOut ? format(bookingData.checkOut, "PPP") : ""}
                </p>
                <p>
                  <strong>Room:</strong> {roomTypes.find((r) => r.value === bookingData.roomType)?.label}
                </p>
                <p>
                  <strong>Guests:</strong> {bookingData.guests}
                </p>
                <p>
                  <strong>Nights:</strong> {calculateNights()}
                </p>
                <p className="text-lg font-semibold">
                  <strong>Total Amount:</strong> PKR {calculateTotal().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
        <CardDescription>
          Step {currentStep} of {totalSteps}:{" "}
          {currentStep === 1
            ? "Personal Information"
            : currentStep === 2
              ? "Booking Details"
              : currentStep === 3
                ? "Special Requests"
                : "Review & Confirm"}
        </CardDescription>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {renderStep()}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!validateStep(currentStep) || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
