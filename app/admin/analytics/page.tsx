"use client"

/**
 * Admin Analytics Page
 *
 * Data sources:
 * - GET /api/bookings - For booking data and revenue metrics
 * - GET /api/availability - For occupancy data
 *
 * Features:
 * - Key performance indicators (KPIs)
 * - Charts for bookings, occupancy, revenue
 * - Date range filtering
 * - Room type performance analysis
 */

import { useState, useEffect, useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts"
import { Calendar, ChevronDown, DollarSign, Hotel, Percent, X, Loader2 } from "lucide-react"
import { format, parseISO, subDays, differenceInDays, addDays, isWithinInterval } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { useToast } from "@/components/ui/use-toast"

import { useBookings } from "@/hooks/use-bookings"

// Chart colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AdminAnalyticsPage() {
  const { toast } = useToast()
  const { bookings, loading, error } = useBookings()

  // State for date range
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // State for availability data
  const [availabilityData, setAvailabilityData] = useState(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoadingAvailability(true)
      try {
        const startDate = format(dateRange.from, "yyyy-MM-dd")
        const days = differenceInDays(dateRange.to, dateRange.from) + 1

        const response = await fetch(`/api/availability?start=${startDate}&days=${days}`)

        if (!response.ok) {
          throw new Error("Failed to fetch availability data")
        }

        const data = await response.json()
        setAvailabilityData(data.summary || data)
      } catch (error) {
        console.error("Error fetching availability:", error)
        toast({
          title: "Error",
          description: "Failed to load availability data",
          variant: "destructive",
        })
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailability()
  }, [dateRange, toast])

  // Filter bookings based on date range
  const filteredBookings = useMemo(() => {
    if (!bookings) return []

    return bookings.filter((booking) => {
      const checkIn = parseISO(booking.check_in)
      const checkOut = parseISO(booking.check_out)

      // Include bookings that overlap with the selected date range
      return (
        isWithinInterval(checkIn, { start: dateRange.from, end: dateRange.to }) ||
        isWithinInterval(checkOut, { start: dateRange.from, end: dateRange.to }) ||
        (checkIn <= dateRange.from && checkOut >= dateRange.to)
      )
    })
  }, [bookings, dateRange])

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!filteredBookings || filteredBookings.length === 0) {
      return {
        totalBookings: 0,
        averageOccupancy: 0,
        totalRevenue: 0,
        averageStay: 0,
        cancellationRate: 0,
      }
    }

    const totalBookings = filteredBookings.length
    const completedBookings = filteredBookings.filter((b) => b.booking_status === "checked-out").length
    const cancelledBookings = filteredBookings.filter((b) => b.booking_status === "cancelled").length
    const paidBookings = filteredBookings.filter((b) => b.payment_status === "paid")

    const totalRevenue = paidBookings.reduce((sum, booking) => sum + Number.parseFloat(booking.total_amount || 0), 0)
    const totalNights = filteredBookings.reduce((sum, booking) => sum + (booking.nights || 0), 0)

    const averageStay = totalBookings > 0 ? totalNights / totalBookings : 0
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0

    // Calculate average occupancy (if availability data is available)
    let averageOccupancy = 0
    if (availabilityData && availabilityData.totalRooms > 0) {
      const totalDays = differenceInDays(dateRange.to, dateRange.from) + 1
      const totalRoomDays = availabilityData.totalRooms * totalDays
      const occupiedRoomDays = filteredBookings.reduce((sum, booking) => {
        return sum + (booking.nights || 0)
      }, 0)

      averageOccupancy = (occupiedRoomDays / totalRoomDays) * 100
    }

    return {
      totalBookings,
      averageOccupancy,
      totalRevenue,
      averageStay,
      cancellationRate,
    }
  }, [filteredBookings, dateRange, availabilityData])

  // Prepare data for charts
  const bookingsByDateData = useMemo(() => {
    if (!filteredBookings || filteredBookings.length === 0) return []

    const dateMap = new Map()
    const days = differenceInDays(dateRange.to, dateRange.from) + 1

    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = addDays(dateRange.from, i)
      const dateStr = format(date, "yyyy-MM-dd")
      dateMap.set(dateStr, { date: dateStr, bookings: 0 })
    }

    // Count bookings by check-in date
    filteredBookings.forEach((booking) => {
      const checkIn = parseISO(booking.check_in)
      if (isWithinInterval(checkIn, { start: dateRange.from, end: dateRange.to })) {
        const dateStr = format(checkIn, "yyyy-MM-dd")
        const entry = dateMap.get(dateStr)
        if (entry) {
          entry.bookings += 1
        }
      }
    })

    return Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        ...entry,
        date: format(parseISO(entry.date), "MMM d"),
      }))
  }, [filteredBookings, dateRange])

  // Prepare data for occupancy chart
  const occupancyData = useMemo(() => {
    if (!availabilityData || !filteredBookings || filteredBookings.length === 0) return []

    const dateMap = new Map()
    const days = differenceInDays(dateRange.to, dateRange.from) + 1

    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = addDays(dateRange.from, i)
      const dateStr = format(date, "yyyy-MM-dd")
      dateMap.set(dateStr, {
        date: dateStr,
        occupancy: 0,
        totalRooms: availabilityData.totalRooms || 0,
      })
    }

    // Calculate occupancy for each date
    filteredBookings.forEach((booking) => {
      const checkIn = parseISO(booking.check_in)
      const checkOut = parseISO(booking.check_out)

      for (let i = 0; i < booking.nights; i++) {
        const date = addDays(checkIn, i)
        if (isWithinInterval(date, { start: dateRange.from, end: dateRange.to })) {
          const dateStr = format(date, "yyyy-MM-dd")
          const entry = dateMap.get(dateStr)
          if (entry) {
            entry.occupancy += 1
          }
        }
      }
    })

    return Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        ...entry,
        date: format(parseISO(entry.date), "MMM d"),
        occupancyRate: entry.totalRooms > 0 ? (entry.occupancy / entry.totalRooms) * 100 : 0,
      }))
  }, [availabilityData, filteredBookings, dateRange])

  // Prepare data for revenue by room type chart
  const revenueByRoomTypeData = useMemo(() => {
    if (!filteredBookings || filteredBookings.length === 0) return []

    const roomTypeMap = new Map()

    filteredBookings.forEach((booking) => {
      if (booking.payment_status === "paid") {
        const roomType = booking.room_type || "Unknown"
        const amount = Number.parseFloat(booking.total_amount || 0)

        if (!roomTypeMap.has(roomType)) {
          roomTypeMap.set(roomType, { name: roomType, revenue: 0, bookings: 0 })
        }

        const entry = roomTypeMap.get(roomType)
        entry.revenue += amount
        entry.bookings += 1
      }
    })

    return Array.from(roomTypeMap.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings])

  // Prepare data for bookings by room type pie chart
  const bookingsByRoomTypeData = useMemo(() => {
    if (!filteredBookings || filteredBookings.length === 0) return []

    const roomTypeMap = new Map()

    filteredBookings.forEach((booking) => {
      const roomType = booking.room_type || "Unknown"

      if (!roomTypeMap.has(roomType)) {
        roomTypeMap.set(roomType, { name: roomType, value: 0 })
      }

      const entry = roomTypeMap.get(roomType)
      entry.value += 1
    })

    return Array.from(roomTypeMap.values()).sort((a, b) => b.value - a.value)
  }, [filteredBookings])

  // Calculate ADR (Average Daily Rate) and RevPAR (Revenue Per Available Room)
  const revenueMetrics = useMemo(() => {
    if (!filteredBookings || filteredBookings.length === 0 || !availabilityData) {
      return {
        adr: 0,
        revPAR: 0,
      }
    }

    const paidBookings = filteredBookings.filter((b) => b.payment_status === "paid")
    const totalRevenue = paidBookings.reduce((sum, booking) => sum + Number.parseFloat(booking.total_amount || 0), 0)
    const totalRoomNights = paidBookings.reduce((sum, booking) => sum + (booking.nights || 0), 0)

    const adr = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0

    // Calculate RevPAR
    const totalDays = differenceInDays(dateRange.to, dateRange.from) + 1
    const totalAvailableRoomNights = (availabilityData.totalRooms || 0) * totalDays
    const revPAR = totalAvailableRoomNights > 0 ? totalRevenue / totalAvailableRoomNights : 0

    return {
      adr,
      revPAR,
    }
  }, [filteredBookings, availabilityData, dateRange])

  // Date range presets
  const handleDateRangePreset = (days) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    })
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track performance metrics and booking trends</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Quick Range
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDateRangePreset(7)}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangePreset(30)}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangePreset(60)}>Last 60 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateRangePreset(90)}>Last 90 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalBookings}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.averageOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average for period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {kpis.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From paid bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.averageStay.toFixed(1)} nights</div>
            <p className="text-xs text-muted-foreground">Per booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.cancellationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ADR (Average Daily Rate)</CardTitle>
            <CardDescription>Average rate per occupied room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              PKR {revenueMetrics.adr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">ADR = Total Room Revenue / Number of Rooms Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>RevPAR (Revenue Per Available Room)</CardTitle>
            <CardDescription>Revenue generated per available room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              PKR {revenueMetrics.revPAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">RevPAR = ADR × Occupancy Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Over Time</CardTitle>
              <CardDescription>Number of bookings by check-in date</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading || loadingAvailability ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading data...</span>
                </div>
              ) : bookingsByDateData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No booking data available for selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsByDateData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="bookings" name="Bookings" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate</CardTitle>
              <CardDescription>Daily occupancy rate (%)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading || loadingAvailability ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading data...</span>
                </div>
              ) : occupancyData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No occupancy data available for selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                    <YAxis domain={[0, 100]}>
                      <Label angle={-90} position="insideLeft" style={{ textAnchor: "middle" }}>
                        Occupancy (%)
                      </Label>
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="occupancyRate"
                      name="Occupancy Rate"
                      stroke="#00C49F"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Room Type</CardTitle>
              <CardDescription>Total revenue from paid bookings by room type</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading data...</span>
                </div>
              ) : revenueByRoomTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No revenue data available for selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueByRoomTypeData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue (PKR)" fill="#8884D8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Room Type</CardTitle>
              <CardDescription>Distribution of bookings across room types</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading data...</span>
                </div>
              ) : bookingsByRoomTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No booking data available for selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingsByRoomTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {bookingsByRoomTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
