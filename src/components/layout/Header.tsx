"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayPersian } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, LogOut, User } from "lucide-react";

function getPageTitle(pathname: string): string {
  for (const item of NAV_ITEMS) {
    if (item.href === pathname) return item.title;
    if (item.children) {
      for (const child of item.children) {
        if (pathname === child.href || pathname.startsWith(child.href)) {
          return child.title;
        }
      }
    }
  }
  return "داشبورد";
}

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const pageTitle = getPageTitle(pathname);
  const todayPersian = getTodayPersian();

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{todayPersian}</span>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user?.first_name?.[0] || user?.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {user?.first_name} {user?.last_name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="font-normal">
                <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-muted-foreground">{user?.username}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 ml-2" />
              پروفایل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4 ml-2" />
              خروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
