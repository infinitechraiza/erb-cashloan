'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Users,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hasAnyRole } = useAuth();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'borrower', 'lender', 'loan_officer'] },
    { label: 'Loans', href: '/loans', icon: FileText, roles: ['admin', 'borrower', 'lender', 'loan_officer'] },
    { label: 'Payments', href: '/payments', icon: CreditCard, roles: ['borrower'] },
    { label: 'Applications', href: '/applications', icon: FileText, roles: ['loan_officer'] },
    { label: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'lender', 'loan_officer'] },
    { label: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'borrower', 'lender', 'loan_officer'] },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="w-64 border-r border-border bg-card h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">LoanHub</h1>
        <p className="text-sm text-muted-foreground mt-1">Loan Management System</p>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {menuItems
          .filter((item) => hasAnyRole(item.roles))
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary'
                )}
                onClick={() => router.push(item.href)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-muted/30">
        <div className="mb-4 p-3 rounded-md bg-background">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="text-sm font-medium">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
