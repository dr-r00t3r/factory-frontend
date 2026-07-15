"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function LoginRoute() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </QueryClientProvider>
  );
}
