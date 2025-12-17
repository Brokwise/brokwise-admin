"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  HomeIcon,
  LayoutDashboard,
  Users,
  LogOut,
  Building2,
  SunMoon,
  MessageCircle,
  File,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "next-themes";

const AppSidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Brokwise Admin</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home">
              <Link href="/">
                <HomeIcon />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Brokers">
              <Link href="/">
                <Users />
                <span>Brokers</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Companies">
              <Link href="/companies">
                <Briefcase />
                <span>Companies</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Properties">
              <Link href="/properties">
                <Building2 />
                <span>Properties</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Enquiries">
              <Link href="/enquiries">
                <MessageCircle />
                <span>Enquiries</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="JDA Forms">
              <Link href="/jda-forms">
                <File />
                <span>JDA Forms</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="JDA Forms">
              <Link href="/messages">
                <File />
                <span>Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <SunMoon />
              <span>Theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            onClick={() => {
              logout();
            }}
          >
            <SidebarMenuButton tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
