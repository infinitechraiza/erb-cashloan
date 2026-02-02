'use client';

import React from "react"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, XCircle } from 'lucide-react';

interface LoanRejectionFormProps {
  loanId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LoanRejectionForm({ loanId, onSuccess, onCancel }: LoanRejectionFormProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/loans/${loanId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject loan');
      }

      await response.json();

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-destructive/50 bg-destructive/5">
      <h2 className="text-xl font-semibold text-destructive mb-6">Reject Loan Application</h2>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Reason for Rejection</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this loan application is being rejected..."
            className="min-h-32"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            This reason will be sent to the applicant
          </p>
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
            variant="destructive"
            disabled={loading}
            className="gap-1"
          >
            <XCircle className="h-4 w-4" />
            {loading ? 'Rejecting...' : 'Reject Loan'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
