"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Hotel,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  BedDouble,
  Home,
  Users,
  Wifi,
  Tv,
  Bath,
  Coffee,
  Mountain,
  Shield,
  Car,
  Utensils,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useRooms } from "@/hooks/use-rooms"

export default function RoomsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { rooms, loading: roomsLoading, createRoom, updateRoom, deleteRoom } = useRooms()

  const [searchQuery, setSearchQuery] = useState("")
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false)
  const [showEditRoomDialog, setShowEditRoomDialog] = useState(false)
  const [showDeleteRoomDialog, setShowDeleteRoomDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const [roomFormData, setRoomFormData] = useState({
    number: "",
    type: "",
    capacity: 1,
    amenities: [],
    status: "available",
    floor: 1,
    description: "",
    price: "",
    currency: "PKR",
  })

  const [formErrors, setFormErrors] = useState({})

  const roomTypes = [
    { value: "dormitory_male", label: "Dormitory - Male" },
    { value: "dormitory_female", label: "Dormitory - Female" },
    { value: "budget_single", label: "Budget Room - Single" },
    { value: "budget_double", label: "Budget Room - Double" },
    { value: "standard", label: "Standard Room" },
    { value: "deluxe", label: "Deluxe Room" },
    { value: "family", label: "Family Suite" },
    { value: "executive", label: "Executive Suite" },
  ]

  const availableAmenities = [
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "ac", label: "AC", icon: Home },
    { id: "tv", label: "TV", icon: Tv },
    { id: "private_bathroom", label: "Private Bathroom", icon: Bath },
    { id: "attached_bathroom", label: "Attached Bathroom", icon: Bath },
    { id: "mini_bar", label: "Mini Bar", icon: Coffee },
    { id: "balcony", label: "Balcony", icon: Home },
    { id: "kitchenette", label: "Kitchenette", icon: Coffee },
    { id: "work_desk", label: "Work Desk", icon: Home },
    { id: "premium_bedding", label: "Premium Bedding", icon: BedDouble },
    { id: "safe", label: "Safe", icon: Shield },
    { id: "hair_dryer", label: "Hair Dryer", icon: Home },
    { id: "coffee_maker", label: "Coffee Maker", icon: Coffee },
    { id: "mountain_view", label: "Mountain View", icon: Mountain },
    { id: "garden_view", label: "Garden View", icon: Mountain },
    { id: "shared_accommodation", label: "Shared Accommodation", icon: Users },
    { id: "clean_washrooms", label: "Clean Washrooms", icon: Bath },
    { id: "lockers", label: "Lockers", icon: Shield },
    { id: "secure_lockers", label: "Secure Lockers", icon: Shield },
    { id: "female_only", label: "Female-only Accommodation", icon: Users },
    { id: "parking", label: "Parking", icon: Car },
    { id: "restaurant", label: "Restaurant Access", icon: Utensils },
  ]

  // Filter rooms based on search query
  const filteredRooms =
    rooms?.filter(
      (room) =>
        room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase())),
    ) || []

  // Filter rooms based on active tab
  const tabFilteredRooms =
    activeTab === "all" ? filteredRooms : filteredRooms.filter((room) => room.status === activeTab)

  // Helper function to get room type label
  const getRoomTypeLabel = (roomType) => {
    const type = roomTypes.find((t) => t.value === roomType)
    return type ? type.label : roomType
  }

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "$" : "Rs"
  }

  // Validation functions
  const validateRoomData = (data) => {
    const errors = {}

    if (!data.number || data.number.trim() === "") {
      errors.number = "Room/bed number is required"
    } else if (!/^[A-Z0-9\s]{1,10}$/i.test(data.number)) {
      errors.number = "Room/bed number must be 1-10 alphanumeric characters"
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

    if (!data.amenities || data.amenities.length === 0) {
      errors.amenities = "At least one amenity is required"
    }

    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
      errors.price = "Price must be a positive number"
    }

    if (!data.currency) {
      errors.currency = "Currency is required"
    }

    return errors
  }

  const resetRoomForm = () => {
    setRoomFormData({
      number: "",
      type: "",
      capacity: 1,
      amenities: [],
      status: "available",
      floor: 1,
      description: "",
      price: "",
      currency: "PKR",
    })
    setFormErrors({})
  }

  // Room management functions
  const handleAddRoom = async () => {
    const errors = validateRoomData(roomFormData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const newRoom = {
        ...roomFormData,
        capacity: Number(roomFormData.capacity),
        floor: Number(roomFormData.floor),
        price: Number(roomFormData.price),
      }

      await createRoom(newRoom)
      setShowAddRoomDialog(false)
      resetRoomForm()
      toast({
        title: "Success",
        description: `${getRoomTypeLabel(roomFormData.type)} ${roomFormData.number} added successfully`,
      })
    } catch (error) {
      console.error("Error adding room:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add room",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditRoom = async () => {
    const errors = validateRoomData(roomFormData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const updatedRoom = {
        ...roomFormData,
        capacity: Number(roomFormData.capacity),
        floor: Number(roomFormData.floor),
        price: Number(roomFormData.price),
      }

      await updateRoom(selectedRoom.id, updatedRoom)
      setShowEditRoomDialog(false)
      setSelectedRoom(null)
      resetRoomForm()
      toast({
        title: "Success",
        description: "Room updated successfully",
      })
    } catch (error) {
      console.error("Error updating room:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update room",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return

    // Check if room is currently occupied
    if (selectedRoom.status === "occupied") {
      toast({
        title: "Error",
        description: "Cannot delete occupied room/bed. Please check out the guest first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await deleteRoom(selectedRoom.id)
      setShowDeleteRoomDialog(false)
      setSelectedRoom(null)
      toast({
        title: "Success",
        description: `${getRoomTypeLabel(selectedRoom.type)} ${selectedRoom.number} deleted successfully`,
      })
    } catch (error) {
      console.error("Error deleting room:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete room",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoomStatusChange = async (roomId, newStatus) => {
    setIsLoading(true)
    try {
      await updateRoom(roomId, { status: newStatus })
      toast({
        title: "Success",
        description: `Room status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating room status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update room status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoomStatusBadge = (status) => {
    const statusColors = {
      available: "bg-green-100 text-green-800 border-green-200",
      occupied: "bg-red-100 text-red-800 border-red-200",
      maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "out-of-order": "bg-gray-100 text-gray-800 border-gray-200",
    }

    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"}>{status}</Badge>
  }

  const getAmenityIcon = (amenityLabel) => {
    const amenity = availableAmenities.find((a) => a.label === amenityLabel)
    return amenity ? amenity.icon : Home
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage rooms, beds, and their availability</p>
        </div>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setShowAddRoomDialog(true)}
        >
          <Plus className="h-6 w-6" />
          Add a Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold">{rooms?.length || 0}</p>
              </div>
              <Hotel className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms?.filter((r) => r.status === "available").length || 0}
                </p>
              </div>
              <BedDouble className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms?.filter((r) => r.status === "occupied").length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rooms?.filter((r) => r.status === "maintenance").length || 0}
                </p>
              </div>
              <Home className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search rooms..."
            className="pl-10 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs with Content */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="all">All Rooms</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="occupied">Occupied</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading rooms...</span>
            </div>
          ) : activeTab === "all" && tabFilteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow border">
              <Hotel className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No rooms found</p>
              <p className="text-gray-500 mt-2">
                {searchQuery ? "Try adjusting your search" : "Add your first room to get started"}
              </p>
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddRoomDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add a Room
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tabFilteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5 text-emerald-600" />
                          Room {room.number}
                        </CardTitle>
                        <CardDescription className="font-medium">{getRoomTypeLabel(room.type)}</CardDescription>
                      </div>
                      {getRoomStatusBadge(room.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-semibold">{room.capacity} guests</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Floor</p>
                          <p className="font-semibold">Floor {room.floor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold text-emerald-600">
                            {getCurrencySymbol(room.currency)} {room.price || "N/A"}
                            {room.type.includes("dormitory") ? "/bed" : "/night"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <Select
                            defaultValue={room.status}
                            onValueChange={(value) => handleRoomStatusChange(room.id, value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="out-of-order">Out of Order</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities?.slice(0, 4).map((amenity) => {
                            const IconComponent = getAmenityIcon(amenity)
                            return (
                              <Badge key={amenity} variant="outline" className="text-xs flex items-center gap-1">
                                <IconComponent className="h-3 w-3" />
                                {amenity}
                              </Badge>
                            )
                          })}
                          {room.amenities?.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {room.description && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Description</p>
                          <p className="text-sm text-gray-700">{room.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedRoom(room)
                        setRoomFormData({
                          number: room.number,
                          type: room.type,
                          capacity: room.capacity,
                          amenities: room.amenities || [],
                          status: room.status,
                          floor: room.floor,
                          description: room.description || "",
                          price: room.price || "",
                          currency: room.currency || "PKR",
                        })
                        setShowEditRoomDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={room.status === "occupied"}
                      onClick={() => {
                        setSelectedRoom(room)
                        setShowDeleteRoomDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading rooms...</span>
            </div>
          ) : activeTab === "available" && tabFilteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow border">
              <BedDouble className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No available rooms</p>
              <p className="text-gray-500 mt-2">All rooms are currently occupied or under maintenance</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tabFilteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5 text-emerald-600" />
                          Room {room.number}
                        </CardTitle>
                        <CardDescription className="font-medium">{getRoomTypeLabel(room.type)}</CardDescription>
                      </div>
                      {getRoomStatusBadge(room.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-semibold">{room.capacity} guests</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Floor</p>
                          <p className="font-semibold">Floor {room.floor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold text-emerald-600">
                            {getCurrencySymbol(room.currency)} {room.price || "N/A"}
                            {room.type.includes("dormitory") ? "/bed" : "/night"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <Select
                            defaultValue={room.status}
                            onValueChange={(value) => handleRoomStatusChange(room.id, value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="out-of-order">Out of Order</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities?.slice(0, 4).map((amenity) => {
                            const IconComponent = getAmenityIcon(amenity)
                            return (
                              <Badge key={amenity} variant="outline" className="text-xs flex items-center gap-1">
                                <IconComponent className="h-3 w-3" />
                                {amenity}
                              </Badge>
                            )
                          })}
                          {room.amenities?.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {room.description && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Description</p>
                          <p className="text-sm text-gray-700">{room.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedRoom(room)
                        setRoomFormData({
                          number: room.number,
                          type: room.type,
                          capacity: room.capacity,
                          amenities: room.amenities || [],
                          status: room.status,
                          floor: room.floor,
                          description: room.description || "",
                          price: room.price || "",
                          currency: room.currency || "PKR",
                        })
                        setShowEditRoomDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={room.status === "occupied"}
                      onClick={() => {
                        setSelectedRoom(room)
                        setShowDeleteRoomDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="occupied" className="mt-6">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading rooms...</span>
            </div>
          ) : activeTab === "occupied" && tabFilteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow border">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No occupied rooms</p>
              <p className="text-gray-500 mt-2">All rooms are currently available or under maintenance</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tabFilteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5 text-emerald-600" />
                          Room {room.number}
                        </CardTitle>
                        <CardDescription className="font-medium">{getRoomTypeLabel(room.type)}</CardDescription>
                      </div>
                      {getRoomStatusBadge(room.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-semibold">{room.capacity} guests</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Floor</p>
                          <p className="font-semibold">Floor {room.floor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold text-emerald-600">
                            {getCurrencySymbol(room.currency)} {room.price || "N/A"}
                            {room.type.includes("dormitory") ? "/bed" : "/night"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <Select
                            defaultValue={room.status}
                            onValueChange={(value) => handleRoomStatusChange(room.id, value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="out-of-order">Out of Order</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities?.slice(0, 4).map((amenity) => {
                            const IconComponent = getAmenityIcon(amenity)
                            return (
                              <Badge key={amenity} variant="outline" className="text-xs flex items-center gap-1">
                                <IconComponent className="h-3 w-3" />
                                {amenity}
                              </Badge>
                            )
                          })}
                          {room.amenities?.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {room.description && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Description</p>
                          <p className="text-sm text-gray-700">{room.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedRoom(room)
                        setRoomFormData({
                          number: room.number,
                          type: room.type,
                          capacity: room.capacity,
                          amenities: room.amenities || [],
                          status: room.status,
                          floor: room.floor,
                          description: room.description || "",
                          price: room.price || "",
                          currency: room.currency || "PKR",
                        })
                        setShowEditRoomDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={room.status === "occupied"}
                      onClick={() => {
                        setSelectedRoom(room)
                        setShowDeleteRoomDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading rooms...</span>
            </div>
          ) : activeTab === "maintenance" && tabFilteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow border">
              <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No rooms under maintenance</p>
              <p className="text-gray-500 mt-2">All rooms are currently available or occupied</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tabFilteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5 text-emerald-600" />
                          Room {room.number}
                        </CardTitle>
                        <CardDescription className="font-medium">{getRoomTypeLabel(room.type)}</CardDescription>
                      </div>
                      {getRoomStatusBadge(room.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-semibold">{room.capacity} guests</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Floor</p>
                          <p className="font-semibold">Floor {room.floor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold text-emerald-600">
                            {getCurrencySymbol(room.currency)} {room.price || "N/A"}
                            {room.type.includes("dormitory") ? "/bed" : "/night"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <Select
                            defaultValue={room.status}
                            onValueChange={(value) => handleRoomStatusChange(room.id, value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="out-of-order">Out of Order</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities?.slice(0, 4).map((amenity) => {
                            const IconComponent = getAmenityIcon(amenity)
                            return (
                              <Badge key={amenity} variant="outline" className="text-xs flex items-center gap-1">
                                <IconComponent className="h-3 w-3" />
                                {amenity}
                              </Badge>
                            )
                          })}
                          {room.amenities?.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {room.description && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Description</p>
                          <p className="text-sm text-gray-700">{room.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedRoom(room)
                        setRoomFormData({
                          number: room.number,
                          type: room.type,
                          capacity: room.capacity,
                          amenities: room.amenities || [],
                          status: room.status,
                          floor: room.floor,
                          description: room.description || "",
                          price: room.price || "",
                          currency: room.currency || "PKR",
                        })
                        setShowEditRoomDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={room.status === "occupied"}
                      onClick={() => {
                        setSelectedRoom(room)
                        setShowDeleteRoomDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Room</DialogTitle>
            <DialogDescription>Fill in the details for the new accommodation</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="room-number">Room/Bed Number *</Label>
                  <Input
                    id="room-number"
                    value={roomFormData.number}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, number: e.target.value }))}
                    placeholder="e.g., 101, Bed 3"
                  />
                  {formErrors.number && <p className="text-red-500 text-sm">{formErrors.number}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-type">Room Type *</Label>
                  <Select
                    value={roomFormData.type}
                    onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="room-type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && <p className="text-red-500 text-sm">{formErrors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">Capacity *</Label>
                  <Input
                    type="number"
                    id="room-capacity"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                    placeholder="Number of guests"
                    min={1}
                    max={10}
                  />
                  {formErrors.capacity && <p className="text-red-500 text-sm">{formErrors.capacity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-floor">Floor *</Label>
                  <Input
                    type="number"
                    id="room-floor"
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: Number(e.target.value) }))}
                    placeholder="Floor number"
                    min={1}
                    max={20}
                  />
                  {formErrors.floor && <p className="text-red-500 text-sm">{formErrors.floor}</p>}
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="room-price">Price *</Label>
                  <Input
                    id="room-price"
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="Price per night/bed"
                  />
                  {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-currency">Currency *</Label>
                  <Select
                    value={roomFormData.currency}
                    onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger id="room-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">Pakistani Rupee (Rs)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.currency && <p className="text-red-500 text-sm">{formErrors.currency}</p>}
                </div>
              </div>
            </div>

            {/* Room Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Room Status</h3>
              <div className="space-y-2">
                <Label htmlFor="room-status">Status</Label>
                <Select
                  value={roomFormData.status}
                  onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="room-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out-of-order">Out of Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Amenities *</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={roomFormData.amenities.includes(amenity.label)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRoomFormData((prev) => ({
                            ...prev,
                            amenities: [...prev.amenities, amenity.label],
                          }))
                        } else {
                          setRoomFormData((prev) => ({
                            ...prev,
                            amenities: prev.amenities.filter((a) => a !== amenity.label),
                          }))
                        }
                      }}
                    />
                    <Label
                      htmlFor={`amenity-${amenity.id}`}
                      className="flex items-center text-sm font-normal cursor-pointer"
                    >
                      <amenity.icon className="h-4 w-4 mr-2 text-gray-500" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formErrors.amenities && <p className="text-red-500 text-sm">{formErrors.amenities}</p>}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              <div className="space-y-2">
                <Label htmlFor="room-description">Description</Label>
                <Textarea
                  id="room-description"
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about the room/bed"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
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
            <Button onClick={handleAddRoom} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditRoomDialog} onOpenChange={setShowEditRoomDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Room</DialogTitle>
            <DialogDescription>Update the details for this accommodation</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-room-number">Room/Bed Number *</Label>
                  <Input
                    id="edit-room-number"
                    value={roomFormData.number}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, number: e.target.value }))}
                    placeholder="e.g., 101, Bed 3"
                  />
                  {formErrors.number && <p className="text-red-500 text-sm">{formErrors.number}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-type">Room Type *</Label>
                  <Select
                    value={roomFormData.type}
                    onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="edit-room-type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && <p className="text-red-500 text-sm">{formErrors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-capacity">Capacity *</Label>
                  <Input
                    type="number"
                    id="edit-room-capacity"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                    placeholder="Number of guests"
                    min={1}
                    max={10}
                  />
                  {formErrors.capacity && <p className="text-red-500 text-sm">{formErrors.capacity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-floor">Floor *</Label>
                  <Input
                    type="number"
                    id="edit-room-floor"
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: Number(e.target.value) }))}
                    placeholder="Floor number"
                    min={1}
                    max={20}
                  />
                  {formErrors.floor && <p className="text-red-500 text-sm">{formErrors.floor}</p>}
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-room-price">Price *</Label>
                  <Input
                    id="edit-room-price"
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="Price per night/bed"
                  />
                  {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-room-currency">Currency *</Label>
                  <Select
                    value={roomFormData.currency}
                    onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger id="edit-room-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">Pakistani Rupee (Rs)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.currency && <p className="text-red-500 text-sm">{formErrors.currency}</p>}
                </div>
              </div>
            </div>

            {/* Room Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Room Status</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-room-status">Status</Label>
                <Select
                  value={roomFormData.status}
                  onValueChange={(value) => setRoomFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="edit-room-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out-of-order">Out of Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Amenities *</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-amenity-${amenity.id}`}
                      checked={roomFormData.amenities.includes(amenity.label)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRoomFormData((prev) => ({
                            ...prev,
                            amenities: [...prev.amenities, amenity.label],
                          }))
                        } else {
                          setRoomFormData((prev) => ({
                            ...prev,
                            amenities: prev.amenities.filter((a) => a !== amenity.label),
                          }))
                        }
                      }}
                    />
                    <Label
                      htmlFor={`edit-amenity-${amenity.id}`}
                      className="flex items-center text-sm font-normal cursor-pointer"
                    >
                      <amenity.icon className="h-4 w-4 mr-2 text-gray-500" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formErrors.amenities && <p className="text-red-500 text-sm">{formErrors.amenities}</p>}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-room-description">Description</Label>
                <Textarea
                  id="edit-room-description"
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about the room/bed"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
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
              Update Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog open={showDeleteRoomDialog} onOpenChange={setShowDeleteRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRoom && getRoomTypeLabel(selectedRoom.type)}{" "}
              {selectedRoom?.number}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-red-200 bg-red-50">
              <Trash2 className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This action cannot be undone. All associated data will be permanently removed.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteRoomDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
