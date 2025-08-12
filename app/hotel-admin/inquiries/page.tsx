"use client"

/**
 * Inquiries Management Page
 *
 * Features:
 * - Table view with status-based tabs (All, New, Replied, Resolved)
 * - View and reply functionality with rich text editor
 * - Status management (mark as resolved)
 * - Search functionality by name, email, or subject
 * - Real-time data from useInquiries hook and /api/inquiries endpoints
 * - Uses supabaseAdmin for all mutations to bypass RLS
 */

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Search, MessageSquare, Reply, CheckCircle, Clock, Mail, User, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useInquiries } from "@/hooks/use-inquiries"

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  replied: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
}

export default function InquiriesPage() {
  const { inquiries, loading, error, replyToInquiry, updateInquiry } = useInquiries()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState("")
  const [replyText, setReplyText] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Filter and search inquiries
  const filteredInquiries = useMemo(() => {
    if (!inquiries) return []

    return inquiries.filter((inquiry) => {
      const matchesSearch =
        inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [inquiries, searchTerm, statusFilter])

  const handleReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return

    setActionLoading(true)
    try {
      await replyToInquiry(selectedInquiry.id, replyText)
      toast({
        title: "Success",
        description: "Reply sent successfully",
      })
      setDialogOpen("")
      setReplyText("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkResolved = async (inquiryId: string) => {
    setActionLoading(true)
    try {
      await updateInquiry(inquiryId, { status: "resolved" })
      toast({
        title: "Success",
        description: "Inquiry marked as resolved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inquiry status",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!inquiries) return { total: 0, new: 0, replied: 0, resolved: 0 }

    return {
      total: inquiries.length,
      new: inquiries.filter((i) => i.status === "new").length,
      replied: inquiries.filter((i) => i.status === "replied").length,
      resolved: inquiries.filter((i) => i.status === "resolved").length,
    }
  }, [inquiries])

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading inquiries: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inquiries</h1>
          <p className="text-gray-600">Manage customer inquiries and support requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <Reply className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.replied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New ({stats.new})</TabsTrigger>
              <TabsTrigger value="replied">Replied ({stats.replied})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No inquiries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                {inquiry.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                {inquiry.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium truncate">{inquiry.subject}</div>
                              <div className="text-sm text-gray-500 truncate mt-1">
                                {inquiry.message?.substring(0, 100)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {format(new Date(inquiry.created_at), "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[inquiry.status as keyof typeof statusColors]}>
                              {inquiry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedInquiry(inquiry)
                                  setDialogOpen("view")
                                }}
                              >
                                View
                              </Button>
                              {inquiry.status !== "resolved" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedInquiry(inquiry)
                                      setDialogOpen("reply")
                                    }}
                                  >
                                    <Reply className="h-4 w-4 mr-1" />
                                    Reply
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkResolved(inquiry.id)}
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Resolve
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Inquiry Dialog */}
      <Dialog open={dialogOpen === "view"} onOpenChange={() => setDialogOpen("")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>Complete inquiry information and history</DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contact Information</Label>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedInquiry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedInquiry.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Inquiry Information</Label>
                  <div className="mt-1 space-y-1">
                    <div>Subject: {selectedInquiry.subject}</div>
                    <div>Received: {format(new Date(selectedInquiry.created_at), "PPP")}</div>
                    <div>
                      Status:{" "}
                      <Badge className={statusColors[selectedInquiry.status as keyof typeof statusColors]}>
                        {selectedInquiry.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Message</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
              {selectedInquiry.reply && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reply</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedInquiry.reply}</p>
                    {selectedInquiry.replied_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Replied on {format(new Date(selectedInquiry.replied_at), "PPP")}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                {selectedInquiry.status !== "resolved" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDialogOpen("reply")
                      }}
                    >
                      Reply
                    </Button>
                    <Button onClick={() => handleMarkResolved(selectedInquiry.id)} disabled={actionLoading}>
                      Mark as Resolved
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={dialogOpen === "reply"} onOpenChange={() => setDialogOpen("")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Inquiry</DialogTitle>
            <DialogDescription>
              Send a reply to {selectedInquiry?.name} ({selectedInquiry?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Original Message</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                  <p className="text-sm">{selectedInquiry.message}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mt-1 min-h-32"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen("")}>
                  Cancel
                </Button>
                <Button onClick={handleReply} disabled={actionLoading || !replyText.trim()}>
                  {actionLoading ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
