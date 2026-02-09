"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, FileText, PieChart } from "lucide-react"
import { useState } from "react"

export default function AdminReportsPage() {
  const router = useRouter()
  const { authenticated, loading, user } = useAuth()
  const [refresh, setRefresh] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (!authenticated || user?.role !== "admin") {
    router.push("/login")
    return null
  }

  const handleRefresh = () => {
    setRefresh(!refresh)
  }

  const handleDownloadReport = (type: string) => {
    console.log("Downloading report:", type)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="w-full flex-1 ml-0 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-16 lg:top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
                <p className="text-slate-600 mt-1">
                  Comprehensive insights and performance metrics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="overview" className="w-full space-y-6">
            <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="loans"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                Loan Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                User Reports
              </TabsTrigger>
              <TabsTrigger 
                value="financial"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                Financial
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Loans Card */}
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex items-center text-emerald-600 text-sm font-medium">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        12%
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Total Loans</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">2,480</p>
                    <p className="text-xs text-slate-500 mt-2">↑ From last month</p>
                  </div>
                </Card>

                {/* Active Loans Card */}
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <PieChart className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex items-center text-emerald-600 text-sm font-medium">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        8%
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Active Loans</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">1,850</p>
                    <p className="text-xs text-slate-500 mt-2">↑ From last month</p>
                  </div>
                </Card>

                {/* Approved Card */}
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        84.6%
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Approved</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">2,100</p>
                    <p className="text-xs text-slate-500 mt-2">Approval rate</p>
                  </div>
                </Card>

                {/* Default Rate Card */}
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-rose-50 rounded-lg">
                        <TrendingDown className="h-6 w-6 text-rose-600" />
                      </div>
                      <div className="flex items-center text-emerald-600 text-sm font-medium">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        0.5%
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Default Rate</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">2.3%</p>
                    <p className="text-xs text-slate-500 mt-2">↓ From last month</p>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-slate-200 shadow-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Loan Status Distribution</h3>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                      <p className="text-slate-500">Chart visualization coming soon...</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Originations</h3>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                      <p className="text-slate-500">Chart visualization coming soon...</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Loans Tab */}
            <TabsContent value="loans" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Portfolio Volume</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">$145.8M</p>
                    <p className="text-xs text-slate-500 mt-2">Total principal outstanding</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <FileText className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Average Loan Size</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">$58,700</p>
                    <p className="text-xs text-slate-500 mt-2">Across all loans</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Avg Interest Rate</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">6.45%</p>
                    <p className="text-xs text-slate-500 mt-2">Weighted average</p>
                  </div>
                </Card>
              </div>

              <Card className="bg-white border-slate-200 shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Loans by Type</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadReport("loans-by-type")} 
                      className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-slate-500">Detailed breakdown by loan type...</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">5,240</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="p-3 bg-indigo-50 rounded-lg w-fit mb-4">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Borrowers</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">3,100</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="p-3 bg-emerald-50 rounded-lg w-fit mb-4">
                      <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Lenders</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">1,840</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="p-3 bg-violet-50 rounded-lg w-fit mb-4">
                      <Users className="h-6 w-6 text-violet-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Loan Officers</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">300</p>
                  </div>
                </Card>
              </div>

              <Card className="bg-white border-slate-200 shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">New User Registrations</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadReport("new-users")} 
                      className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-slate-500">Growth tracking by user type...</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Interest Collected</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">$12.4M</p>
                    <p className="text-xs text-slate-500 mt-2">Year to date</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Payments Processed</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">$89.2M</p>
                    <p className="text-xs text-slate-500 mt-2">This year</p>
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Loan Loss Reserves</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">$3.1M</p>
                    <p className="text-xs text-slate-500 mt-2">Allocated</p>
                  </div>
                </Card>
              </div>

              <Card className="bg-white border-slate-200 shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Revenue Analysis</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadReport("financial")} 
                      className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-slate-500">Monthly revenue trends and projections...</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}