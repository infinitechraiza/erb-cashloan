"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { BorrowerSidebar } from "@/components/borrower/borrower-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, FileText } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { LenderSidebar } from "@/components/lender/lender-sidebar"
import { LoanOfficerSidebar } from "@/components/loan-officer/loan-officer-sidebar"

function StatCard({ title, value, icon }: any) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                </div>
                <div className="text-primary/30">{icon}</div>
            </div>
        </Card>
    )
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, loading, authenticated } = useAuth()

    const handleLogout = () => {
        // Logout logic here
    }

    const getRoleProfile = () => {
        switch (user?.role) {
            case "admin":
                return <AdminProfile onLogout={handleLogout} user={user} />
            case "lender":
                return <LenderProfile onLogout={handleLogout} user={user} />
            case "borrower":
                return <BorrowerProfile onLogout={handleLogout} user={user} />
            default:
                return <BorrowerProfile onLogout={handleLogout} user={user} />
        }
    }

    if (!authenticated) {
        router.push("/")
        return null
    }

    return getRoleProfile()
}

function AdminProfile({ onLogout, user }: any) {
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

function LenderProfile({ onLogout, user }: any) {
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

function BorrowerProfile({ onLogout, user }: any) {
    const router = useRouter()

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <BorrowerSidebar />

            {/* Main Content */}
            <div className="flex-1 lg:ml-0">
                {/* Add padding for mobile header */}
                <div className="lg:hidden h-16" />

                <header className="border-b border-border bg-card">
                    <div className="px-4 sm:px-6 py-4">
                        <h2 className="text-xl font-semibold">Profile</h2>
                    </div>
                </header>

                <main className="p-4 sm:p-6">
                    
                </main>
            </div>
        </div>
    )
}

function LoanOfficerDashboard({ onLogout, user }: any) {
    return (
        <div className="min-h-screen bg-background">
            <LoanOfficerSidebar />
            <header className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">LoanHub Officer</h1>
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
                    <StatCard title="Loans Processed" value="28" icon={<FileText className="h-5 w-5" />} />
                    <StatCard title="Pending Applications" value="5" icon={<Users className="h-5 w-5" />} />
                    <StatCard title="Approval Rate" value="87.5%" icon={<TrendingUp className="h-5 w-5" />} />
                </div>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Pending Applications</h2>
                    <p className="text-muted-foreground">Application review interface coming soon...</p>
                </Card>
            </main>
        </div>
    )
}
