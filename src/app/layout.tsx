import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "شالی‌کوبی - سامانه مدیریت کارخانه",
  description: "سامانه مدیریت و نظارت بر کارخانه شالی‌کوبی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
