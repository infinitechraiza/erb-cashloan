"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Wallet, Copy, CheckCircle2, Loader2, User, Mail, Phone, Image as ImageIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface LoanApplication {
  id: number
  type: string
  principal_amount: string
  approved_amount?: string
  interest_rate: string
  status: string
  term_months?: number
  purpose?: string
  created_at: string
  updated_at: string
  start_date?: string
  first_payment_date?: string
  notes?: string
  rejection_reason?: string
  outstanding_balance?: string
  borrower?: {
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
}

interface WalletInfo {
  wallet_name: string
  wallet_number: string
  wallet_email?: string
  wallet_proof_url?: string
  lender_name: string
  lender_email?: string
}

interface ReceiverWalletModalProps {
  loan: LoanApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiverWalletModal({ loan, open, onOpenChange }: ReceiverWalletModalProps) {
  const [loading, setLoading] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (open && loan?.id) {
      fetchWalletInfo()
    }
  }, [open, loan?.id])

  const fetchWalletInfo = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/loans/${loan?.id}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch wallet information")
      }

      const data = await response.json()
      setWalletInfo(data.wallet || data.data)
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to load wallet information"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success("Copied!", { description: `${field} copied to clipboard` })
      
      setTimeout(() => {
        setCopiedField(null)
      }, 2000)
    } catch (err) {
      toast.error("Error", { description: "Failed to copy to clipboard" })
    }
  }

  const handleClose = () => {
    setWalletInfo(null)
    setCopiedField(null)
    onOpenChange(false)
  }

  if (!loan) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Receiver's E-Wallet Information
          </DialogTitle>
          <DialogDescription>
            Send your loan amount to the following e-wallet details
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading wallet information...</p>
          </div>
        ) : walletInfo ? (
          <div className="space-y-6">
            {/* Loan Summary */}
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan ID</span>
                  <span className="font-medium">#{loan.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Type</span>
                  <span className="font-medium capitalize">{loan.type}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-200">
                  <span>Approved Amount</span>
                  <span className="text-green-600">
                    ₱{parseFloat(loan.approved_amount || loan.principal_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Card>

            {/* Lender Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Lender Information
              </h3>
              
              <Card className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground">Lender Name</Label>
                    <p className="font-medium">{walletInfo.lender_name}</p>
                  </div>
                </div>

                {walletInfo.lender_email && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium text-sm break-all">{walletInfo.lender_email}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* E-Wallet Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                E-Wallet Details
              </h3>

              <Card className="p-4 space-y-4">
                {/* Wallet Name */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Account Name</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-medium">{walletInfo.wallet_name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(walletInfo.wallet_name, "Account Name")}
                      className="flex-shrink-0"
                    >
                      {copiedField === "Account Name" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Wallet Number */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-mono font-medium text-lg">{walletInfo.wallet_number}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(walletInfo.wallet_number, "Mobile Number")}
                      className="flex-shrink-0"
                    >
                      {copiedField === "Mobile Number" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Wallet Email */}
                {walletInfo.wallet_email && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">E-Wallet Email</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-medium text-sm break-all">{walletInfo.wallet_email}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(walletInfo.wallet_email!, "E-Wallet Email")}
                        className="flex-shrink-0"
                      >
                        {copiedField === "E-Wallet Email" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Wallet Proof */}
                {walletInfo.wallet_proof_url && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">E-Wallet Proof</Label>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={walletInfo.wallet_proof_url}
                        alt="E-Wallet Proof"
                        className="w-full h-auto"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(walletInfo.wallet_proof_url, '_blank')}
                        >
                          <ImageIcon className="h-4 w-4 mr-1" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Instructions */}
            <Card className="p-4 bg-amber-50 border-amber-200">
              <h4 className="font-semibold text-sm text-amber-900 mb-2">Payment Instructions:</h4>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>Open your GCash, PayMaya, or other e-wallet app</li>
                <li>Send exactly ₱{parseFloat(loan.approved_amount || loan.principal_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} to the mobile number above</li>
                <li>Ensure the account name matches the details shown</li>
                <li>Take a screenshot of the transaction confirmation</li>
                <li>Keep the reference number for your records</li>
              </ol>
            </Card>

            {/* Action Button */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No wallet information available for this loan.</p>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}