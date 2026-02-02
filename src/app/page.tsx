'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';

export default function HomePage() {
  const [loanAmount, setLoanAmount] = useState(30000);
  const [loanTerm, setLoanTerm] = useState(24);
  const interestRate = 12;
  const processingFeeRate = 0.02; // 2% processing fee
  const processingFee = Math.round(loanAmount * processingFeeRate);

  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
  const disbursedAmount = loanAmount - processingFee;

  function calculateMonthlyPayment(principal: number, rate: number, months: number) {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  const handleAmountChange = (value: number) => {
    const newAmount = Math.max(5000, Math.min(5000000, value));
    setLoanAmount(newAmount);
  };

  const termOptions = [6, 9, 12, 18, 24, 30, 36, 45, 48, 60];

  return (
    <main className="min-h-screen bg-white">
      {/* Calculator Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
            Try our Cash Loan Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Want to check how much your online loan's monthly payments will be? Try our calculator
            to get a sample breakdown!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <Card className="border border-border p-8 rounded-2xl">
            <div className="flex items-start gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                L
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Get a sample cash loan computation
                </h2>
              </div>
            </div>

            {/* Loan Amount Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-foreground mb-3">
                How much money do you need?
              </label>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleAmountChange(loanAmount - 5000)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-secondary text-primary font-bold text-xl"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => handleAmountChange(Number(e.target.value))}
                  className="flex-1 text-center text-lg font-semibold border border-border"
                />
                <button
                  onClick={() => handleAmountChange(loanAmount + 5000)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-secondary text-primary font-bold text-xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Loan amount starts at ₱5,000 up to ₱5,000,000
              </p>

              {/* Slider */}
              <input
                type="range"
                min="5000"
                max="5000000"
                step="1000"
                value={loanAmount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-primary mt-4"
              />
            </div>

            {/* Loan Terms */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-4">
                Sample Loan Terms (months)
              </label>
              <div className="flex flex-wrap gap-2">
                {termOptions.map((term) => (
                  <button
                    key={term}
                    onClick={() => setLoanTerm(term)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      loanTerm === term
                        ? 'bg-primary text-white'
                        : 'border border-border text-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Results Section */}
          <Card className="border-none bg-yellow-50 p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-yellow-200">
                <span className="text-foreground font-medium">Loan Term</span>
                <span className="font-semibold text-foreground">{loanTerm} months</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-yellow-200">
                <span className="text-foreground font-medium">Loan Amount</span>
                <span className="font-semibold text-foreground">₱{loanAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-yellow-200">
                <span className="text-foreground font-medium">Processing Fee (2%)</span>
                <span className="font-semibold text-destructive">-₱{processingFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-yellow-200">
                <span className="text-foreground font-medium">Amount to be Disbursed</span>
                <span className="font-semibold text-foreground">
                  ₱{disbursedAmount.toLocaleString()}
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 mt-8">
                <p className="text-sm text-muted-foreground mb-2">Estimated Monthly Installment</p>
                <p className="text-3xl font-bold text-foreground">
                  ₱{Math.round(monthlyPayment).toLocaleString()} per month
                </p>
              </div>

              <Link href="/dashboard/loans">
                <Button className="w-full bg-primary text-white hover:bg-primary/90 text-lg py-6 rounded-lg font-semibold">
                  Check if you are qualified for a cash loan
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Note: This is a sample computation. Actual amounts and rates may vary based on
                submitted application and information.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">The flexible, quick cash loan for you</h2>
          <p className="text-lg text-white/90 mb-8">Here's why it's worth getting one from us!</p>
          <Link href="/register">
            <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg">
              Apply Now
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}