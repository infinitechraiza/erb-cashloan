'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  calculateMonthlyPayment,
  calculateLoanSummary,
  calculateEarlyPayoff,
  formatCurrency,
  formatPercentage,
} from '@/lib/loan-calculations';
import { TrendingDown } from 'lucide-react';

interface LoanCalculatorProps {
  initialPrincipal?: number;
  initialRate?: number;
  initialTerm?: number;
}

export function LoanCalculator({
  initialPrincipal = 50000,
  initialRate = 5,
  initialTerm = 60,
}: LoanCalculatorProps) {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [rate, setRate] = useState(initialRate);
  const [term, setTerm] = useState(initialTerm);
  const [extraPayment, setExtraPayment] = useState(0);

  const summary = useMemo(() => {
    return calculateLoanSummary({
      principal,
      annualInterestRate: rate,
      loanTermMonths: term,
    });
  }, [principal, rate, term]);

  const earlyPayoffData = useMemo(() => {
    if (extraPayment <= 0) return null;
    return calculateEarlyPayoff(
      {
        principal,
        annualInterestRate: rate,
        loanTermMonths: term,
      },
      extraPayment
    );
  }, [principal, rate, term, extraPayment]);

  const monthlyPayment = useMemo(() => {
    return calculateMonthlyPayment({
      principal,
      annualInterestRate: rate,
      loanTermMonths: term,
    });
  }, [principal, rate, term]);

  const payoffMonths = Math.round(term);
  const payoffYears = Math.round(term / 12 * 10) / 10;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Loan Calculator</h3>

        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inputs">Calculator</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-6 pt-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Loan Amount</label>
                <span className="text-2xl font-bold text-primary">{formatCurrency(principal)}</span>
              </div>
              <Slider
                value={[principal]}
                onValueChange={(value) => setPrincipal(value[0])}
                min={1000}
                max={1000000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$1K</span>
                <span>$1M</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Interest Rate</label>
                <span className="text-2xl font-bold text-primary">{formatPercentage(rate)}</span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={(value) => setRate(value[0])}
                min={0}
                max={20}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Loan Term</label>
                <span className="text-2xl font-bold text-primary">{payoffMonths} months</span>
              </div>
              <Slider
                value={[term]}
                onValueChange={(value) => setTerm(value[0])}
                min={3}
                max={360}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>3 months</span>
                <span>30 years</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Extra Monthly Payment (Optional)</label>
                <Input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  See how extra payments accelerate payoff
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(monthlyPayment)}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Loan Term</p>
                <p className="text-2xl font-bold mt-1">{payoffYears} years</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-2xl font-bold mt-1 text-destructive">
                  {formatCurrency(summary.totalInterest)}
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Payment</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalPayment)}</p>
              </div>
            </div>

            {earlyPayoffData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Early Payoff Impact</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-green-700">Time Saved</p>
                    <p className="text-lg font-bold text-green-900">
                      {Math.round((term - earlyPayoffData.months) / 12)} years
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Interest Saved</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(earlyPayoffData.interestSaved)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Total Cost</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(earlyPayoffData.newTotalCost)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
