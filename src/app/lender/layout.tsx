"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-context";

interface LenderLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LenderLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user === undefined) return; // still loading user info

    if (!user || !authenticated) {
      router.push("/login"); // not authenticated
    } else if (user.role !== "lender") {
      router.push("/login"); // authenticated but not lender
    } else {
      // Authenticated lender
      if (pathname === "/lender") {
        router.replace("/lender/dashboard"); // redirect /lender → /lender/dashboard
      }
      setTimeout(() => setIsReady(true), 0); // allow layout to render
    }
  }, [user, authenticated, router, pathname]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
