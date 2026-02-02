'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateAmortizationSchedule, formatCurrency } from '@/lib/loan-calculations';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';

interface AmortizationScheduleProps {
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate?: Date;
  paidUpToMonth?: number;
}

export function AmortizationSchedule({
  principalAmount,
  interestRate,
  termMonths,
  startDate = new Date(),
  paidUpToMonth = 0,
}: AmortizationScheduleProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);

  const schedule = useMemo(
    () =>
      generateAmortizationSchedule(
        { principal: principalAmount, annualInterestRate: interestRate, loanTermMonths: termMonths },
        startDate
      ),
    [principalAmount, interestRate, termMonths, startDate]
  );

  const displayedPayments = expanded ? schedule : schedule.slice(0, 5);

  const totalPrincipalPaid = schedule
    .slice(0, paidUpToMonth)
    .reduce((sum, payment) => sum + payment.principalPayment, 0);

  const totalInterestPaid = schedule
    .slice(0, paidUpToMonth)
    .reduce((sum, payment) => sum + payment.interestPayment, 0);

  const handleDownloadCSV = () => {
    const headers = ['Month', 'Due Date', 'Principal', 'Interest', 'Total Payment', 'Remaining Balance'];
    const rows = schedule.map((payment) => [
      payment.month,
      payment.dueDate.toISOString().split('T')[0],
      payment.principalPayment.toFixed(2),
      payment.interestPayment.toFixed(2),
      payment.totalPayment.toFixed(2),
      payment.remainingBalance.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'amortization-schedule.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Amortization Schedule</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCSV}
          className="gap-1 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {paidUpToMonth > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Payments Made</p>
              <p className="text-lg font-semibold text-green-700">{paidUpToMonth}/{termMonths}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Principal Paid</p>
              <p className="text-lg font-semibold">{formatCurrency(totalPrincipalPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Paid</p>
              <p className="text-lg font-semibold">{formatCurrency(totalInterestPaid)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Month</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Principal</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead className="text-right">Total Payment</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPayments.map((payment) => (
              <TableRow
                key={payment.month}
                className={`cursor-pointer hover:bg-muted/50 ${
                  payment.month <= paidUpToMonth ? 'bg-green-50' : ''
                }`}
                onClick={() =>
                  setSelectedPayment(
                    selectedPayment === payment.month ? null : payment.month
                  )
                }
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {payment.month <= paidUpToMonth && <Badge className="bg-green-600">Paid</Badge>}
                    #{payment.month}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {payment.dueDate.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(payment.principalPayment)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(payment.interestPayment)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.totalPayment)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(payment.remainingBalance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {schedule.length > 5 && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className="gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All {schedule.length} Payments
              </>
            )}
          </Button>
        </div>
      )}

      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment #{selectedPayment} Details</DialogTitle>
            </DialogHeader>
            {(() => {
              const payment = schedule.find((p) => p.month === selectedPayment);
              if (!payment) return null;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-semibold">{payment.dueDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={selectedPayment <= paidUpToMonth ? 'bg-green-600' : 'bg-yellow-600'}>
                        {selectedPayment <= paidUpToMonth ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal Payment</span>
                      <span className="font-semibold">{formatCurrency(payment.principalPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Payment</span>
                      <span className="font-semibold">{formatCurrency(payment.interestPayment)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                      <span>Total Payment</span>
                      <span>{formatCurrency(payment.totalPayment)}</span>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Remaining Balance After Payment</p>
                    <p className="text-2xl font-bold">{formatCurrency(payment.remainingBalance)}</p>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
