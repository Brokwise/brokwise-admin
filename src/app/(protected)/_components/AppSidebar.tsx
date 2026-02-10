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
  CircleDollarSign,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "next-themes";
import { usePendingItems, PendingItems } from "@/hooks/usePendingItems";
import {
  hasAnyPermission,
  hasPermission,
  normalizeUserType,
} from "@/lib/permissions";

const STORAGE_KEY = "brokwise_admin_seen_counts";

const AppSidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const rawUserType = useAuthStore((state) => state.userType);
  const permissions = useAuthStore((state) => state.permissions);
  const userType = normalizeUserType(rawUserType);

  const { theme, setTheme } = useTheme();
  const { pendingItems } = usePendingItems();

  const canSeeBrokers = hasPermission(userType, permissions, "broker:read");
  const canSeeCompanies = hasPermission(userType, permissions, "company:read");
  const canSeeProperties = hasPermission(
    userType,
    permissions,
    "property:read"
  );
  const canSeeEnquiries = hasPermission(userType, permissions, "enquiry:read");
  const canSeeMessages = hasAnyPermission(userType, permissions, [
    "message:read",
    "message:interact",
  ]);
  const isAdmin = userType === "admin";

  const [seenCounts, setSeenCounts] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSeenCounts(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse seen counts from local storage", error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seenCounts));
    }
  }, [seenCounts, isLoaded]);

  useEffect(() => {
    if (pendingItems && isLoaded) {
      setSeenCounts((prev) => {
        const next = { ...prev };
        let hasChanges = false;

        (Object.keys(pendingItems) as Array<keyof PendingItems>).forEach(
          (key) => {
            const current = pendingItems[key] || 0;
            const seen = next[key] || 0;
            if (current < seen) {
              next[key] = current;
              hasChanges = true;
            }
          }
        );

        return hasChanges ? next : prev;
      });
    }
  }, [pendingItems, isLoaded]);

  const handleItemClick = (key: keyof PendingItems) => {
    if (pendingItems) {
      setSeenCounts((prev) => ({
        ...prev,
        [key]: pendingItems[key] || 0,
      }));
    }
  };

  const getBadgeCount = (key: keyof PendingItems) => {
    if (!pendingItems) return 0;
    const current = pendingItems[key] || 0;
    const seen = seenCounts[key] || 0;
    return Math.max(0, current - seen);
  };

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
          {canSeeBrokers && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Brokers">
                <Link href="/brokers" onClick={() => handleItemClick("brokers")}>
                  <Users />
                  <span>Brokers</span>
                </Link>
              </SidebarMenuButton>
              {getBadgeCount("brokers") > 0 && (
                <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                  {getBadgeCount("brokers")}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )}
          {canSeeCompanies && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Companies">
                <Link
                  href="/companies"
                  onClick={() => handleItemClick("companies")}
                >
                  <Briefcase />
                  <span>Companies</span>
                </Link>
              </SidebarMenuButton>
              {getBadgeCount("companies") > 0 && (
                <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                  {getBadgeCount("companies")}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )}
          {canSeeProperties && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Properties">
                <Link
                  href="/properties"
                  onClick={() => handleItemClick("properties")}
                >
                  <Building2 />
                  <span>Properties</span>
                </Link>
              </SidebarMenuButton>
              {getBadgeCount("properties") > 0 && (
                <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                  {getBadgeCount("properties")}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )}
          {canSeeEnquiries && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Enquiries">
                <Link
                  href="/enquiries"
                  onClick={() => handleItemClick("enquiries")}
                >
                  <MessageCircle />
                  <span>Enquiries</span>
                </Link>
              </SidebarMenuButton>
              {getBadgeCount("enquiries") > 0 && (
                <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                  {getBadgeCount("enquiries")}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Credits">
                <Link href="/packs">
                  <CircleDollarSign />
                  <span>Credit Packs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Managers">
                <Link
                  href="/managers"
                  onClick={() => handleItemClick("managers")}
                >
                  <Users2Icon />
                  <span>Managers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="JDA Forms">
                <Link href="/jda-forms">
                  <File />
                  <span>JDA Forms</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {canSeeMessages && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Messages">
                <Link href="/messages">
                  <MessageCircleMore />
                  <span>Messages</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Developers">
                <Link
                  href="/developers"
                  onClick={() => handleItemClick("developers")}
                >
                  <UserStarIcon />
                  <span>Developers</span>
                </Link>
              </SidebarMenuButton>
              {getBadgeCount("developers") > 0 && (
                <SidebarMenuBadge className="rounded-full bg-red-500 text-white">
                  {getBadgeCount("developers")}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Projects">
                <Link href="/projects">
                  <LandPlotIcon />
                  <span>Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Calendar">
                <Link href="/calendar">
                  <Calendar />
                  <span>Calendar</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
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
