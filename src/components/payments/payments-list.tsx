'use client';

import React from "react"
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Payment {
  id: number;
  amount: string;
  principal_payment: string;
  interest_payment: string;
  status: string;
  due_date: string;
  paid_date?: string;
  days_overdue: number;
}

const statusIcons: Record<string, React.ReactNode> = {
  paid: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  pending: <Clock className="h-4 w-4 text-yellow-600" />,
  late: <AlertCircle className="h-4 w-4 text-red-600" />,
  missed: <AlertCircle className="h-4 w-4 text-red-700" />,
};

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  late: 'bg-orange-100 text-orange-800',
  missed: 'bg-red-100 text-red-800',
};

export function PaymentsList({ loanId }: { loanId: number }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payments?loan_id=${loanId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const data = await response.json();
        setPayments(data.payments?.data || data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [loanId]);

  if (loading) {
    return <div className="p-6 text-center">Loading payments...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{payment.due_date}</TableCell>
                  <TableCell>${parseFloat(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>${parseFloat(payment.principal_payment).toFixed(2)}</TableCell>
                  <TableCell>${parseFloat(payment.interest_payment).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {statusIcons[payment.status]}
                      <Badge className={statusColors[payment.status] || 'bg-gray-100'}>
                        {payment.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{payment.paid_date || '-'}</TableCell>
                  <TableCell>
                    {payment.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
