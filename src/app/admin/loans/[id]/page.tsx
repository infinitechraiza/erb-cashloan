"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Loan {
  id: number
  loan_number: string
  type: string
  principal_amount: string
  approved_amount?: string
  interest_rate: string
  term_months?: number
  status: string
  notes?: string
  rejection_reason?: string
  start_date?: string
  first_payment_date?: string
  outstanding_balance?: string
  created_at: string
  updated_at: string
  borrower?: {
    first_name: string
    last_name: string
    email?: string
  }
  lender?: {
    first_name: string
    last_name: string
    email?: string
  }
  loan_officer?: {
    first_name: string
    last_name: string
    email?: string
  }
  documents?: Array<{
    id: number
    name?: string
    file_name?: string
  }>
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 capitalize",
  approved: "bg-blue-100 text-blue-700 capitalize",
  rejected: "bg-red-100 text-red-700 capitalize",
  active: "bg-green-100 text-green-700 capitalize",
  completed: "bg-gray-100 text-gray-700 capitalize",
  defaulted: "bg-black text-white capitalize",
}

export default function LoanDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/loans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to load loan")

        const data = await res.json()
        setLoan(data.loan)
      } catch {
        toast.error("Failed to load loan details")
        router.push("/admin/loans")
      } finally {
        setLoading(false)
      }
    }

    fetchLoan()
  }, [id, router])

  const downloadDocument = async (docId: number, fileName?: string) => {
    setDownloading(docId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/loans/${id}/documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = fileName || "document.pdf"
      a.click()

      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to download document")
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!loan) return null

  return (
    <div className="flex">
      {/* Sidebar */}

      {/* Main content */}
     <main className="flex-1    bg-background min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card">
          <div className="px-8 py-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-primary">User Management</h1>
            <p className="text-muted-foreground mt-1">Centralized administration of accounts and roles</p>
          </div>
        </header>

        {/* Page content */}
        <div className="px-8 py-8 max-w-6xl mx-auto space-y-6">
          {/* Top controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Button onClick={() => router.back()} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {loan?.status && <Badge className={statusColors[loan.status] || "bg-gray-100 text-gray-700"}>{loan.status}</Badge>}
          </div>

          {/* Borrower & Loan */}
          <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Borrower</h3>
              <p>
                {loan?.borrower?.first_name} {loan?.borrower?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{loan?.borrower?.email || "-"}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Loan</h3>
              <p>Type: {loan?.type}</p>
              <p>Requested: ₱{Number(loan?.principal_amount ?? 0).toLocaleString()}</p>
              <p>Approved: {loan?.approved_amount ? `₱${Number(loan.approved_amount).toLocaleString()}` : "-"}</p>
              <p>Rate: {loan?.interest_rate}%</p>
              <p>Term: {loan?.term_months ?? "-"} months</p>
            </div>
          </Card>

          {/* Dates & Notes */}
          <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Dates</h3>
              <p>Start: {loan?.start_date || "-"}</p>
              <p>First Payment: {loan?.first_payment_date || "-"}</p>
              <p>Created: {loan?.created_at ? new Date(loan.created_at).toLocaleString() : "-"}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p>{loan?.notes || "-"}</p>
              {loan?.rejection_reason && <p className="text-red-600">{loan.rejection_reason}</p>}
            </div>
          </Card>

          {/* Documents */}
          {loan?.documents?.length ? (
            <Card className="p-6 space-y-3">
              <h3 className="font-semibold">Documents</h3>

              {loan.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{doc.name || doc.file_name}</span>
                  </div>

                  <Button size="sm" variant="outline" disabled={downloading === doc.id} onClick={() => downloadDocument(doc.id, doc.file_name)}>
                    {downloading === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  )
}
