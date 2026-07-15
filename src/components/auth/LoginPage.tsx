"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Rice } from "@/lib/icons";

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("نام کاربری و رمز عبور را وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      await login({ username, password });
    } catch (err: unknown) {
      const errorObj = err as { persianMessage?: string };
      setError(errorObj.persianMessage || "خطا در ورود به سیستم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Rice className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">شالی‌کوبی</CardTitle>
          <CardDescription>به سامانه مدیریت کارخانه خوش آمدید</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری را وارد کنید"
                autoComplete="username"
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور را وارد کنید"
                autoComplete="current-password"
                dir="ltr"
                className="text-left"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                "ورود به سامانه"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
