"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  Factory,
  ArrowUpFromLine,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Wallet,
  HandCoins,
  Banknote,
  FileText,
  Receipt,
  ArrowDownCircle,
  CreditCard,
  Warehouse,
  Users,
  PackageCheck,
  BarChart3,
  FileBarChart,
  UserSquare,
  AlertTriangle,
  Settings,
  UsersRound,
  UserCog,
  Percent,
  Cog,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Rice,
} from "@/lib/icons";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  ArrowDownToLine: <ArrowDownToLine className="h-5 w-5" />,
  Factory: <Factory className="h-5 w-5" />,
  ArrowUpFromLine: <ArrowUpFromLine className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  ShoppingCart: <ShoppingCart className="h-5 w-5" />,
  ShoppingBag: <ShoppingBag className="h-5 w-5" />,
  Wallet: <Wallet className="h-5 w-5" />,
  HandCoins: <HandCoins className="h-5 w-5" />,
  Banknote: <Banknote className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Receipt: <Receipt className="h-5 w-5" />,
  ArrowDownCircle: <ArrowDownCircle className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  Warehouse: <Warehouse className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  PackageCheck: <PackageCheck className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  FileBarChart: <FileBarChart className="h-5 w-5" />,
  UserSquare: <UserSquare className="h-5 w-5" />,
  AlertTriangle: <AlertTriangle className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  UsersRound: <UsersRound className="h-5 w-5" />,
  UserCog: <UserCog className="h-5 w-5" />,
  Percent: <Percent className="h-5 w-5" />,
  Cog: <Cog className="h-5 w-5" />,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const groups: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) => pathname.startsWith(child.href));
        if (isActive) groups[item.title] = true;
      }
    });
    return groups;
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-64 border-l bg-card flex flex-col">
      <div className="flex items-center gap-3 px-6 h-16 border-b">
        <div className="rounded-full bg-primary/10 p-2">
          <Rice className="h-6 w-6 text-primary" />
        </div>
        <span className="text-xl font-bold text-primary">شالی‌کوبی</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const isExpanded = expandedGroups[item.title];
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleGroup(item.title)}
                  className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center gap-3">
                    {iconMap[item.icon]}
                    <span>{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="mr-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive(child.href) && "bg-primary/10 text-primary"
                        )}
                      >
                        {iconMap[child.icon]}
                        <span>{child.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(item.href) && "bg-primary/10 text-primary"
              )}
            >
              {iconMap[item.icon]}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full bg-primary/10 w-9 h-9 flex items-center justify-center text-primary font-bold text-sm">
            {user?.first_name?.[0] || user?.username?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.username}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 ml-2" />
          خروج
        </Button>
      </div>
    </aside>
  );
}
