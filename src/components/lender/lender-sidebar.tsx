"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-context"
import { LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X, Building2, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

export function LenderSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/lender/loans', label: 'Loans', icon: FileText },
    { href: '/lender/payments', label: 'Payments', icon: CreditCard },
    { href: '/lender/borrowers', label: 'Borrowers', icon: Users },
    { href: '/lender/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Lender Portal</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold text-primary mb-8">LoanHub</h1>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* User Info at Bottom */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen sticky fixed top-0 left-0 lg:flex w-64 border-r border-border bg-card flex-col">
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold text-primary mb-8">LoanHub</h1>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* User Info at Bottom */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
