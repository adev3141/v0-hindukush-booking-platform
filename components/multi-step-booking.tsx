"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronRight, CreditCard, Landmark, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Mock data for available rooms
const availableRooms = [
  {
    id: "standard",
    name: "Standard Room",
    description: "Comfortable room with garden views, perfect for solo travelers or couples.",
    price: 80,
    available: 5,
    maxGuests: 2,
    features: ["Garden View", "Inverter AC (Heating/Cooling)", "24/7 Power", "Free WiFi", "Breakfast Included"],
  },
  {
    id: "deluxe",
    name: "Deluxe Room",
    description: "Spacious room with premium furnishings and views of our beautiful garden.",
    price: 120,
    available: 3,
    maxGuests: 3,
    features: [
      "Garden View",
      "Inverter AC (Heating/Cooling)",
      "24/7 Power",
      "Free WiFi",
      "Breakfast Included",
      "Work Desk",
      "Mini Bar",
    ],
  },
  {
    id: "family",
    name: "Family Suite",
    description: "Perfect for families, with separate living area and direct access to garden.",
    price: 180,
    available: 2,
    maxGuests: 5,
    features: [
      "Garden Access",
      "Inverter AC (Heating/Cooling)",
      "24/7 Power",
      "Free WiFi",
      "Breakfast Included",
      "Living Area",
      "2 Bathrooms",
    ],
  },
  {
    id: "executive",
    name: "Executive Suite",
    description: "Our premium offering for corporate clients and NGO executives.",
    price: 220,
    available: 1,
    maxGuests: 2,
    features: [
      "Park View",
      "Inverter AC (Heating/Cooling)",
      "24/7 Power",
      "High-Speed WiFi",
      "Breakfast Included",
      "Conference Room Access",
    ],
  },
]

export function MultiStepBooking({ initialData }: { initialData?: any }) {
  const [step, setStep] = useState(initialData ? 2 : 1)
  const [checkIn, setCheckIn] = useState(initialData?.checkIn || undefined)
  const [checkOut, setCheckOut] = useState(initialData?.checkOut || undefined)
  const [guests, setGuests] = useState(initialData?.guests?.toString() || "2")
  const [rooms, setRooms] = useState(initialData?.rooms?.toString() || "1")
  const [selectedRoomType, setSelectedRoomType] = useState("")
  const [roomCount, setRoomCount] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })
  const [bankTransferDetails, setBankTransferDetails] = useState({
    accountName: "",
    bankName: "",
    reference: "",
  })
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingReference, setBookingReference] = useState("")

  const handleDateSelection = () => {
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates")
      return
    }
    setStep(2)
  }

  const handleRoomSelection = () => {
    if (!selectedRoomType) {
      alert("Please select a room type")
      return
    }
    setStep(3)
  }

  const handleGuestInfoSubmit = () => {
    // Validate guest information
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert("Please fill in all required guest information fields")
      return
    }
    setStep(4)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleBankTransferDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBankTransferDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate payment details based on selected method
    if (paymentMethod === "credit-card") {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        alert("Please fill in all credit card details")
        return
      }
    } else if (paymentMethod === "bank-transfer") {
      if (!bankTransferDetails.accountName || !bankTransferDetails.bankName || !bankTransferDetails.reference) {
        alert("Please fill in all bank transfer details")
        return
      }
    }

    // Generate a random booking reference
    const reference = `HKS-${Math.floor(100000 + Math.random() * 900000)}`
    setBookingReference(reference)
    setBookingConfirmed(true)
    setStep(5)
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    try {
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch (error) {
      console.error("Error calculating nights:", error)
      return 0
    }
  }

  const nights = calculateNights()
  const selectedRoom = availableRooms.find((room) => room.id === selectedRoomType)
  const totalPrice = selectedRoom ? selectedRoom.price * nights * roomCount : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
        <CardDescription>Check availability and book your room at Hindukush Sarai</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? "bg-emerald-600 text-white" : "border border-muted-foreground text-muted-foreground"}`}
            >
              {step > 1 ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <div className={`h-1 w-full ${step >= 2 ? "bg-emerald-600" : "bg-muted"}`}></div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? "bg-emerald-600 text-white" : "border border-muted-foreground text-muted-foreground"}`}
            >
              {step > 2 ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <div className={`h-1 w-full ${step >= 3 ? "bg-emerald-600" : "bg-muted"}`}></div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 3 ? "bg-emerald-600 text-white" : "border border-muted-foreground text-muted-foreground"}`}
            >
              {step > 3 ? <Check className="h-5 w-5" /> : "3"}
            </div>
            <div className={`h-1 w-full ${step >= 4 ? "bg-emerald-600" : "bg-muted"}`}></div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 4 ? "bg-emerald-600 text-white" : "border border-muted-foreground text-muted-foreground"}`}
            >
              {step > 4 ? <Check className="h-5 w-5" /> : "4"}
            </div>
            <div className={`h-1 w-full ${step >= 5 ? "bg-emerald-600" : "bg-muted"}`}></div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 5 ? "bg-emerald-600 text-white" : "border border-muted-foreground text-muted-foreground"}`}
            >
              5
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className={step >= 1 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>Dates</span>
            <span className={step >= 2 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>Room</span>
            <span className={step >= 3 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>Details</span>
            <span className={step >= 4 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>Payment</span>
            <span className={step >= 5 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>Confirmation</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="check-in">Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="check-in"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !checkIn && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="check-out">Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="check-out"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      initialFocus
                      disabled={(date) => !checkIn || date <= checkIn || date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger id="guests" className="w-full">
                    <SelectValue placeholder="Select number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5">5 Guests</SelectItem>
                    <SelectItem value="6">6+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rooms">Number of Rooms</Label>
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger id="rooms" className="w-full">
                    <SelectValue placeholder="Select number of rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Room</SelectItem>
                    <SelectItem value="2">2 Rooms</SelectItem>
                    <SelectItem value="3">3 Rooms</SelectItem>
                    <SelectItem value="4">4 Rooms</SelectItem>
                    <SelectItem value="5">5+ Rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full" onClick={handleDateSelection}>
              Check Availability
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Selected Dates</h3>
                <p className="text-sm text-muted-foreground">
                  {checkIn && checkOut
                    ? `${format(checkIn, "MMM d, yyyy")} - ${format(checkOut, "MMM d, yyyy")} · ${nights} night${nights !== 1 ? "s" : ""}`
                    : "No dates selected"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Change
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Available Rooms</h3>

              {availableRooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoomType === room.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-border hover:border-emerald-600"
                  }`}
                  onClick={() => setSelectedRoomType(room.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{room.name}</h4>
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {room.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted"
                          >
                            {feature}
                          </span>
                        ))}
                        {room.features.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted">
                            +{room.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${room.price}</div>
                      <div className="text-sm text-muted-foreground">per night</div>
                      <div className="mt-1 text-xs text-emerald-600">{room.available} rooms left</div>
                    </div>
                  </div>
                </div>
              ))}

              {selectedRoomType && (
                <div className="mt-4">
                  <Label htmlFor="room-count">Number of rooms</Label>
                  <Select value={roomCount.toString()} onValueChange={(value) => setRoomCount(Number.parseInt(value))}>
                    <SelectTrigger id="room-count" className="w-full mt-1">
                      <SelectValue placeholder="Select number of rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: Math.min(5, availableRooms.find((r) => r.id === selectedRoomType)?.available || 1) },
                        (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? "room" : "rooms"}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleRoomSelection} disabled={!selectedRoomType}>
              Continue to Guest Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Booking Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {checkIn && checkOut
                    ? `${format(checkIn, "MMM d, yyyy")} - ${format(checkOut, "MMM d, yyyy")} · ${nights} night${nights !== 1 ? "s" : ""}`
                    : "No dates selected"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Change
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{selectedRoom?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {roomCount} room{roomCount !== 1 ? "s" : ""} · {guests} guest
                  {Number.parseInt(guests) !== 1 ? "s" : ""}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                Change
              </Button>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>
                  ${selectedRoom?.price} x {nights} night{nights !== 1 ? "s" : ""} x {roomCount} room
                  {roomCount !== 1 ? "s" : ""}
                </span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Guest Information</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="special-requests">Special Requests (Optional)</Label>
                <textarea
                  id="special-requests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleFormChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any special requests or requirements?"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleGuestInfoSubmit}>
              Continue to Payment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Booking Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {checkIn && checkOut
                      ? `${format(checkIn, "MMM d, yyyy")} - ${format(checkOut, "MMM d, yyyy")} · ${nights} night${nights !== 1 ? "s" : ""}`
                      : "No dates selected"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Change
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{selectedRoom?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {roomCount} room{roomCount !== 1 ? "s" : ""} · {guests} guest
                    {Number.parseInt(guests) !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  Change
                </Button>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>
                    ${selectedRoom?.price} x {nights} night{nights !== 1 ? "s" : ""} x {roomCount} room
                    {roomCount !== 1 ? "s" : ""}
                  </span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span>Credit Card</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                  <Label htmlFor="bank-transfer" className="flex items-center gap-2 cursor-pointer">
                    <Landmark className="h-5 w-5 text-muted-foreground" />
                    <span>Bank Transfer</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <span>Pay at Hotel (Cash)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "credit-card" && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Credit Card Details</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardDetailsChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="card-name">Name on Card</Label>
                    <Input
                      id="card-name"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardDetailsChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardDetailsChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardDetailsChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "bank-transfer" && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Bank Transfer Details</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Please transfer the total amount to our bank account and provide the details below:
                </p>
                <div className="bg-muted p-4 rounded-md mb-4">
                  <p className="font-medium">Bank Account Details:</p>
                  <p>Bank: National Bank of Pakistan</p>
                  <p>Account Name: Hindukush Sarai</p>
                  <p>Account Number: 1234-5678-9012-3456</p>
                  <p>IBAN: PK36NBPA0123456789012345</p>
                  <p>Branch: Chitral Main Branch</p>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="account-name">Account Name (Sender)</Label>
                    <Input
                      id="account-name"
                      name="accountName"
                      value={bankTransferDetails.accountName}
                      onChange={handleBankTransferDetailsChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input
                      id="bank-name"
                      name="bankName"
                      value={bankTransferDetails.bankName}
                      onChange={handleBankTransferDetailsChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reference">Transfer Reference/ID</Label>
                    <Input
                      id="reference"
                      name="reference"
                      value={bankTransferDetails.reference}
                      onChange={handleBankTransferDetailsChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Pay at Hotel</h4>
                <p className="text-sm text-muted-foreground">
                  You've selected to pay at the hotel. Your booking will be confirmed, but payment will be collected
                  upon arrival.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium">Important Information:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Please arrive with valid ID for all guests</li>
                    <li>Payment can be made in cash (PKR) or by card upon arrival</li>
                    <li>Your reservation will be held until 6:00 PM on the day of arrival</li>
                    <li>For late arrivals, please contact the hotel in advance</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
                  I agree to the{" "}
                  <a href="#" className="text-emerald-600 hover:underline">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-emerald-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="w-1/2" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button type="submit" className="w-1/2">
                Complete Booking
              </Button>
            </div>
          </form>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Booking Confirmed!</h3>
              <p className="text-muted-foreground mt-2">
                Your booking at Hindukush Sarai has been confirmed. We look forward to welcoming you!
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Booking Reference</h4>
                <span className="font-mono font-bold">{bookingReference}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{checkIn ? format(checkIn, "EEEE, MMMM d, yyyy") : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{checkOut ? format(checkOut, "EEEE, MMMM d, yyyy") : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Type</span>
                  <span className="font-medium">{selectedRoom?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of Rooms</span>
                  <span className="font-medium">{roomCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">${totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">
                    {paymentMethod === "credit-card"
                      ? "Credit Card"
                      : paymentMethod === "bank-transfer"
                        ? "Bank Transfer"
                        : "Pay at Hotel"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md">
              <h4 className="font-medium text-emerald-800 mb-2">What's Next?</h4>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                  <span>A confirmation email has been sent to {formData.email}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                  <span>Our team will prepare for your arrival on {checkIn ? format(checkIn, "MMMM d") : ""}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                  <span>Check-in time is from 2:00 PM, and check-out is until 12:00 PM</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                  <span>For any questions, please contact us at +92 345 1234567</span>
                </li>
              </ul>
            </div>

            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              Return to Homepage
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
