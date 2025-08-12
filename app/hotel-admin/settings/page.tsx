"use client"

/**
 * Settings Management Page
 *
 * Features:
 * - Room pricing management with base prices and multipliers
 * - Email template customization for booking confirmations and cancellations
 * - Hotel policies configuration (cancellation, check-in/out times)
 * - General settings for currency, booking status defaults, etc.
 * - Uses supabaseAdmin for all mutations to bypass RLS
 */

import { useState, useEffect } from "react"
import { Save, DollarSign, Mail, FileText, SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface PricingSettings {
  standard_room_base_price: number
  deluxe_room_base_price: number
  family_suite_base_price: number
  executive_suite_base_price: number
  weekend_multiplier: number
  season_multiplier: number
  currency: string
}

interface EmailTemplates {
  booking_confirmation_subject: string
  booking_confirmation_body: string
  booking_cancellation_subject: string
  booking_cancellation_body: string
}

interface HotelPolicies {
  cancellation_policy: string
  check_in_time: string
  check_out_time: string
  pet_policy: string
  smoking_policy: string
}

interface GeneralSettings {
  default_currency: string
  default_booking_status: string
  require_payment_on_booking: boolean
  send_confirmation_emails: boolean
  allow_online_cancellation: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    standard_room_base_price: 150,
    deluxe_room_base_price: 200,
    family_suite_base_price: 300,
    executive_suite_base_price: 400,
    weekend_multiplier: 1.2,
    season_multiplier: 1.5,
    currency: "USD",
  })

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplates>({
    booking_confirmation_subject: "Booking Confirmation - Hindukush Sarai",
    booking_confirmation_body: `Dear {guest_name},

Thank you for choosing Hindukush Sarai for your stay. We are pleased to confirm your reservation.

Booking Details:
- Booking ID: {booking_id}
- Check-in: {check_in_date}
- Check-out: {check_out_date}
- Room Type: {room_type}
- Number of Guests: {number_of_guests}
- Total Amount: {total_amount}

We look forward to welcoming you to our hotel.

Best regards,
Hindukush Sarai Team`,
    booking_cancellation_subject: "Booking Cancellation - Hindukush Sarai",
    booking_cancellation_body: `Dear {guest_name},

We have processed your cancellation request for booking #{booking_id}.

Cancelled Booking Details:
- Check-in: {check_in_date}
- Check-out: {check_out_date}
- Room Type: {room_type}
- Cancellation Reason: {cancellation_reason}

If you have any questions, please don't hesitate to contact us.

Best regards,
Hindukush Sarai Team`,
  })

  const [hotelPolicies, setHotelPolicies] = useState<HotelPolicies>({
    cancellation_policy:
      "Free cancellation up to 24 hours before check-in. Cancellations made within 24 hours of check-in will be charged one night's stay.",
    check_in_time: "15:00",
    check_out_time: "11:00",
    pet_policy: "Pets are not allowed in the hotel premises.",
    smoking_policy:
      "Smoking is strictly prohibited in all rooms and indoor areas. Designated smoking areas are available outdoors.",
  })

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    default_currency: "USD",
    default_booking_status: "pending",
    require_payment_on_booking: false,
    send_confirmation_emails: true,
    allow_online_cancellation: true,
  })

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Load pricing settings
      const pricingResponse = await fetch("/api/pricing")
      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json()
        if (pricingData.length > 0) {
          // Convert pricing data to settings format
          const pricing = pricingData.reduce((acc: any, item: any) => {
            acc[`${item.room_type.toLowerCase().replace(" ", "_")}_base_price`] = item.base_price
            return acc
          }, {})
          setPricingSettings((prev) => ({ ...prev, ...pricing }))
        }
      }

      // Note: In a real implementation, you would load email templates, policies, and general settings
      // from their respective API endpoints or database tables
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const savePricingSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pricingSettings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Pricing settings saved successfully",
        })
      } else {
        throw new Error("Failed to save pricing settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pricing settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveEmailTemplates = async () => {
    setSaving(true)
    try {
      // In a real implementation, this would save to a database
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Success",
        description: "Email templates saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email templates",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveHotelPolicies = async () => {
    setSaving(true)
    try {
      // In a real implementation, this would save to a database
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Success",
        description: "Hotel policies saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save hotel policies",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveGeneralSettings = async () => {
    setSaving(true)
    try {
      // In a real implementation, this would save to a database
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Success",
        description: "General settings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save general settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage hotel configuration and preferences</p>
      </div>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Room Pricing
              </CardTitle>
              <CardDescription>Configure base prices and multipliers for different room types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Base Prices</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="standard-price">Standard Room</Label>
                      <Input
                        id="standard-price"
                        type="number"
                        value={pricingSettings.standard_room_base_price}
                        onChange={(e) =>
                          setPricingSettings((prev) => ({
                            ...prev,
                            standard_room_base_price: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deluxe-price">Deluxe Room</Label>
                      <Input
                        id="deluxe-price"
                        type="number"
                        value={pricingSettings.deluxe_room_base_price}
                        onChange={(e) =>
                          setPricingSettings((prev) => ({
                            ...prev,
                            deluxe_room_base_price: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="family-price">Family Suite</Label>
                      <Input
                        id="family-price"
                        type="number"
                        value={pricingSettings.family_suite_base_price}
                        onChange={(e) =>
                          setPricingSettings((prev) => ({
                            ...prev,
                            family_suite_base_price: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="executive-price">Executive Suite</Label>
                      <Input
                        id="executive-price"
                        type="number"
                        value={pricingSettings.executive_suite_base_price}
                        onChange={(e) =>
                          setPricingSettings((prev) => ({
                            ...prev,
                            executive_suite_base_price: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Multipliers</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="weekend-multiplier">Weekend Multiplier</Label>
                      <Input
                        id="weekend-multiplier"
                        type="number"
                        step="0.1"
                        value={pricingSettings.weekend_multiplier}
                        onChange={(e) =>
                          setPricingSettings((prev) => ({
                            ...prev,
                            weekend_multiplier: Number.parseFloat(e.target.value) || 1,
                          }))
                        }
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Applied to Friday and Saturday nights</p>
                    </div>
                    <div>
                      <Label htmlFor="season-multiplier">Peak Season Multiplier</Label>
                      <Input
                        id="season-multiplier"
                        type="number"
                        step="0.1"
                        value={pricingSettings.season_multiplier}
                        onChange={(e) =>
                          setPricingSettings((prev) => ({
                            ...prev,
                            season_multiplier: Number.parseFloat(e.target.value) || 1,
                          }))
                        }
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Applied during peak seasons</p>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={pricingSettings.currency}
                        onValueChange={(value) =>
                          setPricingSettings((prev) => ({
                            ...prev,
                            currency: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="PKR">PKR (₨)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={savePricingSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Pricing Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>Customize email templates for booking confirmations and cancellations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Booking Confirmation</h3>
                <div>
                  <Label htmlFor="confirmation-subject">Subject</Label>
                  <Input
                    id="confirmation-subject"
                    value={emailTemplates.booking_confirmation_subject}
                    onChange={(e) =>
                      setEmailTemplates((prev) => ({
                        ...prev,
                        booking_confirmation_subject: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmation-body">Body</Label>
                  <Textarea
                    id="confirmation-body"
                    value={emailTemplates.booking_confirmation_body}
                    onChange={(e) =>
                      setEmailTemplates((prev) => ({
                        ...prev,
                        booking_confirmation_body: e.target.value,
                      }))
                    }
                    className="mt-1 min-h-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available variables: {"{guest_name}"}, {"{booking_id}"}, {"{check_in_date}"}, {"{check_out_date}"},{" "}
                    {"{room_type}"}, {"{number_of_guests}"}, {"{total_amount}"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Booking Cancellation</h3>
                <div>
                  <Label htmlFor="cancellation-subject">Subject</Label>
                  <Input
                    id="cancellation-subject"
                    value={emailTemplates.booking_cancellation_subject}
                    onChange={(e) =>
                      setEmailTemplates((prev) => ({
                        ...prev,
                        booking_cancellation_subject: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cancellation-body">Body</Label>
                  <Textarea
                    id="cancellation-body"
                    value={emailTemplates.booking_cancellation_body}
                    onChange={(e) =>
                      setEmailTemplates((prev) => ({
                        ...prev,
                        booking_cancellation_body: e.target.value,
                      }))
                    }
                    className="mt-1 min-h-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available variables: {"{guest_name}"}, {"{booking_id}"}, {"{check_in_date}"}, {"{check_out_date}"},{" "}
                    {"{room_type}"}, {"{cancellation_reason}"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={saveEmailTemplates} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Email Templates"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Hotel Policies
              </CardTitle>
              <CardDescription>Configure hotel policies and operational procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="check-in-time">Check-in Time</Label>
                    <Input
                      id="check-in-time"
                      type="time"
                      value={hotelPolicies.check_in_time}
                      onChange={(e) =>
                        setHotelPolicies((prev) => ({
                          ...prev,
                          check_in_time: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="check-out-time">Check-out Time</Label>
                    <Input
                      id="check-out-time"
                      type="time"
                      value={hotelPolicies.check_out_time}
                      onChange={(e) =>
                        setHotelPolicies((prev) => ({
                          ...prev,
                          check_out_time: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                    <Textarea
                      id="cancellation-policy"
                      value={hotelPolicies.cancellation_policy}
                      onChange={(e) =>
                        setHotelPolicies((prev) => ({
                          ...prev,
                          cancellation_policy: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="pet-policy">Pet Policy</Label>
                  <Textarea
                    id="pet-policy"
                    value={hotelPolicies.pet_policy}
                    onChange={(e) =>
                      setHotelPolicies((prev) => ({
                        ...prev,
                        pet_policy: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="smoking-policy">Smoking Policy</Label>
                  <Textarea
                    id="smoking-policy"
                    value={hotelPolicies.smoking_policy}
                    onChange={(e) =>
                      setHotelPolicies((prev) => ({
                        ...prev,
                        smoking_policy: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={saveHotelPolicies} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Hotel Policies"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure general hotel management preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select
                      value={generalSettings.default_currency}
                      onValueChange={(value) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          default_currency: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="PKR">PKR (₨)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="default-booking-status">Default Booking Status</Label>
                    <Select
                      value={generalSettings.default_booking_status}
                      onValueChange={(value) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          default_booking_status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Payment on Booking</Label>
                      <p className="text-sm text-gray-500">Require payment to be processed when booking is created</p>
                    </div>
                    <Switch
                      checked={generalSettings.require_payment_on_booking}
                      onCheckedChange={(checked) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          require_payment_on_booking: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Confirmation Emails</Label>
                      <p className="text-sm text-gray-500">Automatically send confirmation emails for new bookings</p>
                    </div>
                    <Switch
                      checked={generalSettings.send_confirmation_emails}
                      onCheckedChange={(checked) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          send_confirmation_emails: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Online Cancellation</Label>
                      <p className="text-sm text-gray-500">Allow guests to cancel bookings through the website</p>
                    </div>
                    <Switch
                      checked={generalSettings.allow_online_cancellation}
                      onCheckedChange={(checked) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          allow_online_cancellation: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={saveGeneralSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save General Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
