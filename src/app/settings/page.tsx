"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import BorrowerSettings from "../borrower/settings/page"
import AdminSettings from "../admin/settings/page"
import LenderSettings from "../lender/settings/page"

export default function SettingsPage() {
  const router = useRouter()
  const { user, authenticated } = useAuth()

  useEffect(() => {
    if (!authenticated) {
      router.push("/")
    }
  }, [authenticated, router])

  const getRoleSettings = () => {
    switch (user?.role) {
      case "admin":
        return <AdminSettings />
      case "lender":
        return <LenderSettings />
      case "borrower":
        return <BorrowerSettings />
      default:
        return <BorrowerSettings />
    }
  }

  if (!authenticated) return null

  return getRoleSettings()
}
