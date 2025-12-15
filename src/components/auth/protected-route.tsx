
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/sheet-sync/app-sidebar';
import { InventoryProvider } from '@/context/inventory-context';
import { Header } from '@/components/sheet-sync/header';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <InventoryProvider>
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full">
            <Sidebar collapsible="icon" variant="sidebar" side="left">
              <AppSidebar />
            </Sidebar>
            <SidebarTrigger />
            <SidebarInset>
                <Header />
                <div className='flex flex-1 w-full flex-col'>
                    {children}
                </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
    </InventoryProvider>
  );
}
    
