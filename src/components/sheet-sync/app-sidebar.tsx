
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SidebarHeader } from '../ui/sidebar';
import { Button } from '../ui/button';

const AppSidebar = () => {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between">
            <Logo />
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <Menu />
              <span className="sr-only">Toggle Menu</span>
            </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip={{children: "Dashboard", side: "right", align: "center"}}
            >
              <a href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/inventory"}
              tooltip={{children: "Inventory", side: "right", align: "center"}}
            >
              <a href="/inventory">
                <Package />
                <span>Inventory</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Log Out", side: "right", align: "center"}}>
                    <LogOut />
                    <span>Log Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  );
};

export default AppSidebar;
