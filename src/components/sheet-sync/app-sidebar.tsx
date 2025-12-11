
"use client";

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, PanelLeft } from 'lucide-react';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SidebarHeader, SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';

const AppSidebar = () => {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between">
            <Logo />
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <PanelLeft />
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
    </>
  );
};

export default AppSidebar;
