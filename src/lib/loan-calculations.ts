/**
 * Loan Calculation Utilities
 * Provides comprehensive loan calculations including amortization schedules
 */

export interface LoanCalculationInput {
  principal: number;
  annualInterestRate: number;
  loanTermMonths: number;
}

export interface MonthlyPayment {
  month: number;
  dueDate: Date;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface LoanSummary {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveInterestRate: number;
}

/**
 * Calculate monthly payment using standard amortization formula
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * - M = Monthly payment
 * - P = Principal loan amount
 * - r = Monthly interest rate (annual rate / 12 / 100)
 * - n = Total number of payments
 */
export function calculateMonthlyPayment(input: LoanCalculationInput): number {
  const { principal, annualInterestRate, loanTermMonths } = input;

  // Handle 0% interest rate case
  if (annualInterestRate === 0) {
    return principal / loanTermMonths;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numPayments = loanTermMonths;

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return monthlyPayment;
}

/**
 * Generate amortization schedule for a loan
 */
export function generateAmortizationSchedule(
  input: LoanCalculationInput,
  startDate: Date = new Date()
): MonthlyPayment[] {
  const { principal, annualInterestRate, loanTermMonths } = input;
  const monthlyPayment = calculateMonthlyPayment(input);
  const monthlyRate = annualInterestRate / 100 / 12;

  const schedule: MonthlyPayment[] = [];
  let remainingBalance = principal;
  let currentDate = new Date(startDate);

  for (let month = 1; month <= loanTermMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    // Adjust last payment to account for rounding
    if (month === loanTermMonths) {
      principalPayment = remainingBalance;
    }

    remainingBalance -= principalPayment;

    // Move to next month
    currentDate = new Date(currentDate);
    currentDate.setMonth(currentDate.getMonth() + 1);

    schedule.push({
      month,
      dueDate: new Date(currentDate),
      principalPayment: Math.max(0, principalPayment),
      interestPayment,
      totalPayment: principalPayment + interestPayment,
      remainingBalance: Math.max(0, remainingBalance),
    });
  }

  return schedule;
}

/**
 * Calculate loan summary statistics
 */
export function calculateLoanSummary(input: LoanCalculationInput): LoanSummary {
  const { principal, annualInterestRate, loanTermMonths } = input;
  const monthlyPayment = calculateMonthlyPayment(input);
  const totalPayment = monthlyPayment * loanTermMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    effectiveInterestRate: annualInterestRate,
  };
}

/**
 * Calculate remaining balance at a specific point in the loan
 */
export function calculateRemainingBalance(
  input: LoanCalculationInput,
  paymentsCompleted: number
): number {
  const schedule = generateAmortizationSchedule(input);
  if (paymentsCompleted >= schedule.length) {
    return 0;
  }
  return schedule[paymentsCompleted]?.remainingBalance || 0;
}

/**
 * Calculate how much goes to principal vs interest in a payment
 */
export function getPaymentBreakdown(
  input: LoanCalculationInput,
  paymentNumber: number
): { principal: number; interest: number } {
  const schedule = generateAmortizationSchedule(input);
  if (paymentNumber < 1 || paymentNumber > schedule.length) {
    return { principal: 0, interest: 0 };
  }

  const payment = schedule[paymentNumber - 1];
  return {
    principal: payment.principalPayment,
    interest: payment.interestPayment,
  };
}

/**
 * Calculate payoff date based on payment schedule
 */
export function calculatePayoffDate(
  input: LoanCalculationInput,
  startDate: Date = new Date()
): Date {
  const schedule = generateAmortizationSchedule(input, startDate);
  return schedule[schedule.length - 1]?.dueDate || startDate;
}

/**
 * Calculate early payoff scenario
 */
export function calculateEarlyPayoff(
  input: LoanCalculationInput,
  extraMonthlyPayment: number,
  startDate: Date = new Date()
): { months: number; interestSaved: number; newTotalCost: number } {
  const { principal, annualInterestRate } = input;
  const monthlyRate = annualInterestRate / 100 / 12;
  const baseMonthlyPayment = calculateMonthlyPayment(input);
  const totalMonthlyPayment = baseMonthlyPayment + extraMonthlyPayment;

  let balance = principal;
  let month = 0;
  let totalInterestPaid = 0;

  while (balance > 0 && month < 600) {
    // Safety limit of 50 years
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(balance, totalMonthlyPayment - interestPayment);

    balance -= principalPayment;
    totalInterestPaid += interestPayment;
    month++;
  }

  const standardSummary = calculateLoanSummary(input);
  const interestSaved = standardSummary.totalInterest - totalInterestPaid;

  return {
    months: month,
    interestSaved: Math.round(interestSaved * 100) / 100,
    newTotalCost: Math.round((principal + totalInterestPaid) * 100) / 100,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value).toFixed(decimals)}%`;
}
