"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Header />
        <main className="flex-1 p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
