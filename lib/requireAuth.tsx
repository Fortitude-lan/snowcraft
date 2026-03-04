'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Bounded } from '@/components/Bounded';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/adminlogin');
    }
  }, [token, loading]);

  if (loading || !token) {
    return  <div className="min-h-screen bg-texture bg-brand-gray flex items-center justify-center">
            <Bounded className="text-center">
                Loading...
            </Bounded>
          </div>;
  }

  return <>{children}</>;
}
