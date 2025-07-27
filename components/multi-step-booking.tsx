"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookingData {
  checkIn: string
  checkOut: string
  guests: number
  roomType: string
  name: string
  email: string
  phone: string
  specialRequests: string
}

export function MultiStepBooking() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomType: "",
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  })

  const updateBookingData = (field: keyof BookingData, value: string | number) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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
          status: "pending",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit booking")
      }

      const result = await response.json()

      toast({
        title: "Booking Submitted!",
        description: "We'll contact you shortly to confirm your reservation.",
      })

      setCurrentStep(4)
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Dates & Guests", icon: Calendar },
    { number: 2, title: "Room Selection", icon: MapPin },
    { number: 3, title: "Guest Details", icon: Users },
    { number: 4, title: "Confirmation", icon: Check },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${currentStep >= step.number ? "text-blue-600" : "text-gray-500"}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-300"}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Select Your Dates"}
            {currentStep === 2 && "Choose Your Room"}
            {currentStep === 3 && "Guest Information"}
            {currentStep === 4 && "Booking Confirmed!"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "When would you like to stay with us?"}
            {currentStep === 2 && "Select the perfect room for your stay"}
            {currentStep === 3 && "Please provide your contact details"}
            {currentStep === 4 && "Thank you for choosing Hindukush Heights Sarai"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Dates & Guests */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => updateBookingData("checkIn", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out Date</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => updateBookingData("checkOut", e.target.value)}
                    min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Select
                  value={bookingData.guests.toString()}
                  onValueChange={(value) => updateBookingData("guests", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guests" />
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
            </div>
          )}

          {/* Step 2: Room Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {[
                  {
                    id: "deluxe",
                    name: "Deluxe Mountain View",
                    price: "$120/night",
                    description: "Spacious room with stunning mountain views",
                  },
                  {
                    id: "suite",
                    name: "Executive Suite",
                    price: "$180/night",
                    description: "Luxury suite with separate living area",
                  },
                  {
                    id: "family",
                    name: "Family Room",
                    price: "$200/night",
                    description: "Perfect for families with connecting rooms",
                  },
                ].map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      bookingData.roomType === room.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => updateBookingData("roomType", room.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-sm text-gray-600">{room.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{room.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Guest Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={bookingData.name}
                    onChange={(e) => updateBookingData("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => updateBookingData("email", e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={bookingData.phone}
                  onChange={(e) => updateBookingData("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="requests">Special Requests</Label>
                <Textarea
                  id="requests"
                  value={bookingData.specialRequests}
                  onChange={(e) => updateBookingData("specialRequests", e.target.value)}
                  placeholder="Any special requests or requirements?"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-600">Booking Submitted Successfully!</h3>
                <p className="text-gray-600 mt-2">
                  We've received your booking request and will contact you within 24 hours to confirm your reservation.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold mb-2">Booking Summary:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Dates:</strong> {bookingData.checkIn} to {bookingData.checkOut}
                  </p>
                  <p>
                    <strong>Guests:</strong> {bookingData.guests}
                  </p>
                  <p>
                    <strong>Room:</strong> {bookingData.roomType}
                  </p>
                  <p>
                    <strong>Name:</strong> {bookingData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {bookingData.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || currentStep === 4}>
              Previous
            </Button>

            {currentStep < 3 && (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (!bookingData.checkIn || !bookingData.checkOut)) ||
                  (currentStep === 2 && !bookingData.roomType)
                }
              >
                Next
              </Button>
            )}

            {currentStep === 3 && (
              <Button onClick={handleSubmit} disabled={isSubmitting || !bookingData.name || !bookingData.email}>
                {isSubmitting ? "Submitting..." : "Submit Booking"}
              </Button>
            )}

            {currentStep === 4 && <Button onClick={() => window.location.reload()}>Make Another Booking</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
