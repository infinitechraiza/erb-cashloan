'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  Eye,
  Calendar,
  User,
  Briefcase,
  Percent,
  Download,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  totalDisbursed: string;
  totalOutstanding: string;
  pendingApplications: number;
  approvedLoans: number;
  completedLoans: number;
  defaultedLoans: number;
}

interface Loan {
  id: number;
  loan_number: string;
  type: string;
  amount: string;
  principal_amount: string;
  interest_rate: string;
  term_months: number;
  total_amount: string;
  outstanding_balance: string;
  status: string;
  purpose: string;
  created_at: string;
  approved_at?: string;
  disbursement_date?: string;
  borrower: {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
  };
  documents?: Array<{
    id: number;
    document_type: string;
    file_name: string;
  }>;
}

interface RecentLoan {
  id: number;
  loan_number: string;
  borrower_name: string;
  amount: string;
  status: string;
  created_at: string;
}

export default function LenderDashboardPage() {
  const router = useRouter();
  const { user, authenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLoans: 0,
    activeLoans: 0,
    totalDisbursed: '0',
    totalOutstanding: '0',
    pendingApplications: 0,
    approvedLoans: 0,
    completedLoans: 0,
    defaultedLoans: 0,
  });
  const [recentLoans, setRecentLoans] = useState<RecentLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loadingLoan, setLoadingLoan] = useState(false);

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push('/');
      return;
    }

    if (authenticated) {
      fetchDashboardData();
    }
  }, [authenticated, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const loansResponse = await fetch('/api/loans', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        const loans = loansData.loans || [];
        
        const calculatedStats = {
          totalLoans: loans.length,
          activeLoans: loans.filter((l: any) => l.status === 'active').length,
          totalDisbursed: loans
            .filter((l: any) => l.status === 'active' || l.status === 'completed')
            .reduce((sum: number, l: any) => sum + parseFloat(l.principal_amount || l.amount || 0), 0)
            .toString(),
          totalOutstanding: loans
            .filter((l: any) => l.status === 'active')
            .reduce((sum: number, l: any) => sum + parseFloat(l.outstanding_balance || l.principal_amount || l.amount || 0), 0)
            .toString(),
          pendingApplications: loans.filter((l: any) => l.status === 'pending').length,
          approvedLoans: loans.filter((l: any) => l.status === 'approved').length,
          completedLoans: loans.filter((l: any) => l.status === 'completed').length,
          defaultedLoans: loans.filter((l: any) => l.status === 'defaulted').length,
        };
        
        setStats(calculatedStats);
        
        setRecentLoans(loans.slice(0, 5).map((loan: any) => ({
          id: loan.id,
          loan_number: loan.loan_number,
          borrower_name: loan.borrower?.name || `${loan.borrower?.first_name} ${loan.borrower?.last_name}`.trim(),
          amount: loan.amount || loan.principal_amount || '0',
          status: loan.status,
          created_at: loan.created_at,
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanDetails = async (loanId: number) => {
    setLoadingLoan(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/loans/${loanId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loan details');
      }

      const data = await response.json();
      setSelectedLoan(data.loan);
      setShowLoanModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load loan details');
    } finally {
      setLoadingLoan(false);
    }
  };

  const handleViewDetails = (loanId: number) => {
    fetchLoanDetails(loanId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; className?: string }> = {
      pending: { variant: 'default', label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
      approved: { variant: 'secondary', label: 'Approved', className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15' },
      active: { variant: 'default', label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
      completed: { variant: 'default', label: 'Completed', className: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
      rejected: { variant: 'destructive', label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
      defaulted: { variant: 'destructive', label: 'Defaulted', className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
    };

    const config = variants[status] || { variant: 'default', label: status };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome back, {user?.first_name} 👋
                </h1>
                <p className="text-slate-600">
                  Here's an overview of your lending portfolio
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => router.push('/lender/loans')}
                >
                  <FileText className="h-4 w-4" />
                  All Loans
                </Button>
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => router.push('/lender/loans?status=pending')}
                >
                  <Activity className="h-4 w-4" />
                  Review Applications
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-8xl mx-8 md:mx-16 lg:mx-20 xl:mx-24 py-6 xl:py-8 space-y-6">
        {error && (
          <Card className="p-4 mb-6 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Loans Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/90 border-0 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-primary-foreground/80 text-sm font-medium mb-1">Total Loans</p>
              <p className="text-4xl font-bold">{stats.totalLoans}</p>
            </div>
          </Card>

          {/* Active Loans Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Active Loans</p>
              <p className="text-4xl font-bold">{stats.activeLoans}</p>
            </div>
          </Card>

          {/* Total Disbursed Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 border-0 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-slate-200 text-sm font-medium mb-1">Total Disbursed</p>
              <p className="text-2xl font-bold">
                ₱{parseFloat(stats.totalDisbursed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </Card>

          {/* Outstanding Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 border-0 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <AlertCircle className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-amber-100 text-sm font-medium mb-1">Outstanding</p>
              <p className="text-2xl font-bold">
                ₱{parseFloat(stats.totalOutstanding).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </Card>
        </div>

        {/* Status Overview */}
        <Card className="mb-8 shadow-sm border-slate-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Loan Status Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {stats.pendingApplications}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-amber-900">Pending Review</p>
                <p className="text-xs text-amber-700 mt-1">Awaiting approval</p>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {stats.approvedLoans}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-900">Approved</p>
                <p className="text-xs text-slate-600 mt-1">Ready to activate</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    {stats.completedLoans}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-emerald-900">Completed</p>
                <p className="text-xs text-emerald-700 mt-1">Fully paid</p>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    {stats.defaultedLoans}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-red-900">Defaulted</p>
                <p className="text-xs text-red-700 mt-1">Needs attention</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Loans */}
        <Card className="shadow-sm border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
                <p className="text-sm text-slate-600 mt-1">Latest loan applications requiring your attention</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/lender/loans')}
                className="gap-2"
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            {recentLoans.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium mb-1">No recent applications</p>
                <p className="text-sm text-slate-600">New loan applications will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="group p-4 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => handleViewDetails(loan.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-slate-900">{loan.loan_number}</span>
                          {getStatusBadge(loan.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-slate-400" />
                            {loan.borrower_name}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-slate-900">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            ₱{parseFloat(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(loan.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loadingLoan}
                        className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(loan.id);
                        }}
                      >
                        {loadingLoan ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="text-sm text-slate-600 mt-1">Common tasks and shortcuts</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left group"
                onClick={() => router.push('/lender/loans?status=pending')}
              >
                <div className="h-12 w-12 rounded-xl bg-amber-100 group-hover:bg-amber-500 flex items-center justify-center mb-4 transition-colors">
                  <Clock className="h-6 w-6 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Review Pending</h3>
                <p className="text-sm text-slate-600 mb-3">
                  {stats.pendingApplications} application{stats.pendingApplications !== 1 ? 's' : ''} waiting
                </p>
                <div className="flex items-center text-sm font-medium text-amber-600 group-hover:text-amber-700">
                  Review now
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </button>

              <button
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                onClick={() => router.push('/lender/loans?status=approved')}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center mb-4 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Activate Loans</h3>
                <p className="text-sm text-slate-600 mb-3">
                  {stats.approvedLoans} loan{stats.approvedLoans !== 1 ? 's' : ''} ready to activate
                </p>
                <div className="flex items-center text-sm font-medium text-primary group-hover:text-primary">
                  Activate now
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </button>

              <button
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left group"
                onClick={() => router.push('/lender/loans?status=active')}
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-500 flex items-center justify-center mb-4 transition-colors">
                  <FileText className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Active Loans</h3>
                <p className="text-sm text-slate-600 mb-3">
                  {stats.activeLoans} active loan{stats.activeLoans !== 1 ? 's' : ''} to manage
                </p>
                <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                  View loans
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </button>
            </div>
          </div>
        </Card>
      </main>

      {/* Loan Details Modal */}
      <Dialog open={showLoanModal} onOpenChange={setShowLoanModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Loan Application Details</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {selectedLoan?.loan_number}
                </DialogDescription>
              </div>
              {selectedLoan && getStatusBadge(selectedLoan.status)}
            </div>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-6 mt-4">
              {/* Borrower Information */}
              {selectedLoan.borrower && (
                <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    Borrower Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Full Name</p>
                      <p className="font-semibold text-slate-900">
                        {selectedLoan.borrower.name || `${selectedLoan.borrower.first_name} ${selectedLoan.borrower.last_name}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Email Address</p>
                      <p className="font-semibold text-slate-900">{selectedLoan.borrower.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loan Details */}
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  Loan Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <DollarSign className="h-4 w-4" />
                      Principal Amount
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      ₱{parseFloat(selectedLoan.principal_amount || selectedLoan.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <Percent className="h-4 w-4" />
                      Interest Rate
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{selectedLoan.interest_rate}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <Clock className="h-4 w-4" />
                      Loan Term
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{selectedLoan.term_months} mo</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Loan Type</p>
                    <p className="font-semibold text-slate-900 capitalize">{selectedLoan.type.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200 md:col-span-2">
                    <p className="text-sm text-slate-600 mb-2">Purpose</p>
                    <p className="font-semibold text-slate-900">{selectedLoan.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedLoan.documents && selectedLoan.documents.length > 0 && (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-emerald-600" />
                    </div>
                    Submitted Documents
                  </h3>
                  <div className="grid gap-3">
                    {selectedLoan.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{doc.file_name}</p>
                            <p className="text-sm text-slate-600 capitalize">
                              {doc.document_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            window.open(
                              `/api/loans/${selectedLoan.id}/documents/${doc.id}/download`,
                              '_blank'
                            );
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Application Submitted</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {new Date(selectedLoan.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {selectedLoan.approved_at && (
                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Loan Approved</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(selectedLoan.approved_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedLoan.disbursement_date && (
                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
                      <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-slate-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Funds Disbursed</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(selectedLoan.disbursement_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setShowLoanModal(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    router.push(`/lender/loans/${selectedLoan.id}`);
                    setShowLoanModal(false);
                  }}
                >
                  Open Full Details
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}