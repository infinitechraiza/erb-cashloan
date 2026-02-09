'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  Calendar,
  FileText,
  User,
  Briefcase,
  TrendingUp,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoanDetailsModalProps {
  loanId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface LoanDocument {
  id: number;
  document_type: string;
  file_path: string;
  file_name?: string;
  uploaded_at?: string;
  created_at?: string;
}

interface Loan {
  id: number;
  type: string;
  principal_amount: string | number;
  approved_amount: string | number | null;
  interest_rate: string | number;
  term_months: number;
  status: string;
  purpose: string;
  employment_status: string | null;
  monthly_income: string | number | null;
  created_at: string;
  updated_at: string;
  borrower?: {
    id: number;
    name: string;
    email: string;
  };
  lender?: {
    id: number;
    name: string;
    email: string;
  } | null;
  loan_officer?: {
    id: number;
    name: string;
    email: string;
  } | null;
  documents?: LoanDocument[];
}

export function LoanDetailsModal({ loanId, isOpen, onClose }: LoanDetailsModalProps) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadingDoc, setDownloadingDoc] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && loanId) {
      fetchLoanDetails();
    }
  }, [isOpen, loanId]);

  const fetchLoanDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      console.log(`[LoanDetailsModal] Fetching loan ${loanId}...`);
      
      const response = await fetch(`/api/loans/${loanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`[LoanDetailsModal] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch loan details');
      }

      const data = await response.json();
      console.log('[LoanDetailsModal] Loan data:', data);
      
      setLoan(data.loan || data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load loan details';
      console.error('[LoanDetailsModal] Error:', errorMsg);
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (doc: LoanDocument) => {
    setDownloadingDoc(doc.id);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/loans/${loanId}/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || `document_${doc.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to download document';
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setDownloadingDoc(null);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      defaulted: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLoanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      personal: 'Personal Loan',
      auto: 'Auto Loan',
      home: 'Home Loan',
      business: 'Business Loan',
      student: 'Student Loan',
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined || amount === '') {
      return '₱0.00';
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
      return '₱0.00';
    }
    
    return `₱${numAmount.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return 'Invalid Date';
    }
  };

  const calculateMonthlyPayment = () => {
    if (!loan) return 0;
    
    const principal = typeof loan.approved_amount === 'string' 
      ? parseFloat(loan.approved_amount) 
      : (loan.approved_amount || (typeof loan.principal_amount === 'string' 
          ? parseFloat(loan.principal_amount) 
          : loan.principal_amount));
    
    const rate = typeof loan.interest_rate === 'string' 
      ? parseFloat(loan.interest_rate) 
      : loan.interest_rate;
    
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = loan.term_months;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Loan Details</DialogTitle>
          <DialogDescription>
            Complete information about this loan application
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
          </div>
        ) : error ? (
          <Card className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1">Loan ID: {loanId}</p>
              </div>
            </div>
          </Card>
        ) : loan ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{getLoanTypeLabel(loan.type)}</h3>
                <p className="text-sm text-muted-foreground">Loan ID: #{loan.id}</p>
              </div>
              <Badge className={getStatusColor(loan.status)}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </Badge>
            </div>

            <Separator />

            {/* Loan Amount Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-[#1e3a8a]" />
                  <span className="text-sm font-medium text-muted-foreground">Principal Amount</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(loan.principal_amount)}</p>
              </Card>

              {loan.approved_amount && (
                <Card className="p-4 bg-green-50">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Approved Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(loan.approved_amount)}</p>
                </Card>
              )}

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-[#1e3a8a]" />
                  <span className="text-sm font-medium text-muted-foreground">Interest Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {typeof loan.interest_rate === 'string' 
                    ? parseFloat(loan.interest_rate).toFixed(2) 
                    : loan.interest_rate.toFixed(2)}%
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-[#1e3a8a]" />
                  <span className="text-sm font-medium text-muted-foreground">Loan Term</span>
                </div>
                <p className="text-2xl font-bold">{loan.term_months} months</p>
              </Card>
            </div>

            {/* Monthly Payment */}
            {(loan.status === 'approved' || loan.status === 'active') && (
              <Card className="p-4 bg-blue-50">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Estimated Monthly Payment</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(calculateMonthlyPayment())}
                </p>
              </Card>
            )}

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">Loan Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                    <p className="text-sm mt-1">{loan.purpose}</p>
                  </div>
                </div>

                {loan.employment_status && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employment Status</p>
                      <p className="text-sm mt-1 capitalize">{loan.employment_status}</p>
                    </div>
                  </div>
                )}

                {loan.monthly_income && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                      <p className="text-sm mt-1">{formatCurrency(loan.monthly_income)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                    <p className="text-sm mt-1">{formatDate(loan.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* People Involved */}
            {(loan.borrower || loan.lender || loan.loan_officer) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">People Involved</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loan.borrower && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Borrower</p>
                          <p className="text-sm mt-1 font-medium">{loan.borrower.name}</p>
                          <p className="text-xs text-muted-foreground">{loan.borrower.email}</p>
                        </div>
                      </div>
                    )}

                    {loan.lender && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Lender</p>
                          <p className="text-sm mt-1 font-medium">{loan.lender.name}</p>
                          <p className="text-xs text-muted-foreground">{loan.lender.email}</p>
                        </div>
                      </div>
                    )}

                    {loan.loan_officer && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Loan Officer</p>
                          <p className="text-sm mt-1 font-medium">{loan.loan_officer.name}</p>
                          <p className="text-xs text-muted-foreground">{loan.loan_officer.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Documents */}
            {loan.documents && loan.documents.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">Documents ({loan.documents.length})</h4>
                  
                  <div className="space-y-2">
                    {loan.documents.map((doc) => (
                      <Card key={doc.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {doc.document_type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {formatDate(doc.uploaded_at || doc.created_at)}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadDocument(doc)}
                            disabled={downloadingDoc === doc.id}
                          >
                            {downloadingDoc === doc.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            Download
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}