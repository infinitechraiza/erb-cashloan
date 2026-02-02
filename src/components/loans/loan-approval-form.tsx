'use client';

import React from "react";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';


interface Loan {
  id: number;
  principal_amount: string;
  interest_rate: string;
  term_months: number;
}

interface LoanApprovalFormProps {
  loan: Loan;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LoanApprovalForm({ loan, onSuccess, onCancel }: LoanApprovalFormProps) {
  const [approvedAmount, setApprovedAmount] = useState(loan.principal_amount);
  const [interestRate, setInterestRate] = useState(loan.interest_rate);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const monthlyPayment = approvedAmount && interestRate && loan.term_months
    ? ((parseFloat(approvedAmount) / loan.term_months) * (1 + (parseFloat(interestRate) / 100 / 12))).toFixed(2)
    : '0';

  const totalInterest = approvedAmount && interestRate && loan.term_months
    ? (parseFloat(approvedAmount) * (parseFloat(interestRate) / 100) * (loan.term_months / 12)).toFixed(2)
    : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/loans/${loan.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved_amount: parseFloat(approvedAmount),
          interest_rate: parseFloat(interestRate),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve loan');
      }

      await response.json();

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Approve Loan Application</h2>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Requested Amount</label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-lg font-semibold">${parseFloat(loan.principal_amount).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Approved Amount</label>
            <Input
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              min="0"
              step="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Rate</label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-lg font-semibold">{loan.interest_rate}%</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Approved Interest Rate (%)</label>
            <Input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Payment</p>
            <p className="text-2xl font-bold text-foreground">${monthlyPayment}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Interest</p>
            <p className="text-2xl font-bold text-foreground">${totalInterest}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
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
            disabled={loading}
            className="gap-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Approving...' : 'Approve Loan'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
