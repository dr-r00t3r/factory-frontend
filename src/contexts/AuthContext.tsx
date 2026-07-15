"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { User, LoginRequest } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshToken: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const login = useCallback(
    async (loginData: LoginRequest) => {
      const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      await fetchProfile();
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      logout();
      return;
    }
    try {
      const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh,
      });
      localStorage.setItem("access_token", data.access_token);
      await fetchProfile();
    } catch {
      logout();
    }
  }, [fetchProfile, logout]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
