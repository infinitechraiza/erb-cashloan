'use client';

import React from "react";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';


interface PaymentFormProps {
  loanId: number;
  paymentAmount: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ loanId, paymentAmount, onSuccess, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          loan_id: loanId,
          payment_method: paymentMethod,
          transaction_id: transactionId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record payment');
      }

      await response.json();

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center border-green-200 bg-green-50">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Recorded</h3>
        <p className="text-green-700 mb-4">
          Payment of ${parseFloat(paymentAmount).toLocaleString()} has been successfully recorded.
        </p>
        <p className="text-sm text-green-600">Redirecting...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Make a Payment</h2>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Payment Amount</p>
          <p className="text-3xl font-bold text-foreground">
            ${parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="check">Check</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Transaction ID (Optional)</label>
          <Input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g., TXN123456789"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !paymentMethod}
            className="gap-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Processing...' : 'Complete Payment'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
