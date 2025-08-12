"use client"

/**
 * Admin Inquiries Page
 *
 * Data sources:
 * - GET /api/inquiries - List all inquiries
 * - POST /api/inquiries/[id]/reply - Reply to an inquiry
 *
 * Features:
 * - Table view with sorting and filtering
 * - Status-based tabs (All, New, Replied, Resolved)
 * - View and reply to inquiries
 * - Mark inquiries as resolved
 */

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Search,
  XCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"

import { useInquiries } from "@/hooks/use-inquiries"

// Page size for pagination
const PAGE_SIZE = 20

export default function AdminInquiriesPage() {
  const { toast } = useToast()
  const { inquiries, loading, error, replyToInquiry, updateInquiryStatus } = useInquiries()

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [replyMessage, setReplyMessage] = useState("")

  // Filter inquiries based on search query and active tab
  const filteredInquiries = inquiries
    ? inquiries.filter((inquiry) => {
        // Filter by search query
        const matchesSearch =
          !searchQuery ||
          inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inquiry.message.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter by status tab
        const matchesTab =
          activeTab === "all" ||
          (activeTab === "new" && inquiry.status === "new") ||
          (activeTab === "replied" && inquiry.status === "replied") ||
          (activeTab === "resolved" && inquiry.status === "resolved")

        return matchesSearch && matchesTab
      })
    : []

  // Sort inquiries by created_at (most recent first)
  const sortedInquiries = [...filteredInquiries].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Paginate inquiries
  const totalPages = Math.ceil(sortedInquiries.length / PAGE_SIZE)
  const paginatedInquiries = sortedInquiries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const statusStyles = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      replied: "bg-yellow-100 text-yellow-800 border-yellow-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
    }

    return <Badge className={statusStyles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  // Handle view inquiry
  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowViewDialog(true)
  }

  // Handle reply to inquiry
  const handleReplyClick = (inquiry) => {
    setSelectedInquiry(inquiry)
    setReplyMessage(inquiry.reply || "")
    setShowReplyDialog(true)
  }

  // Submit reply
  const submitReply = async () => {
    if (!replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Reply message cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await replyToInquiry(selectedInquiry.id, replyMessage)
      setShowReplyDialog(false)
      toast({
        title: "Success",
        description: "Reply sent successfully",
      })
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mark inquiry as resolved
  const handleMarkAsResolved = async (inquiry) => {
    setIsLoading(true)
    try {
      await updateInquiryStatus(inquiry.id, "resolved")
      toast({
        title: "Success",
        description: "Inquiry marked as resolved",
      })
    } catch (error) {
      console.error("Error updating inquiry status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update inquiry status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inquiries</h1>
          <p className="text-muted-foreground">Manage and respond to customer inquiries</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Inquiries</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="replied">Replied</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inquiries..."
            className="pl-10 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading inquiries...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium">Failed to load inquiries</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : paginatedInquiries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No inquiries found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : activeTab !== "all"
                    ? `No ${activeTab} inquiries found`
                    : "No inquiries have been received yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell>{inquiry.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{formatDate(inquiry.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewInquiry(inquiry)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              View Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReplyClick(inquiry)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleMarkAsResolved(inquiry)}
                              disabled={inquiry.status === "resolved"}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, sortedInquiries.length)}{" "}
              of {sortedInquiries.length} inquiries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* View Inquiry Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              From {selectedInquiry?.name} ({selectedInquiry?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                <p className="text-lg font-semibold">{selectedInquiry.subject}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Message</h3>
                <div className="mt-1 p-4 bg-muted rounded-md whitespace-pre-line">{selectedInquiry.message}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Received</h3>
                  <p>{formatDate(selectedInquiry.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="flex justify-end">{getStatusBadge(selectedInquiry.status)}</div>
                </div>
              </div>
              {selectedInquiry.reply && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Your Reply</h3>
                  <div className="mt-1 p-4 bg-blue-50 rounded-md whitespace-pre-line">{selectedInquiry.reply}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowViewDialog(false)
                handleReplyClick(selectedInquiry)
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              {selectedInquiry?.reply ? "Edit Reply" : "Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Inquiry</DialogTitle>
            <DialogDescription>
              Send a reply to {selectedInquiry?.name} ({selectedInquiry?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Original Message</h3>
                <div className="mt-1 p-4 bg-muted rounded-md max-h-32 overflow-y-auto whitespace-pre-line">
                  <p className="font-semibold">{selectedInquiry.subject}</p>
                  <p className="mt-2">{selectedInquiry.message}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={8}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={submitReply} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
