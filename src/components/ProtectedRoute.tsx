
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no session, redirect to login
    if (!isLoading && !session) {
      console.log('No session found, redirecting to login...');
      router.replace('/login'); // Use replace to avoid adding login to history stack
    }
  }, [session, isLoading, router]);

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Carregando...</div> {/* Replace with a proper spinner/skeleton component later */}
      </div>
    );
  }

  // If session exists, render the children (the protected page content)
  if (session) {
    return <>{children}</>;
  }

  // If no session and not loading (should have been redirected, but as a fallback)
  // This state should ideally not be reached due to the redirect in useEffect
  return null;
};

export default ProtectedRoute;

