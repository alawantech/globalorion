"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Store, CheckCircle, XCircle, Eye, DollarSign } from "lucide-react"

interface Stockist {
  id: number
  userId: number
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  status: string
  totalSales: number
  totalCommission: number
  availableStock: number
  createdAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
    memberId: string
  }
}

export default function AdminStockistsPage() {
  const { toast } = useToast()
  const [stockists, setStockists] = useState<Stockist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStockists()
  }, [])

  const fetchStockists = async () => {
    try {
      const response = await fetch("/api/admin/stockists")
      if (response.ok) {
        const data = await response.json()
        setStockists(data.stockists)
      }
    } catch (error) {
      console.error("Failed to fetch stockists:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStockistStatus = async (stockistId: number, status: string) => {
    try {
      const response = await fetch("/api/admin/stockists/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockistId, status }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Stockist ${status} successfully`,
        })
        fetchStockists()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update stockist status",
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
          <p className="mt-6 text-gray-600 text-lg animate-pulse">Loading stockists...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Stockists",
      value: stockists.length,
      icon: Store,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Approved",
      value: stockists.filter((s) => s.status === "approved").length,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Pending",
      value: stockists.filter((s) => s.status === "pending").length,
      icon: Eye,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Total Sales",
      value: `₦${stockists.reduce((sum, s) => sum + s.totalSales, 0).toLocaleString()}`,
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ]

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
              <h1 className="text-3xl font-bold text-gray-900">Stockist Management</h1>
              <p className="text-gray-600 text-lg">Manage stockist applications and performance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className={`card-hover shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up animation-delay-${index * 200}`}
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
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stockists List */}
        <div className="space-y-6">
          {stockists.map((stockist, index) => (
            <Card
              key={stockist.id}
              className={`shadow-xl border-0 bg-white/80 backdrop-blur-sm card-hover animate-slide-in-up animation-delay-${800 + index * 100}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{stockist.businessName}</CardTitle>
                    <CardDescription className="text-base">
                      {stockist.user?.firstName} {stockist.user?.lastName} ({stockist.user?.memberId})
                    </CardDescription>
                    <p className="text-sm text-gray-600 mt-2">{stockist.businessAddress}</p>
                  </div>
                  <Badge
                    className={`transition-all duration-200 ${
                      stockist.status === "approved"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : stockist.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 animate-pulse"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {stockist.status.charAt(0).toUpperCase() + stockist.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Business Phone</p>
                    <p className="font-semibold text-blue-900">{stockist.businessPhone}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Business Email</p>
                    <p className="font-semibold text-green-900">{stockist.businessEmail}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Total Sales</p>
                    <p className="font-semibold text-purple-900">₦{stockist.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Available Stock</p>
                    <p className="font-semibold text-orange-900">{stockist.availableStock} units</p>
                  </div>
                </div>

                {stockist.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => updateStockistStatus(stockist.id, "approved")}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStockistStatus(stockist.id, "rejected")}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:scale-105"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {stockist.status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStockistStatus(stockist.id, "suspended")}
                    className="transition-all duration-200 hover:scale-105 border-2 border-orange-200 hover:border-orange-400 text-orange-600 hover:text-orange-700"
                  >
                    Suspend
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {stockists.length === 0 && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up">
              <CardContent className="text-center py-16">
                <div className="animate-bounce-slow mb-6">
                  <Store className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-3">No Stockists Yet</h3>
                <p className="text-gray-600 text-lg">Stockist applications will appear here when submitted.</p>
              </CardContent>
            </Card>
          )}
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
        .animate-slide-in-up {
          animation: slideInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(40px);
        }
        .animation-delay-0 { animation-delay: 0ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-900 { animation-delay: 900ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
