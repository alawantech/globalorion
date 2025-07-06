"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Plus, Send, Search, Filter, Download, Eye, Copy } from "lucide-react"

export default function AdminPinsPage() {
  const [bulkPinCount, setBulkPinCount] = useState(10)
  const [customPinData, setCustomPinData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const [pins] = useState([
    {
      id: 1,
      pin: "PIN123456",
      status: "Available",
      createdDate: "2024-01-15",
      createdFor: null,
      usedBy: null,
      usedDate: null,
      customerEmail: null,
    },
    {
      id: 2,
      pin: "PIN123457",
      status: "Used",
      createdDate: "2024-01-14",
      createdFor: "John Doe",
      usedBy: "John Doe",
      usedDate: "2024-01-16",
      customerEmail: "john@example.com",
    },
    {
      id: 3,
      pin: "PIN789012",
      status: "Reserved",
      createdDate: "2024-01-20",
      createdFor: "Sarah Johnson",
      usedBy: null,
      usedDate: null,
      customerEmail: "sarah@example.com",
    },
  ])

  const generateBulkPins = async () => {
    setIsGenerating(true)
    setMessage({ text: "", type: "" })

    try {
      const response = await fetch("/api/admin/generate-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: bulkPinCount,
          adminId: 1, // Get from auth context
          type: "bulk",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ text: `${bulkPinCount} PINs generated successfully!`, type: "success" })
        setBulkPinCount(10)
      } else {
        setMessage({ text: result.error || "Failed to generate PINs", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error generating PINs. Please try again.", type: "error" })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCustomPin = async () => {
    setIsGenerating(true)
    setMessage({ text: "", type: "" })

    try {
      const response = await fetch("/api/admin/generate-custom-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customPinData,
          adminId: 1, // Get from auth context
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          text: `PIN generated and sent to ${customPinData.customerEmail}!`,
          type: "success",
        })
        setCustomPinData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          notes: "",
        })
      } else {
        setMessage({ text: result.error || "Failed to generate PIN", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error generating PIN. Please try again.", type: "error" })
    } finally {
      setIsGenerating(false)
    }
  }

  const sendPinByEmail = async (pinId: number, pin: string) => {
    setIsSending(true)

    try {
      const response = await fetch("/api/admin/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pinId,
          pin,
          adminId: 1,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ text: "PIN sent successfully!", type: "success" })
      } else {
        setMessage({ text: result.error || "Failed to send PIN", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error sending PIN. Please try again.", type: "error" })
    } finally {
      setIsSending(false)
    }
  }

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin)
    setMessage({ text: "PIN copied to clipboard!", type: "success" })
    setTimeout(() => setMessage({ text: "", type: "" }), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#0066E0]">PIN Management</h1>
              <p className="text-muted-foreground">Generate and manage activation PINs for offline purchases</p>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-600">
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate PINs</TabsTrigger>
            <TabsTrigger value="custom">Custom PIN</TabsTrigger>
            <TabsTrigger value="manage">Manage PINs</TabsTrigger>
          </TabsList>

          {/* Bulk PIN Generation */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Bulk PIN Generation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate multiple PINs for offline sales and distribution
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pinCount">Number of PINs to generate</Label>
                    <Input
                      id="pinCount"
                      type="number"
                      value={bulkPinCount}
                      onChange={(e) => setBulkPinCount(Number.parseInt(e.target.value) || 0)}
                      min="1"
                      max="1000"
                      placeholder="Enter number of PINs"
                    />
                  </div>
                  <Button
                    onClick={generateBulkPins}
                    className="w-full bg-[#0066E0] hover:bg-[#00266C]"
                    disabled={isGenerating || bulkPinCount < 1}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generating..." : `Generate ${bulkPinCount} PINs`}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PIN Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#0066E0]">1,250</div>
                      <div className="text-sm text-muted-foreground">Total Generated</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">892</div>
                      <div className="text-sm text-muted-foreground">Used PINs</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">358</div>
                    <div className="text-sm text-muted-foreground">Available PINs</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export PIN List
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Custom PIN Generation */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Generate Custom PIN for Offline Purchase
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate a PIN for a specific customer and send it via email
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        value={customPinData.customerName}
                        onChange={(e) => setCustomPinData({ ...customPinData, customerName: e.target.value })}
                        placeholder="Enter customer's full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Customer Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customPinData.customerEmail}
                        onChange={(e) => setCustomPinData({ ...customPinData, customerEmail: e.target.value })}
                        placeholder="Enter customer's email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customPinData.customerPhone}
                        onChange={(e) => setCustomPinData({ ...customPinData, customerPhone: e.target.value })}
                        placeholder="Enter customer's phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={customPinData.notes}
                        onChange={(e) => setCustomPinData({ ...customPinData, notes: e.target.value })}
                        placeholder="Add any notes about this customer or purchase..."
                        rows={4}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• PIN will be generated automatically</li>
                        <li>• Email sent to customer with PIN and instructions</li>
                        <li>• PIN marked as "Reserved" for this customer</li>
                        <li>• Customer can use PIN to complete registration</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={generateCustomPin}
                    className="w-full bg-[#0066E0] hover:bg-[#00266C]"
                    disabled={isGenerating || !customPinData.customerName || !customPinData.customerEmail}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generating & Sending..." : "Generate PIN & Send Email"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PIN Management */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>PIN Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search PINs..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PIN Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Created For</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Used Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pins.map((pin) => (
                      <TableRow key={pin.id}>
                        <TableCell className="font-mono">{pin.pin}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pin.status === "Available" ? "default" : pin.status === "Used" ? "secondary" : "outline"
                            }
                            className={
                              pin.status === "Available"
                                ? "bg-green-500"
                                : pin.status === "Reserved"
                                  ? "bg-orange-500"
                                  : ""
                            }
                          >
                            {pin.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{pin.createdDate}</TableCell>
                        <TableCell>{pin.createdFor || "-"}</TableCell>
                        <TableCell>{pin.usedBy || "-"}</TableCell>
                        <TableCell>{pin.usedDate || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => copyPin(pin.pin)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            {pin.status === "Available" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendPinByEmail(pin.id, pin.pin)}
                                disabled={isSending}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
