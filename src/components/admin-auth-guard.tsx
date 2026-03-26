"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify admin session with server
    const verifySession = async () => {
      try {
        const response = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }

        // Not authenticated - redirect to login
        router.replace("/admin/login");
      } catch (error) {
        console.error('Auth verification error:', error);
        router.replace("/admin/login");
      }
    };

    verifySession();
  }, [router]);

  // Show loading state while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper function to logout
export async function adminLogout() {
  try {
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear any legacy localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminRemember");
  }

  window.location.href = "/admin/login";
}
