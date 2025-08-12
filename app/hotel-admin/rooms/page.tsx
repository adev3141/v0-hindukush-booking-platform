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
    { id: "attached_bathroom", label: "Attached bathroom", icon: Bath },
    { id: "mini_bar", label: "Mini Bar", icon: Coffee },
    { id: "balcony", label: "Balcony", icon: Home },
    { id: "kitchenette", label: "Kitchenette", icon: Coffee },
    { id: "work_desk", label: "Work Desk", icon: Home },
    { id: "premium_bedding", label: "Premium Bedding", icon: BedDouble },
    { id: "safe", label: "Safe", icon: Home },
    { id: "hair_dryer", label: "Hair Dryer", icon: Home },
    { id: "coffee_maker", label: "Coffee Maker", icon: Coffee },
    { id: "mountain_view", label: "Mountain View", icon: Mountain },
    { id: "garden_view", label: "Garden View", icon: Mountain },
    { id: "shared_accommodation", label: "Shared accommodation", icon: Users },
    { id: "clean_washrooms", label: "Clean washrooms", icon: Bath },
    { id: "lockers", label: "Lockers", icon: Home },
    { id: "secure_lockers", label: "Secure lockers", icon: Home },
    { id: "female_only", label: "Female-only accommodation", icon: Users },
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

  // Helper function to get currency for room type
  const getRoomCurrency = (roomType) => {
    if (roomType?.includes("dormitory") || roomType?.includes("budget")) {
      return "Rs"
    }
    return "$"
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

  const toggleAmenity = (amenity) => {
    setRoomFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
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
      available: "bg-green-100 text-green-800",
      occupied: "bg-red-100 text-red-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      "out-of-order": "bg-gray-100 text-gray-800",
    }

    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage rooms, beds, and their availability</p>
        </div>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          onClick={() => setShowAddRoomDialog(true)}
        >
          <Plus className="h-5 w-5" />
          Add a Room
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-10 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {roomsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading rooms...</span>
        </div>
      ) : tabFilteredRooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Hotel className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium">No rooms found</p>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? "Try adjusting your search" : "Add your first room to get started"}
          </p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddRoomDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add a Room
          </Button>
        </div>
      ) : (
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tabFilteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-emerald-600" />
                        {room.number}
                      </CardTitle>
                      <CardDescription>{getRoomTypeLabel(room.type)}</CardDescription>
                    </div>
                    {getRoomStatusBadge(room.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Capacity</p>
                        <p className="font-medium">{room.capacity} guests</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Floor</p>
                        <p className="font-medium">Floor {room.floor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">
                          {getRoomCurrency(room.type)} {room.price || "N/A"}
                          {room.type.includes("dormitory") ? "/bed" : "/night"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
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
                      <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities?.slice(0, 4).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{room.amenities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {room.description && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{room.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/30 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
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
                    className="w-full ml-2"
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
        </TabsContent>
      )}

      {/* Add Room Dialog */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>Fill in the details for the new accommodation</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
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
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: e.target.value }))}
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
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: e.target.value }))}
                  placeholder="Floor number"
                  min={1}
                  max={20}
                />
                {formErrors.floor && <p className="text-red-500 text-sm">{formErrors.floor}</p>}
              </div>
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

            <div className="space-y-2">
              <Label>Amenities *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
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
                      <amenity.icon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formErrors.amenities && <p className="text-red-500 text-sm">{formErrors.amenities}</p>}
            </div>

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
          <DialogFooter>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>Update the details for this accommodation</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
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
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, capacity: e.target.value }))}
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
                  onChange={(e) => setRoomFormData((prev) => ({ ...prev, floor: e.target.value }))}
                  placeholder="Floor number"
                  min={1}
                  max={20}
                />
                {formErrors.floor && <p className="text-red-500 text-sm">{formErrors.floor}</p>}
              </div>
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

            <div className="space-y-2">
              <Label>Amenities *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
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
                      <amenity.icon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formErrors.amenities && <p className="text-red-500 text-sm">{formErrors.amenities}</p>}
            </div>

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
          <DialogFooter>
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-md">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Confirm deletion</p>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. All associated data will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
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
