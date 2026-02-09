"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCheckIcon, CheckCircle, Download, Eye, XCircle, User as UserIcon } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { ReusableDataTable, ColumnDef, FilterConfig } from "@/components/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { api, authenticatedFetch } from "@/lib/auth" // Import the utilities

interface Loan {
  id: number
  loan_number: string
  type: string
  principal_amount: string
  approved_amount?: string
  interest_rate: string
  status: string
  term_months?: number
  purpose?: string
  created_at: string
  approved_at?: string
  updated_at: string
  disbursement_date?: string
  start_date?: string
  first_payment_date?: string
  notes?: string
  rejection_reason?: string
  outstanding_balance?: string
  employment_status?: string
  borrower?: {
    name?: string
    first_name: string
    last_name: string
    email?: string
  }
  lender?: {
    id: number
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
    [key: string]: any
  }>
}

interface Payment {
  id: number
  transaction_id: string
  amount: string
  due_date: string
  status: string
  loan?: Loan
  loan_id: string
  days_late: string
  late_fee: string
  payment_method: string
  created_at: string
  payment_date?: string
  paid_date?: string
  notes?: string
  rejection_reason?: string
  proof_of_payment?: string
  verified_at?: string
  updated_at?: string
}

interface VerifyPaymentResponse {
  message: string
  payment: Payment
}

export default function LenderPaymentsPage() {
  const router = useRouter()
  const { authenticated, loading: authLoading } = useAuth()

  const [error, setError] = useState("")
  const [refresh, setRefresh] = useState(false)

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [viewPaymentOpen, setViewPaymentOpen] = useState(false)
  const [verifyActionLoading, setVerifyActionLoading] = useState(false)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/")
      return
    }
  }, [authenticated, authLoading, router])

  const handleRefresh = () => {
    setRefresh(!refresh)
  }

  // REFACTORED: Using the new api utility
  const handleVerifyPayment = async (action: "approve" | "reject", reason?: string) => {
    if (!selectedPayment) return
    setVerifyActionLoading(true)
    try {
      const data = await api.post<VerifyPaymentResponse>(
        `/api/payments/${selectedPayment.id}/verify`,
        { action, reason: action === "reject" ? reason : undefined },
        router
      )
      
      setViewPaymentOpen(false)
      setSelectedPayment(null)
      handleRefresh()
      toast.success(data.message || `Payment ${action === "approve" ? "approved" : "rejected"} successfully`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Failed to verify")
    } finally {
      setVerifyActionLoading(false)
    }
  }

  // REFACTORED: Using authenticatedFetch for file downloads
  const downloadFile = async (paymentId: string) => {
    try {
      if (!paymentId) throw new Error("Invalid payment ID")

      const proxyUrl = `/api/payments/${paymentId}/proof/download`

      const response = await authenticatedFetch(proxyUrl, { method: 'GET' }, router)
      
      if (!response.ok) throw new Error("Failed to fetch file")

      const blob = await response.blob()

      const disposition = response.headers.get("content-disposition")
      let fileName = "proof.png"

      if (disposition?.includes("filename=")) {
        const match = disposition.match(/filename="?(.+)"?/)
        if (match && match[1]) fileName = match[1]
      }

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("File downloaded successfully")
    } catch (err) {
      console.error("Download failed", err)
      toast.error((err as Error).message || "Failed to download file")
    }
  }

  // Define columns for ReusableDataTable
  const columns: ColumnDef<Payment>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "w-[80px]",
      render: (value) => <span className="font-medium">#{value}</span>,
    },
    {
      key: "transaction_id",
      label: "Transaction #",
      sortable: true,
      width: "w-[140px]",
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "loan.borrower.name",
      label: "Borrower",
      width: "w-[150px]",
      render: (value, row) => row.loan?.borrower?.name || "-",
    },
    {
      key: "loan.borrower.email",
      label: "Email",
      width: "w-[180px]",
      render: (value, row) => row.loan?.borrower?.email || "-",
    },
    {
      key: "loan_id",
      label: "Loan #",
      sortable: true,
      width: "w-[100px]",
      render: (value) => <span className="font-medium">#{value}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      width: "w-[120px]",
      align: "right",
      render: (value) => (
        <span className="font-semibold">
          ₱{Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: true,
      width: "w-[120px]",
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      width: "w-[160px]",
      align: "center",
      render: (value) => {
        const rawStatus = (value as string)?.toLowerCase()

        const statusLabels: Record<string, string> = {
          paid: "Paid",
          pending: "Pending",
          late: "Late",
          missed: "Missed",
          awaiting_verification: "Awaiting Verification",
          rejected: "Rejected",
        }

        const statusStyles: Record<string, string> = {
          paid: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          late: "bg-orange-100 text-orange-800",
          missed: "bg-red-100 text-red-800",
          awaiting_verification: "bg-yellow-200 text-yellow-800",
          rejected: "bg-red-100 text-red-800",
        }

        const label = statusLabels[rawStatus] ?? rawStatus
        const cls = statusStyles[rawStatus] ?? "bg-gray-100 text-gray-800"

        return <Badge variant="outline" className={`${cls} px-2 py-1`}>{label}</Badge>
      },
    },
  ]

  // Define filters
  const filters: FilterConfig[] = [
    {
      key: "type",
      label: "Type",
      type: "select",
      defaultValue: "all",
      options: [
        { value: "all", label: "All" },
        { value: "upcoming", label: "Upcoming" },
        { value: "overdue", label: "Overdue" },
        { value: "awaiting_verification", label: "Awaiting Verification" },
        { value: "rejected", label: "Rejected" },
        { value: "paid", label: "Paid" },
      ],
    },
  ]

  // Row actions
  const rowActions = (payment: Payment) => (
    <div className="flex items-center gap-2 justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedPayment(payment)
          setViewPaymentOpen(true)
        }}
        title={payment.status !== "awaiting_verification" ? "View Details" : "Verify Payment"}
      >
        {payment.status !== "awaiting_verification" ? (
          <Eye className="h-4 w-4 text-blue-500" />
        ) : (
          <CheckCheckIcon className="h-4 w-4 text-slate-800" />
        )}
      </Button>
    </div>
  )

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (redirect will happen in useEffect)
  if (!authenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-full flex-1 flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold text-primary">Payments</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage and track all payments</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border rounded flex gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Table with Filters */}
          <ReusableDataTable<Payment>
            apiEndpoint="/api/payments"
            refresh={refresh}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search payments, borrower, loan #..."
            searchFields={['transaction_id', 'loan.borrower.name', 'loan_id']}
            rowActions={rowActions}
            defaultPerPage={10}
            defaultSort={{ field: 'due_date', order: 'asc' }}
            emptyMessage="No payments found"
            loadingMessage="Loading payments..."
          />
        </main>
      </div>

      {/* View Payment Dialog - IMPROVED DESIGN */}
      <Dialog open={viewPaymentOpen} onOpenChange={setViewPaymentOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Payment Details
            </h2>
            <div className="flex items-center gap-3 text-blue-50">
              <span className="text-sm">Loan #{selectedPayment?.loan_id}</span>
              <span className="text-blue-300">•</span>
              <span className="text-sm font-mono">{selectedPayment?.transaction_id}</span>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Status Banner */}
            <div className="bg-white px-8 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </label>
                  <div className="mt-1">
                    {(() => {
                      const rawStatus = selectedPayment?.status?.toLowerCase() || ""
                      const statusLabels: Record<string, string> = {
                        paid: "Paid",
                        pending: "Pending",
                        late: "Late",
                        missed: "Missed",
                        awaiting_verification: "Awaiting Verification",
                        rejected: "Rejected",
                      }
                      const statusStyles: Record<string, string> = {
                        paid: "bg-green-100 text-green-800 border-green-200",
                        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                        late: "bg-orange-100 text-orange-800 border-orange-200",
                        missed: "bg-red-100 text-red-800 border-red-200",
                        awaiting_verification: "bg-yellow-200 text-yellow-800 border-yellow-300",
                        rejected: "bg-red-100 text-red-800 border-red-200",
                      }
                      const label = statusLabels[rawStatus] ?? rawStatus
                      const cls = statusStyles[rawStatus] ?? "bg-gray-100 text-gray-800 border-gray-200"
                      return <Badge variant="outline" className={`${cls} px-3 py-1`}>{label}</Badge>
                    })()}
                  </div>
                </div>
                <div className="text-right">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Amount
                  </label>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    ₱{parseFloat(selectedPayment?.amount ?? "0").toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-800" />
                Payment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(selectedPayment?.due_date ?? "-").toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Late Fee */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Late Fee
                  </label>
                  <p className="text-sm font-medium text-red-600 mt-1">
                    ₱{parseFloat(selectedPayment?.late_fee ?? "0").toLocaleString()}
                  </p>
                </div>

                {/* Days Late */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Late
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPayment?.days_late || "0"} days
                  </p>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                    {selectedPayment?.payment_method ?? "-"}
                  </p>
                </div>

                {/* Payment Date */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPayment?.payment_date ? new Date(selectedPayment?.payment_date).toLocaleDateString() : "-"}
                  </p>
                </div>

                {/* Paid Date */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPayment?.paid_date ? new Date(selectedPayment?.paid_date).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Borrower Information */}
            <div className="bg-white px-8 py-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-800" />
                Borrower Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower Name
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPayment?.loan?.borrower?.name ?? "-"}
                  </p>
                </div>

                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                    {selectedPayment?.loan?.borrower?.email ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Loan Summary */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Loan Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Loan Status */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Status
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                    {selectedPayment?.loan?.status}
                  </p>
                </div>

                {/* Loan Type */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Type
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                    {selectedPayment?.loan?.type}
                  </p>
                </div>

                {/* Interest Rate */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Rate
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPayment?.loan?.interest_rate}%
                  </p>
                </div>

                {/* Approved Amount */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved Amount
                  </label>
                  <p className="text-sm font-medium text-green-700 mt-1">
                    ₱{parseFloat(selectedPayment?.loan?.approved_amount ?? "0").toLocaleString()}
                  </p>
                </div>

                {/* Outstanding Balance */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding Balance
                  </label>
                  <p className="text-sm font-medium text-red-600 mt-1">
                    ₱{parseFloat(selectedPayment?.loan?.outstanding_balance ?? "0").toLocaleString()}
                  </p>
                </div>

                {/* Term */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPayment?.loan?.term_months} months
                  </p>
                </div>

                {/* Purpose */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm md:col-span-3">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPayment?.loan?.purpose || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Proof of Payment */}
            {selectedPayment?.proof_of_payment && (
              <div className="bg-white px-8 py-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-800" />
                  Proof of Payment
                </h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Download className="h-5 w-5 text-blue-800" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedPayment.proof_of_payment.split("/").pop()}
                        </p>
                        <p className="text-sm text-gray-600">Uploaded proof of payment</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadFile(String(selectedPayment.id))}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-gray-50 px-8 py-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verified At */}
                {selectedPayment?.verified_at && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified At
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {new Date(selectedPayment.verified_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Created At */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(selectedPayment?.created_at ?? "0").toLocaleString()}
                  </p>
                </div>

                {/* Updated At */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(selectedPayment?.updated_at ?? "0").toLocaleString()}
                  </p>
                </div>

                {/* Notes */}
                {selectedPayment?.notes && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedPayment.notes}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedPayment?.rejection_reason && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm md:col-span-2">
                    <label className="text-xs font-medium text-red-500 uppercase tracking-wider">
                      Rejection Reason
                    </label>
                    <p className="text-sm font-medium text-red-900 mt-1">
                      {selectedPayment.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedPayment?.status === "awaiting_verification" && (
              <div className="bg-white px-8 py-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700" 
                    onClick={() => setApproveConfirmOpen(true)} 
                    disabled={verifyActionLoading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve Payment
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1" 
                    onClick={() => setRejectReasonOpen(true)} 
                    disabled={verifyActionLoading}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirm Dialog */}
      <Dialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve this payment?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setApproveConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setApproveConfirmOpen(false)
                handleVerifyPayment("approve")
              }}
              disabled={verifyActionLoading}
            >
              {verifyActionLoading ? "Processing..." : "Approve"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectReasonOpen} onOpenChange={setRejectReasonOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <p>Please provide a reason for rejecting this payment:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full mt-2 p-2 border rounded resize-none"
            rows={3}
            placeholder="Enter rejection reason..."
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRejectReasonOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setRejectReasonOpen(false)
                handleVerifyPayment("reject", rejectReason)
                setRejectReason("")
              }}
              disabled={verifyActionLoading || !rejectReason.trim()}
            >
              {verifyActionLoading ? "Processing..." : "Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}