"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
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
  MessageCircleMore,
  UserStarIcon,
  LandPlotIcon,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "next-themes";
import { usePendingItems } from "@/hooks/usePendingItems";

const AppSidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();
  const { pendingItems } = usePendingItems();
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
              <Link href="/brokers">
                <Users />
                <span>Brokers</span>
              </Link>
            </SidebarMenuButton>
            {pendingItems?.brokers ? (
              <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                {pendingItems.brokers}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Companies">
              <Link href="/companies">
                <Briefcase />
                <span>Companies</span>
              </Link>
            </SidebarMenuButton>
            {pendingItems?.companies ? (
              <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                {pendingItems.companies}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Properties">
              <Link href="/properties">
                <Building2 />
                <span>Properties</span>
              </Link>
            </SidebarMenuButton>
            {pendingItems?.properties ? (
              <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                {pendingItems.properties}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Enquiries">
              <Link href="/enquiries">
                <MessageCircle />
                <span>Enquiries</span>
              </Link>
            </SidebarMenuButton>
            {pendingItems?.enquiries ? (
              <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                {pendingItems.enquiries}
              </SidebarMenuBadge>
            ) : null}
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
                <MessageCircleMore />
                <span>Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Developers">
              <Link href="/developers">
                <UserStarIcon />
                <span>Developers</span>
              </Link>
            </SidebarMenuButton>
            {pendingItems?.developers ? (
              <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                {pendingItems.developers}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="JDA Forms">
              <Link href="/projects">
                <LandPlotIcon />
                <span>Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Calendar">
              <Link href="/calendar">
                <Calendar />
                <span>Calendar</span>
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
