"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Payment {
  id: number
  amount: string
  due_date: string
  status: string
  loan?: {
    loan_number: string
    id: number
  }
}

interface PaymentModalProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentModal({ payment, open, onOpenChange, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const resetForm = () => {
    setImageFile(null)
    setError("")
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const formatAmount = (amount?: string | number) => {
    const value = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0)
    return isNaN(value) ? 0 : value.toFixed(2)
  }
  const isFormValid = () => {
    // Ensure payment exists and file is uploaded
    if (!payment) return false
    if (!imageFile) return false
    return true
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!payment) throw new Error("Payment data not found")

      const formData = new FormData()
      formData.append("payment_id", String(payment.id))
      formData.append("amount", String(formatAmount(payment.amount)))
      formData.append("payment_method", "ewallet")
      if (imageFile) formData.append("proof_of_payment", imageFile)
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Payment failed")
      }

      setSuccess(true)

      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>Complete your payment for Loan {payment.loan?.loan_number}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">Your payment of ₱{formatAmount(payment.amount)} has been processed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Summary */}
            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Number</span>
                  <span className="font-medium">{payment.loan?.loan_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{new Date(payment.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Amount to Pay</span>
                  <span className="text-green-600">₱{parseFloat(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>E-Wallet Payment Instructions:</strong>
                <br />
                1. Open your GCash or PayMaya app
                <br />
                2. Send ₱{parseFloat(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} to: 0917-123-4567
                <br />
                3. Take a screenshot of the confirmation
                <br />
                4. Click the button below to confirm payment
              </p>
            </Card>
            {/* Upload Image */}
            <div className="space-y-2">
              <Label htmlFor="paymentImage">Upload Payment Proof</Label>
              <Input
                id="paymentImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null

                  if (file) {
                    const maxSizeMB = 10
                    const maxSizeBytes = maxSizeMB * 1024 * 1024

                    if (file.size > maxSizeBytes) {
                      alert(`File size must not exceed ${maxSizeMB}MB`)
                      e.target.value = "" // reset file input
                      setImageFile(null)
                      return
                    }
                  }

                  setImageFile(file)
                }}
              />
            </div>

            {error && (
              <Card className="p-3 border-destructive/30 bg-destructive/5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isFormValid()} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₱${parseFloat(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
