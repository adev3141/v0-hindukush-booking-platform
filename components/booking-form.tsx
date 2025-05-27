"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function BookingForm() {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState("2")
  const [roomType, setRoomType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would submit to a backend
    alert(
      "Booking request submitted! Our team will contact you shortly to confirm your reservation and discuss payment options.",
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="room-type">Room Type</Label>
          <Select value={roomType} onValueChange={setRoomType} required>
            <SelectTrigger id="room-type">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Room</SelectItem>
              <SelectItem value="deluxe">Deluxe Room</SelectItem>
              <SelectItem value="family">Family Suite</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          <Select defaultValue="1">
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

        <div className="grid gap-2">
          <Label htmlFor="visit-purpose">Purpose of Visit</Label>
          <Select>
            <SelectTrigger id="visit-purpose" className="w-full">
              <SelectValue placeholder="Select purpose of visit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="family">Family Vacation</SelectItem>
              <SelectItem value="business">Business Trip</SelectItem>
              <SelectItem value="corporate">Corporate Retreat</SelectItem>
              <SelectItem value="ngo">NGO Work</SelectItem>
              <SelectItem value="adventure">Adventure Tourism</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Guest Information</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" required />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="special-requests">Special Requests (Optional)</Label>
          <textarea
            id="special-requests"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Any special requests or requirements?"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Request Reservation
      </Button>
    </form>
  )
}
