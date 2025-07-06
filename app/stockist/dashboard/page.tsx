"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Package, DollarSign, TrendingUp, ShoppingCart, Plus, ArrowUp, ArrowDown, Clock } from "lucide-react"

interface StockistData {
  id: number
  businessName: string
  status: string
  totalSales: number
  totalCommission: number
  availableStock: number
}

interface Transaction {
  id: number
  type: string
  quantity: number
  unitPrice: number
  totalAmount: number
  customerName?: string
  createdAt: string
}

export default function StockistDashboard() {
  const { toast } = useToast()
  const [stockist, setStockist] = useState<StockistData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [saleForm, setSaleForm] = useState({
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  })

  useEffect(() => {
    fetchStockistData()
    fetchTransactions()
  }, [])

  const fetchStockistData = async () => {
    try {
      const response = await fetch("/api/stockist/profile")
      if (response.ok) {
        const data = await response.json()
        setStockist(data.stockist)
      }
    } catch (error) {
      console.error("Failed to fetch stockist data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/stockist/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    }
  }

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/stockist/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saleForm,
          unitPrice: 36000, // Package price
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sale recorded successfully!",
        })
        setSaleForm({ quantity: 1, customerName: "", customerPhone: "", customerEmail: "" })
        fetchStockistData()
        fetchTransactions()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to record sale",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    }
  }

  const requestStock = async (quantity: number) => {
    try {
      const response = await fetch("/api/stockist/request-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Stock request for ${quantity} units submitted!`,
        })
        fetchStockistData()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to request stock",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg animate-pulse">Loading stockist dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stockist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Not a Stockist</CardTitle>
            <CardDescription>You need to apply to become a stockist first</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
              onClick={() => (window.location.href = "/stockist/register")}
            >
              Apply to Become Stockist
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-bold text-gray-900">Stockist Dashboard</h1>
              <p className="text-gray-600 text-lg">{stockist.businessName}</p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 ${
                  stockist.status === "approved"
                    ? "bg-green-100 text-green-800 animate-pulse-slow"
                    : stockist.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 animate-pulse"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {stockist.status.charAt(0).toUpperCase() + stockist.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Available Stock",
              value: stockist.availableStock,
              subtitle: "Units in inventory",
              icon: Package,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50",
              textColor: "text-blue-600",
              delay: "animation-delay-0",
            },
            {
              title: "Total Sales",
              value: `₦${stockist.totalSales.toLocaleString()}`,
              subtitle: "All time sales",
              icon: DollarSign,
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50",
              textColor: "text-green-600",
              delay: "animation-delay-200",
            },
            {
              title: "Total Commission",
              value: `₦${stockist.totalCommission.toLocaleString()}`,
              subtitle: "10% of sales",
              icon: TrendingUp,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50",
              textColor: "text-purple-600",
              delay: "animation-delay-400",
            },
            {
              title: "Units Sold",
              value: Math.floor(stockist.totalSales / 36000),
              subtitle: "Total packages sold",
              icon: ShoppingCart,
              color: "from-orange-500 to-orange-600",
              bgColor: "bg-orange-50",
              textColor: "text-orange-600",
              delay: "animation-delay-600",
            },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className={`card-hover shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up ${stat.delay}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Record Sale Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in-left">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <ShoppingCart className="h-6 w-6 mr-2 text-blue-600" />
                Record New Sale
              </CardTitle>
              <CardDescription>Record a sale to update your inventory and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSale} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-gray-700 font-medium">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={stockist.availableStock}
                    value={saleForm.quantity}
                    onChange={(e) =>
                      setSaleForm((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                    }
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-gray-700 font-medium">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    value={saleForm.customerName}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Customer's full name"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-gray-700 font-medium">
                    Customer Phone
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={saleForm.customerPhone}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+234 xxx xxx xxxx"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Sale Amount:</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₦{(saleForm.quantity * 36000).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-800 font-medium">Your Commission:</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₦{(saleForm.quantity * 36000 * 0.1).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                  disabled={stockist.availableStock === 0}
                >
                  Record Sale
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stock Management Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in-right">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Package className="h-6 w-6 mr-2 text-green-600" />
                Stock Management
              </CardTitle>
              <CardDescription>Request additional stock from headquarters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => requestStock(10)}
                  variant="outline"
                  className="h-24 flex-col transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-blue-200 hover:border-blue-400"
                >
                  <Plus className="h-8 w-8 mb-2 text-blue-600" />
                  <span className="font-semibold">Request 10 Units</span>
                  <span className="text-xs text-gray-500">₦300,000</span>
                </Button>
                <Button
                  onClick={() => requestStock(25)}
                  variant="outline"
                  className="h-24 flex-col transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-purple-200 hover:border-purple-400"
                >
                  <Plus className="h-8 w-8 mb-2 text-purple-600" />
                  <span className="font-semibold">Request 25 Units</span>
                  <span className="text-xs text-gray-500">₦750,000</span>
                </Button>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Processing Information
                </p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Stock requests are processed within 24 hours</li>
                  <li>• Payment required before stock dispatch</li>
                  <li>• Delivery takes 2-3 business days</li>
                </ul>
              </div>

              {/* Recent Transactions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Recent Transactions
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={`flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border transition-all duration-200 hover:shadow-md animate-fade-in-up`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full mr-3 ${transaction.type === "sale" ? "bg-green-100" : "bg-blue-100"}`}
                        >
                          {transaction.type === "sale" ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.type === "sale" ? "Sale" : "Purchase"} - {transaction.quantity} units
                          </p>
                          <p className="text-xs text-gray-500">{transaction.customerName || "Stock purchase"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${transaction.type === "sale" ? "text-green-600" : "text-blue-600"}`}
                        >
                          {transaction.type === "sale" ? "+" : "-"}₦{transaction.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
          opacity: 0;
          transform: translateX(-40px);
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
          opacity: 0;
          transform: translateX(40px);
        }
        .animation-delay-0 { animation-delay: 0ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
