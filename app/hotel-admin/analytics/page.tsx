"use client"

/**
 * Analytics Dashboard Page
 *
 * Features:
 * - Key performance indicators (KPIs): bookings, occupancy, revenue, etc.
 * - Interactive charts using Recharts (bookings over time, occupancy, revenue by room type)
 * - Date range filtering with presets (30/60/90 days)
 * - Advanced metrics like ADR (Average Daily Rate) and RevPAR
 * - Real-time data from useBookings hook and /api/availability endpoint
 */

import { useState, useMemo, useEffect } from "react"
import { format, subDays, differenceInDays } from "date-fns"
import { Calendar, DollarSign, TrendingUp, Users, BedDouble, PieChartIcon as Pie } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { useBookings } from "@/hooks/use-bookings"
import { useToast } from "@/hooks/use-toast"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const { bookings, loading, error } = useBookings()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [availabilityData, setAvailabilityData] = useState<any[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  // Fetch availability data
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!dateRange.from || !dateRange.to) return

      setLoadingAvailability(true)
      try {
        const days = differenceInDays(dateRange.to, dateRange.from) + 1
        const response = await fetch(`/api/availability?start=${format(dateRange.from, "yyyy-MM-dd")}&days=${days}`)
        if (response.ok) {
          const data = await response.json()
          setAvailabilityData(data.availability || [])
        }
      } catch (error) {
        console.error("Failed to fetch availability data:", error)
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailabilityData()
  }, [dateRange])

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    if (!bookings || !dateRange.from || !dateRange.to) return []

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at || booking.check_in_date)
      return bookingDate >= dateRange.from && bookingDate <= dateRange.to
    })
  }, [bookings, dateRange])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalBookings = filteredBookings.length
    const confirmedBookings = filteredBookings.filter((b) =>
      ["confirmed", "checked-in", "checked-out"].includes(b.status),
    )
    const cancelledBookings = filteredBookings.filter((b) => b.status === "cancelled")
    const paidBookings = filteredBookings.filter((b) => b.payment_status === "paid")

    const totalRevenue = paidBookings.reduce((sum, booking) => sum + Number.parseFloat(booking.total_amount || "0"), 0)
    const totalNights = confirmedBookings.reduce((sum, booking) => {
      const checkIn = new Date(booking.check_in_date)
      const checkOut = new Date(booking.check_out_date)
      return sum + differenceInDays(checkOut, checkIn)
    }, 0)

    const avgStayLength = confirmedBookings.length > 0 ? totalNights / confirmedBookings.length : 0
    const cancellationRate = totalBookings > 0 ? (cancelledBookings.length / totalBookings) * 100 : 0
    const adr = totalNights > 0 ? totalRevenue / totalNights : 0 // Average Daily Rate

    // Calculate occupancy rate from availability data
    const totalRoomNights = availabilityData.reduce((sum, day) => {
      return sum + Object.values(day.rooms || {}).reduce((daySum: number, count: any) => daySum + (count.total || 0), 0)
    }, 0)
    const occupiedRoomNights = availabilityData.reduce((sum, day) => {
      return (
        sum +
        Object.values(day.rooms || {}).reduce(
          (daySum: number, count: any) => daySum + ((count.total || 0) - (count.available || 0)),
          0,
        )
      )
    }, 0)
    const occupancyRate = totalRoomNights > 0 ? (occupiedRoomNights / totalRoomNights) * 100 : 0
    const revpar = adr * (occupancyRate / 100) // Revenue Per Available Room

    return {
      totalBookings,
      totalRevenue,
      occupancyRate,
      avgStayLength,
      cancellationRate,
      adr,
      revpar,
    }
  }, [filteredBookings, availabilityData])

  // Prepare chart data
  const bookingsOverTime = useMemo(() => {
    const dailyBookings = new Map()

    filteredBookings.forEach((booking) => {
      const date = format(new Date(booking.created_at || booking.check_in_date), "yyyy-MM-dd")
      dailyBookings.set(date, (dailyBookings.get(date) || 0) + 1)
    })

    const result = []
    let currentDate = new Date(dateRange.from!)
    while (currentDate <= dateRange.to!) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      result.push({
        date: format(currentDate, "MMM dd"),
        bookings: dailyBookings.get(dateStr) || 0,
      })
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }

    return result
  }, [filteredBookings, dateRange])

  const occupancyOverTime = useMemo(() => {
    return availabilityData.map((day) => ({
      date: format(new Date(day.date), "MMM dd"),
      occupancy: day.occupancy_rate || 0,
    }))
  }, [availabilityData])

  const revenueByRoomType = useMemo(() => {
    const roomTypeRevenue = new Map()

    filteredBookings
      .filter((b) => b.payment_status === "paid")
      .forEach((booking) => {
        const roomType = booking.room_type || "Unknown"
        const revenue = Number.parseFloat(booking.total_amount || "0")
        roomTypeRevenue.set(roomType, (roomTypeRevenue.get(roomType) || 0) + revenue)
      })

    return Array.from(roomTypeRevenue.entries()).map(([roomType, revenue]) => ({
      roomType,
      revenue,
    }))
  }, [filteredBookings])

  const bookingsByRoomType = useMemo(() => {
    const roomTypeBookings = new Map()

    filteredBookings.forEach((booking) => {
      const roomType = booking.room_type || "Unknown"
      roomTypeBookings.set(roomType, (roomTypeBookings.get(roomType) || 0) + 1)
    })

    return Array.from(roomTypeBookings.entries()).map(([roomType, count]) => ({
      name: roomType,
      value: count,
    }))
  }, [filteredBookings])

  const handleDateRangeChange = (range: any) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  const setPresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading analytics data: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600">Hotel performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPresetRange(30)}>
              30 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange(60)}>
              60 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange(90)}>
              90 Days
            </Button>
          </div>
          <DatePickerWithRange date={dateRange} onDateChange={handleDateRangeChange} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {format(dateRange.from!, "MMM dd")} - {format(dateRange.to!, "MMM dd")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From paid bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average occupancy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ADR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.adr.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Average Daily Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.revpar.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Revenue Per Available Room</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stay Length</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgStayLength.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Nights per booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.cancellationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings Over Time</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy Rate</TabsTrigger>
          <TabsTrigger value="revenue">Revenue by Room Type</TabsTrigger>
          <TabsTrigger value="distribution">Booking Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Over Time</CardTitle>
              <CardDescription>Daily booking counts for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} dot={{ fill: "#8884d8" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate Over Time</CardTitle>
              <CardDescription>Daily occupancy percentage for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={occupancyOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, "Occupancy"]} />
                  <Legend />
                  <Area type="monotone" dataKey="occupancy" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Room Type</CardTitle>
              <CardDescription>Total revenue generated by each room type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByRoomType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="roomType" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Room Type</CardTitle>
              <CardDescription>Distribution of bookings across different room types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={bookingsByRoomType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingsByRoomType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
