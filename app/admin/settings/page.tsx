"use client"

/**
 * Admin Settings Page
 *
 * Data sources:
 * - GET/PUT /api/pricing - For room pricing management
 * - Local state for email templates and policies (could be extended to use API)
 *
 * Features:
 * - Room pricing management (base price, currency, multipliers)
 * - Email templates for confirmations and cancellations
 * - Hotel policies (cancellation, check-in/out times)
 * - General settings (default currency, booking status)
 */

import { useState, useEffect } from "react"
import { Save, Loader2, Mail, DollarSign, FileText, SettingsIcon, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminSettingsPage() {
  const { toast } = useToast()

  // State for pricing settings
  const [pricingSettings, setPricingSettings] = useState({
    standardRoom: { basePrice: 6000, currency: "PKR", seasonMultiplier: 1.2, weekendMultiplier: 1.3 },
    deluxeRoom: { basePrice: 8000, currency: "PKR", seasonMultiplier: 1.2, weekendMultiplier: 1.3 },
    familySuite: { basePrice: 12000, currency: "PKR", seasonMultiplier: 1.3, weekendMultiplier: 1.4 },
    executiveSuite: { basePrice: 15000, currency: "PKR", seasonMultiplier: 1.3, weekendMultiplier: 1.5 },
  })

  // State for email templates
  const [emailTemplates, setEmailTemplates] = useState({
    bookingConfirmation: {
      subject: "Your booking confirmation at Hindukush Sarai - [BOOKING_REF]",
      body: "Dear [GUEST_NAME],\n\nThank you for booking with Hindukush Sarai. Your booking has been confirmed.\n\nBooking Details:\n- Booking Reference: [BOOKING_REF]\n- Check-in: [CHECK_IN]\n- Check-out: [CHECK_OUT]\n- Room Type: [ROOM_TYPE]\n- Guests: [GUESTS]\n\nWe look forward to welcoming you!\n\nBest regards,\nHindukush Sarai Team",
    },
    bookingCancellation: {
      subject: "Your booking cancellation at Hindukush Sarai - [BOOKING_REF]",
      body: "Dear [GUEST_NAME],\n\nWe confirm that your booking with reference [BOOKING_REF] has been cancelled.\n\nCancellation Details:\n- Booking Reference: [BOOKING_REF]\n- Check-in: [CHECK_IN]\n- Check-out: [CHECK_OUT]\n- Room Type: [ROOM_TYPE]\n\nIf you did not request this cancellation, please contact us immediately.\n\nBest regards,\nHindukush Sarai Team",
    },
  })

  // State for policies
  const [policies, setPolicies] = useState({
    cancellation:
      "Cancellations made more than 48 hours before check-in will receive a full refund. Cancellations made within 48 hours of check-in will be charged for the first night. No-shows will be charged for the full booking amount.",
    checkInTime:
      "Check-in time is from 2:00 PM to 10:00 PM. Early check-in may be available upon request, subject to availability.",
    checkOutTime:
      "Check-out time is by 11:00 AM. Late check-out may be available upon request, subject to availability and additional charges.",
    paymentPolicy:
      "A valid credit card is required to secure your booking. Payment will be processed at check-in. We accept cash, credit cards, and bank transfers.",
  })

  // State for general settings
  const [generalSettings, setGeneralSettings] = useState({
    defaultCurrency: "PKR",
    defaultBookingStatus: "confirmed",
    taxRate: 5,
    allowOverbooking: false,
  })

  // Loading states
  const [loadingPricing, setLoadingPricing] = useState(true)
  const [savingPricing, setSavingPricing] = useState(false)
  const [savingTemplates, setSavingTemplates] = useState(false)
  const [savingPolicies, setSavingPolicies] = useState(false)
  const [savingGeneral, setSavingGeneral] = useState(false)

  // Fetch pricing data
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/pricing")

        if (!response.ok) {
          throw new Error("Failed to fetch pricing data")
        }

        const data = await response.json()

        if (data && data.pricing) {
          // Transform API data to match our state structure
          const transformedPricing = {}

          data.pricing.forEach((item) => {
            const key = item.room_type.replace(/\s+/g, "") + "Room"
            transformedPricing[key] = {
              basePrice: item.base_price,
              currency: item.currency,
              seasonMultiplier: item.season_multiplier,
              weekendMultiplier: item.weekend_multiplier,
            }
          })

          setPricingSettings((prev) => ({
            ...prev,
            ...transformedPricing,
          }))
        }
      } catch (error) {
        console.error("Error fetching pricing:", error)
        toast({
          title: "Error",
          description: "Failed to load pricing data",
          variant: "destructive",
        })
      } finally {
        setLoadingPricing(false)
      }
    }

    fetchPricing()
  }, [toast])

  // Save pricing settings
  const savePricingSettings = async () => {
    setSavingPricing(true)
    try {
      // Transform our state structure to match API expectations
      const pricingData = Object.entries(pricingSettings).map(([key, value]) => {
        // Convert camelCase to space-separated words (e.g., standardRoom -> Standard Room)
        const roomType = key.replace(/([A-Z])/g, " $1").trim()

        return {
          room_type: roomType,
          base_price: value.basePrice,
          currency: value.currency,
          season_multiplier: value.seasonMultiplier,
          weekend_multiplier: value.weekendMultiplier,
        }
      })

      const response = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pricing: pricingData }),
      })

      if (!response.ok) {
        throw new Error("Failed to save pricing data")
      }

      toast({
        title: "Success",
        description: "Pricing settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving pricing:", error)
      toast({
        title: "Error",
        description: "Failed to save pricing settings",
        variant: "destructive",
      })
    } finally {
      setSavingPricing(false)
    }
  }

  // Save email templates
  const saveEmailTemplates = async () => {
    setSavingTemplates(true)
    try {
      // In a real application, you would save to the database
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Email templates saved successfully",
      })
    } catch (error) {
      console.error("Error saving email templates:", error)
      toast({
        title: "Error",
        description: "Failed to save email templates",
        variant: "destructive",
      })
    } finally {
      setSavingTemplates(false)
    }
  }

  // Save policies
  const savePolicies = async () => {
    setSavingPolicies(true)
    try {
      // In a real application, you would save to the database
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Policies saved successfully",
      })
    } catch (error) {
      console.error("Error saving policies:", error)
      toast({
        title: "Error",
        description: "Failed to save policies",
        variant: "destructive",
      })
    } finally {
      setSavingPolicies(false)
    }
  }

  // Save general settings
  const saveGeneralSettings = async () => {
    setSavingGeneral(true)
    try {
      // In a real application, you would save to the database
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "General settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving general settings:", error)
      toast({
        title: "Error",
        description: "Failed to save general settings",
        variant: "destructive",
      })
    } finally {
      setSavingGeneral(false)
    }
  }

  // Handle pricing input changes
  const handlePricingChange = (roomType, field, value) => {
    setPricingSettings((prev) => ({
      ...prev,
      [roomType]: {
        ...prev[roomType],
        [field]: field.includes("Multiplier") ? Number.parseFloat(value) : value,
      },
    }))
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            <Mail className="h-4 w-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="policies">
            <FileText className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
        </TabsList>

        {/* Pricing Settings */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Room Pricing</CardTitle>
              <CardDescription>Configure base prices and multipliers for different room types</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPricing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading pricing data...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Changes to pricing will affect new bookings only. Existing bookings will maintain their original
                      pricing.
                    </AlertDescription>
                  </Alert>

                  {/* Standard Room */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Standard Room</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="standard-base-price">Base Price</Label>
                        <div className="flex">
                          <Input
                            id="standard-base-price"
                            type="number"
                            value={pricingSettings.standardRoom.basePrice}
                            onChange={(e) =>
                              handlePricingChange("standardRoom", "basePrice", Number.parseInt(e.target.value))
                            }
                          />
                          <Select
                            value={pricingSettings.standardRoom.currency}
                            onValueChange={(value) => handlePricingChange("standardRoom", "currency", value)}
                          >
                            <SelectTrigger className="w-[100px] ml-2">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKR">PKR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="standard-season-multiplier">Season Multiplier</Label>
                        <Input
                          id="standard-season-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.standardRoom.seasonMultiplier}
                          onChange={(e) => handlePricingChange("standardRoom", "seasonMultiplier", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Applied during peak season (e.g., 1.2 = 20% increase)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="standard-weekend-multiplier">Weekend Multiplier</Label>
                        <Input
                          id="standard-weekend-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.standardRoom.weekendMultiplier}
                          onChange={(e) => handlePricingChange("standardRoom", "weekendMultiplier", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Applied on weekends (Friday-Saturday)</p>
                      </div>
                    </div>
                  </div>

                  {/* Deluxe Room */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Deluxe Room</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deluxe-base-price">Base Price</Label>
                        <div className="flex">
                          <Input
                            id="deluxe-base-price"
                            type="number"
                            value={pricingSettings.deluxeRoom.basePrice}
                            onChange={(e) =>
                              handlePricingChange("deluxeRoom", "basePrice", Number.parseInt(e.target.value))
                            }
                          />
                          <Select
                            value={pricingSettings.deluxeRoom.currency}
                            onValueChange={(value) => handlePricingChange("deluxeRoom", "currency", value)}
                          >
                            <SelectTrigger className="w-[100px] ml-2">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKR">PKR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deluxe-season-multiplier">Season Multiplier</Label>
                        <Input
                          id="deluxe-season-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.deluxeRoom.seasonMultiplier}
                          onChange={(e) => handlePricingChange("deluxeRoom", "seasonMultiplier", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deluxe-weekend-multiplier">Weekend Multiplier</Label>
                        <Input
                          id="deluxe-weekend-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.deluxeRoom.weekendMultiplier}
                          onChange={(e) => handlePricingChange("deluxeRoom", "weekendMultiplier", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Family Suite */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Family Suite</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="family-base-price">Base Price</Label>
                        <div className="flex">
                          <Input
                            id="family-base-price"
                            type="number"
                            value={pricingSettings.familySuite.basePrice}
                            onChange={(e) =>
                              handlePricingChange("familySuite", "basePrice", Number.parseInt(e.target.value))
                            }
                          />
                          <Select
                            value={pricingSettings.familySuite.currency}
                            onValueChange={(value) => handlePricingChange("familySuite", "currency", value)}
                          >
                            <SelectTrigger className="w-[100px] ml-2">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKR">PKR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="family-season-multiplier">Season Multiplier</Label>
                        <Input
                          id="family-season-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.familySuite.seasonMultiplier}
                          onChange={(e) => handlePricingChange("familySuite", "seasonMultiplier", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="family-weekend-multiplier">Weekend Multiplier</Label>
                        <Input
                          id="family-weekend-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.familySuite.weekendMultiplier}
                          onChange={(e) => handlePricingChange("familySuite", "weekendMultiplier", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Executive Suite */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Executive Suite</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="executive-base-price">Base Price</Label>
                        <div className="flex">
                          <Input
                            id="executive-base-price"
                            type="number"
                            value={pricingSettings.executiveSuite.basePrice}
                            onChange={(e) =>
                              handlePricingChange("executiveSuite", "basePrice", Number.parseInt(e.target.value))
                            }
                          />
                          <Select
                            value={pricingSettings.executiveSuite.currency}
                            onValueChange={(value) => handlePricingChange("executiveSuite", "currency", value)}
                          >
                            <SelectTrigger className="w-[100px] ml-2">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKR">PKR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="executive-season-multiplier">Season Multiplier</Label>
                        <Input
                          id="executive-season-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.executiveSuite.seasonMultiplier}
                          onChange={(e) => handlePricingChange("executiveSuite", "seasonMultiplier", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="executive-weekend-multiplier">Weekend Multiplier</Label>
                        <Input
                          id="executive-weekend-multiplier"
                          type="number"
                          step="0.1"
                          min="1"
                          max="3"
                          value={pricingSettings.executiveSuite.weekendMultiplier}
                          onChange={(e) => handlePricingChange("executiveSuite", "weekendMultiplier", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={savePricingSettings} disabled={savingPricing || loadingPricing}>
                {savingPricing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Pricing Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="email-templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email templates sent to guests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Template Variables</AlertTitle>
                  <AlertDescription>
                    Use these placeholders in your templates: [GUEST_NAME], [BOOKING_REF], [CHECK_IN], [CHECK_OUT],
                    [ROOM_TYPE], [GUESTS], [TOTAL_AMOUNT]
                  </AlertDescription>
                </Alert>

                {/* Booking Confirmation Template */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Booking Confirmation</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="confirmation-subject">Email Subject</Label>
                      <Input
                        id="confirmation-subject"
                        value={emailTemplates.bookingConfirmation.subject}
                        onChange={(e) =>
                          setEmailTemplates((prev) => ({
                            ...prev,
                            bookingConfirmation: {
                              ...prev.bookingConfirmation,
                              subject: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmation-body">Email Body</Label>
                      <Textarea
                        id="confirmation-body"
                        value={emailTemplates.bookingConfirmation.body}
                        onChange={(e) =>
                          setEmailTemplates((prev) => ({
                            ...prev,
                            bookingConfirmation: {
                              ...prev.bookingConfirmation,
                              body: e.target.value,
                            },
                          }))
                        }
                        rows={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Cancellation Template */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Booking Cancellation</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cancellation-subject">Email Subject</Label>
                      <Input
                        id="cancellation-subject"
                        value={emailTemplates.bookingCancellation.subject}
                        onChange={(e) =>
                          setEmailTemplates((prev) => ({
                            ...prev,
                            bookingCancellation: {
                              ...prev.bookingCancellation,
                              subject: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cancellation-body">Email Body</Label>
                      <Textarea
                        id="cancellation-body"
                        value={emailTemplates.bookingCancellation.body}
                        onChange={(e) =>
                          setEmailTemplates((prev) => ({
                            ...prev,
                            bookingCancellation: {
                              ...prev.bookingCancellation,
                              body: e.target.value,
                            },
                          }))
                        }
                        rows={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveEmailTemplates} disabled={savingTemplates}>
                {savingTemplates ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Email Templates
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Policies</CardTitle>
              <CardDescription>Configure hotel policies displayed to guests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cancellation Policy */}
                <div className="space-y-2">
                  <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                  <Textarea
                    id="cancellation-policy"
                    value={policies.cancellation}
                    onChange={(e) => setPolicies((prev) => ({ ...prev, cancellation: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Check-in Time */}
                <div className="space-y-2">
                  <Label htmlFor="check-in-time">Check-in Time</Label>
                  <Textarea
                    id="check-in-time"
                    value={policies.checkInTime}
                    onChange={(e) => setPolicies((prev) => ({ ...prev, checkInTime: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Check-out Time */}
                <div className="space-y-2">
                  <Label htmlFor="check-out-time">Check-out Time</Label>
                  <Textarea
                    id="check-out-time"
                    value={policies.checkOutTime}
                    onChange={(e) => setPolicies((prev) => ({ ...prev, checkOutTime: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Payment Policy */}
                <div className="space-y-2">
                  <Label htmlFor="payment-policy">Payment Policy</Label>
                  <Textarea
                    id="payment-policy"
                    value={policies.paymentPolicy}
                    onChange={(e) => setPolicies((prev) => ({ ...prev, paymentPolicy: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={savePolicies} disabled={savingPolicies}>
                {savingPolicies ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Policies
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Default Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select
                      value={generalSettings.defaultCurrency}
                      onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, defaultCurrency: value }))}
                    >
                      <SelectTrigger id="default-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PKR">Pakistani Rupee (PKR)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Default Booking Status */}
                  <div className="space-y-2">
                    <Label htmlFor="default-booking-status">Default Booking Status</Label>
                    <Select
                      value={generalSettings.defaultBookingStatus}
                      onValueChange={(value) =>
                        setGeneralSettings((prev) => ({ ...prev, defaultBookingStatus: value }))
                      }
                    >
                      <SelectTrigger id="default-booking-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tax Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      value={generalSettings.taxRate}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({ ...prev, taxRate: Number.parseInt(e.target.value) }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveGeneralSettings} disabled={savingGeneral}>
                {savingGeneral ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save General Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
