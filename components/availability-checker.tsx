"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"

export function AvailabilityChecker({ onCheckAvailability }: { onCheckAvailability?: (data: any) => void }) {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState("2")
  const [rooms, setRooms] = useState("1")

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates")
      return
    }

    const bookingData = {
      checkIn,
      checkOut,
      guests: Number.parseInt(guests, 10),
      rooms: Number.parseInt(rooms, 10),
    }

    if (onCheckAvailability) {
      onCheckAvailability(bookingData)
    }
  }

  return (
    <Card className="w-full shadow-md">
      <CardContent className="p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2 md:col-span-2">
            <div className="font-medium text-sm">Check-in</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
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

          <div className="space-y-2 md:col-span-2">
            <div className="font-medium text-sm">Check-out</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
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

          <div className="space-y-2 md:flex md:flex-col md:justify-end">
            <Button className="w-full gap-2" onClick={handleCheckAvailability}>
              <Search className="h-4 w-4" />
              Check Availability
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
