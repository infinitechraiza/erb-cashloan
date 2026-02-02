'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { SidebarNav } from '@/components/sidebar-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';

interface LoanApplication {
  id: number;
  loan_number: string;
  type: string;
  principal_amount: string;
  interest_rate: string;
  status: string;
  submitted_at: string;
  borrower?: { first_name: string; last_name: string };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-blue-100 text-blue-800',
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { authenticated, loading, user } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/loans?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.loans?.data || data.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!authenticated || !['admin', 'loan_officer'].includes(user?.role || '')) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 ml-64 bg-background min-h-screen">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-primary">Loan Applications</h1>
            <p className="text-muted-foreground mt-1">Review and process pending applications</p>
          </div>
        </header>

        <div className="px-8 py-8">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Loan Number</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No pending applications
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{app.loan_number}</TableCell>
                        <TableCell>
                          {app.borrower
                            ? `${app.borrower.first_name} ${app.borrower.last_name}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="capitalize">{app.type}</TableCell>
                        <TableCell>${parseFloat(app.principal_amount).toLocaleString()}</TableCell>
                        <TableCell>{app.interest_rate}%</TableCell>
                        <TableCell>
                          <Badge className={statusColors[app.status] || 'bg-gray-100'}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {selectedApp && (
          <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Application - {selectedApp.loan_number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Type</p>
                    <p className="text-lg font-semibold capitalize">{selectedApp.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedApp.status] || 'bg-gray-100'}>
                      {selectedApp.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Amount</p>
                    <p className="text-lg font-semibold">
                      ${parseFloat(selectedApp.principal_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="text-lg font-semibold">{selectedApp.interest_rate}%</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedApp(null);
                      router.push(`/loans/${selectedApp.id}`);
                    }}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Full Details
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedApp(null);
                      router.push(`/loans/${selectedApp.id}?action=approve`);
                    }}
                    className="gap-1 ml-auto"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedApp(null);
                      router.push(`/loans/${selectedApp.id}?action=reject`);
                    }}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
