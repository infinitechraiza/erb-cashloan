"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { BorrowerSidebar } from "@/components/borrower/borrower-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { LenderSidebar } from "@/components/lender/lender-sidebar"
import { LoanOfficerSidebar } from "@/components/loan-officer/loan-officer-sidebar"
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  HandCoins,
  SquarePen
} from "lucide-react"

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  city?: string
  postalCode?: string
  role: "admin" | "lender" | "borrower" | "loan-officer"
  email_verified_at?: string | null
  created_at?: string
}

interface Loans {
  id: number
  outstanding_balance: number
  type: string
  principal_amount: number
  approved_amount: number
  interest_rate: number
  term_months: number
  status: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { authenticated } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authenticated) {
      router.push("/login")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!res.ok) {
          throw new Error("Unauthorized")
        }

        const data = await res.json()
        const u = data.user || data

        setUser({
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          phone: u.phone,
          city: u.city,
          postalCode: u.postal_code,
          role: u.role,
          email_verified_at: u.email_verified_at,
          created_at: u.created_at,
        })
      } catch (error) {
        console.error("Fetch user error:", error)
        localStorage.removeItem("token")
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [authenticated, router])

  const handleLogout = async () => {
    const token = localStorage.getItem("token")
    if (token) {
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    }
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (!user) return null

  const getRoleProfile = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard onLogout={handleLogout} user={user} />
      case "lender":
        return <LenderDashboard onLogout={handleLogout} user={user} />
      case "borrower":
        return <BorrowerDashboard onLogout={handleLogout} user={user} />
      // case "loan-officer":
      //     return <LoanOfficerProfile onLogout={handleLogout} user={user} />
      default:
        return <BorrowerDashboard onLogout={handleLogout} user={user} />
    }
  }

  return getRoleProfile()
}

function AdminDashboard({ onLogout, user }: any) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">LoanHub Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.firstName} {user.lastName}
            </span>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Loans" value="248" icon={<FileText className="h-5 w-5" />} />
          <StatCard title="Active Users" value="1,250" icon={<Users className="h-5 w-5" />} />
          <StatCard title="Total Volume" value="$2.5M" icon={<DollarSign className="h-5 w-5" />} />
          <StatCard title="Repayment Rate" value="94.2%" icon={<TrendingUp className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Loans</h2>
            <p className="text-muted-foreground">Loan list coming soon...</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">System Overview</h2>
            <p className="text-muted-foreground">Analytics coming soon...</p>
          </Card>
        </div>
      </main>
    </div>
  )
}

function LenderDashboard({ onLogout, user }: any) {
  return (
    <div className="min-h-screen bg-background">
      <LenderSidebar />
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">LoanHub Lender</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.firstName} {user.lastName}
            </span>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Portfolio Value" value="$450K" icon={<DollarSign className="h-5 w-5" />} />
          <StatCard title="Active Loans" value="12" icon={<FileText className="h-5 w-5" />} />
          <StatCard title="Monthly Returns" value="$3,200" icon={<TrendingUp className="h-5 w-5" />} />
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Loans</h2>
          <p className="text-muted-foreground">Loan management interface coming soon...</p>
        </Card>
      </main>
    </div>
  )
}

function BorrowerDashboard({ onLogout, user }: any) {
  const router = useRouter()

  const memberSinceMonth = user.created_at
    ? new Date(user.created_at).toLocaleString("default", { month: "long" })
    : ""

  const memberSinceYear = user.created_at
    ? new Date(user.created_at).getFullYear()
    : ""

  return (
    <div className="flex min-h-screen bg-background">
      <BorrowerSidebar />

      <div className="flex-1 lg:ml-0">
        <div className="lg:hidden h-16" />

        <header className="border-b border-border bg-card">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex">
                <h2 className="text-2xl font-semibold leading-tight">
                  {user.firstName} {user.lastName}
                </h2>


                <div className="jutify-end ml-auto">
                  <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/profile/edit")}>
                    <SquarePen className="md:mr-2 h-4 w-4" />
                    <span className="hidden md:block">Edit Profile</span>
                  </Button>
                </div>
              </div>

              <span className="text-sm text-muted-foreground">
                Member since {memberSinceMonth} {memberSinceYear}
              </span>

              {/* <div>
                {user.email_verified_at ? (
                  <span className="text-xs text-green-600 font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="text-xs border rounded-md px-2 py-0.5 text-gray-700 bg-red-200 font-medium">
                    Unverified
                  </span>
                )}
              </div> */}

              <div>
                <Mail className="inline-block h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Phone className="inline-block h-4 w-4 mr-1 ml-4 text-gray-500" />
                <span className="text-sm text-muted-foreground">
                  {user.phone || "N/A"}
                </span>
                <MapPin className="inline-block h-4 w-4 mr-1 ml-4 text-gray-500" />
                <span className="text-sm text-muted-foreground">
                  {user.city || "N/A"}, {user.postalCode || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Borrowed</p>
                  <p className="text-2xl font-bold text-foreground mt-1"> </p>
                </div>
                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-2xl font-bold text-foreground mt-1"> </p>
                </div>
                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                  <HandCoins className="h-5 w-5" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-foreground mt-1"> </p>
                </div>
                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="text-2xl font-bold text-foreground mt-1"> </p>
                </div>
                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Loans */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Loans</h2>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">
                      No active loans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Apply for a loan to see details here.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Schedule */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    Payment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Payment schedule will appear here once you have an active loan.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment History */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your payment history will be displayed here once you have made payments.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

// function LoanOfficerDashboard({ onLogout, user }: any) {
//   return (
//     <div className="min-h-screen bg-background">
//       <LoanOfficerSidebar />
//       <header className="border-b border-border bg-card">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-primary">LoanHub Officer</h1>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-muted-foreground">
//               {user.firstName} {user.lastName}
//             </span>
//             <Button variant="outline" onClick={onLogout}>
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <StatCard title="Loans Processed" value="28" icon={<FileText className="h-5 w-5" />} />
//           <StatCard title="Pending Applications" value="5" icon={<Users className="h-5 w-5" />} />
//           <StatCard title="Approval Rate" value="87.5%" icon={<TrendingUp className="h-5 w-5" />} />
//         </div>

//         <Card className="p-6">
//           <h2 className="text-lg font-semibold mb-4">Pending Applications</h2>
//           <p className="text-muted-foreground">Application review interface coming soon...</p>
//         </Card>
//       </main>
//     </div>
//   )
// }
