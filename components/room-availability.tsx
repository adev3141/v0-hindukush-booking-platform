"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, addDays } from "date-fns"

// Mock data for room availability
const roomTypes = [
  { id: "standard", name: "Standard Room", price: 80 },
  { id: "deluxe", name: "Deluxe Room", price: 120 },
  { id: "family", name: "Family Suite", price: 180 },
  { id: "executive", name: "Executive Suite", price: 220 },
]

// Generate random availability for demo purposes
const generateAvailability = (startDate: Date, days: number) => {
  const result: Record<string, Record<string, number>> = {}

  roomTypes.forEach((room) => {
    result[room.id] = {}
    for (let i = 0; i < days; i++) {
      const date = format(addDays(startDate, i), "yyyy-MM-dd")
      // Random number between 0 and 5
      result[room.id][date] = Math.floor(Math.random() * 6)
    }
  })

  return result
}

export function RoomAvailability({
  startDate = new Date(),
  onBookNow,
}: {
  startDate?: Date
  onBookNow?: (roomId: string, date: Date) => void
}) {
  const [availability] = useState(() => {
    try {
      return generateAvailability(startDate || new Date(), 7)
    } catch (error) {
      console.error("Error generating availability:", error)
      return {}
    }
  })

  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  const handleBookNow = (roomId: string, date: Date) => {
    if (onBookNow) {
      onBookNow(roomId, date)
    } else {
      // Default behavior - scroll to booking section
      const bookingSection = document.getElementById("booking")
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Availability</CardTitle>
        <CardDescription>Check room availability for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(availability).length === 0 ? (
          <div className="p-4 text-center">Unable to load availability data. Please try again later.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Room Type</TableHead>
                  {dates.map((date) => (
                    <TableHead key={date.toString()} className="text-center">
                      <div className="font-medium">{format(date, "EEE")}</div>
                      <div className="text-xs text-muted-foreground">{format(date, "MMM d")}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">
                      <div>{room.name}</div>
                      <div className="text-xs text-muted-foreground">${room.price}/night</div>
                    </TableCell>
                    {dates.map((date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      const roomsLeft = availability[room.id][dateStr]
                      return (
                        <TableCell key={dateStr} className="text-center">
                          {roomsLeft > 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="flex items-center text-emerald-600 mb-1">
                                <Check className="h-4 w-4 mr-1" /> Available
                              </span>
                              <span className="text-xs text-muted-foreground mb-2">{roomsLeft} left</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleBookNow(room.id, date)}
                              >
                                Book
                              </Button>
                            </div>
                          ) : (
                            <span className="flex items-center justify-center text-red-500">
                              <X className="h-4 w-4 mr-1" /> Booked
                            </span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">Availability shown is for demonstration purposes only.</div>
      </CardFooter>
    </Card>
  )
}
