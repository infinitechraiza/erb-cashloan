// components/loans/add-edit-wallet-form.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"

interface LoanApplication {
  id: number
  type: string
  principal_amount: string
  approved_amount?: string
  interest_rate: string
  status: string
  term_months?: number
  lender?: {
    id: number
    first_name: string
    last_name: string
  }
}

interface AddEditWalletFormProps {
  loan: LoanApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddEditWalletForm({ loan, open, onOpenChange, onSuccess }: AddEditWalletFormProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    receiver_wallet_name: "",
    receiver_wallet_number: "",
    receiver_wallet_email: "",
  })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [existingProofUrl, setExistingProofUrl] = useState<string | null>(null)

  useEffect(() => {
    if (open && loan?.id) {
      fetchExistingWalletInfo()
    } else {
      resetForm()
    }
  }, [open, loan?.id])

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const fetchExistingWalletInfo = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/loans/${loan?.id}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const wallet = data.wallet || data.data

        if (wallet) {
          setFormData({
            receiver_wallet_name: wallet.wallet_name || "",
            receiver_wallet_number: wallet.wallet_number || "",
            receiver_wallet_email: wallet.wallet_email || "",
          })
          setExistingProofUrl(wallet.wallet_proof_url || null)
        }
      }
      // If 404, it means no wallet info exists yet - that's fine
    } catch (err) {
      console.error('Error fetching wallet info:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")
      const form = new FormData()

      form.append("receiver_wallet_name", formData.receiver_wallet_name)
      form.append("receiver_wallet_number", formData.receiver_wallet_number)
      if (formData.receiver_wallet_email) {
        form.append("receiver_wallet_email", formData.receiver_wallet_email)
      }
      if (proofFile) {
        form.append("receiver_wallet_proof", proofFile)
      }

      const response = await fetch(`/api/loans/${loan?.id}/wallet`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to update wallet information" }))
        throw new Error(error.message || "Failed to update wallet information")
      }

      toast.success("Success", {
        description: "E-wallet information saved successfully"
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to save wallet information"
      })
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      receiver_wallet_name: "",
      receiver_wallet_number: "",
      receiver_wallet_email: "",
    })
    setProofFile(null)
    setExistingProofUrl(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  if (!loan) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingProofUrl ? "Edit E-Wallet Information" : "Add E-Wallet Information"}
          </DialogTitle>
          <DialogDescription>
            Enter your e-wallet details for receiving loan disbursements
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loan Summary */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan ID</span>
                  <span className="font-medium">#{loan.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Type</span>
                  <span className="font-medium capitalize">{loan.type}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                  <span>Approved Amount</span>
                  <span className="text-blue-600">
                    ₱{parseFloat(loan.approved_amount || loan.principal_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Card>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet_name">
                  E-Wallet Account Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wallet_name"
                  value={formData.receiver_wallet_name}
                  onChange={(e) => setFormData({ ...formData, receiver_wallet_name: e.target.value })}
                  placeholder="Juan Dela Cruz"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Name as registered in your GCash, PayMaya, or other e-wallet
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet_number">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wallet_number"
                  value={formData.receiver_wallet_number}
                  onChange={(e) => setFormData({ ...formData, receiver_wallet_number: e.target.value })}
                  placeholder="09171234567"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Mobile number linked to your e-wallet account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet_email">E-Wallet Email (Optional)</Label>
                <Input
                  id="wallet_email"
                  type="email"
                  value={formData.receiver_wallet_email}
                  onChange={(e) => setFormData({ ...formData, receiver_wallet_email: e.target.value })}
                  placeholder="email@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Email associated with your e-wallet (if any)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet_proof">
                  E-Wallet Screenshot/Proof
                </Label>
                <Input
                  id="wallet_proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot of your e-wallet account (JPG, PNG, or PDF, max 2MB)
                </p>

                {/* Preview new upload */}
                {previewUrl && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">New Upload Preview:</p>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                    </div>
                  </div>
                )}

                {/* Show existing proof if no new upload */}
                {existingProofUrl && !previewUrl && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Current Proof:</p>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200">
                      <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${existingProofUrl}`} alt="Current proof" className="w-full h-auto" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a new file to replace this proof
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save E-Wallet Info
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}