"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  title: string
  subtitle?: string
  userFirstName?: string
  userLastName?: string
  userRole?: string
  onLogout?: () => void
  children: ReactNode
  headerActions?: ReactNode
  className?: string
}

export function DashboardLayout({
  title,
  subtitle,
  userFirstName,
  userLastName,
  userRole,
  onLogout,
  children,
  headerActions,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="w-full flex-1 ml-0 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-16 lg:top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-4">
                {userFirstName && userLastName && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">
                      {userFirstName} {userLastName}
                    </p>
                    {userRole && (
                      <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                    )}
                  </div>
                )}
                {headerActions}
                {onLogout && (
                  <Button
                    variant="outline"
                    onClick={onLogout}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={cn("p-4 sm:p-6 lg:p-8", className)}>{children}</div>
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: "up" | "down"
  trendValue?: string
  iconBg?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  iconBg = "bg-blue-50",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-lg", iconBg)}>{icon}</div>
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                trend === "up" ? "text-emerald-600" : "text-rose-600"
              )}
            >
              <svg
                className={cn("h-4 w-4 mr-1", trend === "down" && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </Card>
  )
}

interface DashboardCardProps {
  title: string
  icon?: ReactNode
  headerAction?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardCard({
  title,
  icon,
  headerAction,
  children,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("bg-white border-slate-200 shadow-sm", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {icon}
          </div>
          {headerAction}
        </div>
        {children}
      </div>
    </Card>
  )
}

interface StatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 mb-8", gridCols[columns], className)}>
      {children}
    </div>
  )
}

interface ContentGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function ContentGrid({ children, columns = 2, className }: ContentGridProps) {
  const gridCols = {
    1: "",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
  }

  return (
    <div className={cn("grid grid-cols-1 gap-6", gridCols[columns], className)}>
      {children}
    </div>
  )
}