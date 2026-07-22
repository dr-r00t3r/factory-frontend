"use client";

import React from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, Factory, Rice, Cog } from "@/lib/icons";

const settingsCards = [
  {
    title: "نرخ‌های سالانه",
    description: "تنظیم تعرفه کارمزد و نرخ‌های کشاورزی/تجاری",
    href: "/dashboard/settings/yearly-fees",
    icon: <Percent className="h-5 w-5" />,
  },
  {
    title: "اطلاعات کارخانه",
    description: "نام و سربرگ کارخانه برای گزارش‌ها",
    href: "/dashboard/settings/factory-info",
    icon: <Factory className="h-5 w-5" />,
  },
  {
    title: "انواع برنج",
    description: "مدیریت انواع و اقلام برنج",
    href: "/dashboard/settings/rice-types",
    icon: <Rice className="h-5 w-5" />,
  },
  {
    title: "خطوط فرآیند",
    description: "تعریف خطوط فرآیند تولید (ظرفیت، ساعت کار، درصد پر شدن)",
    href: "/dashboard/settings/process-lines",
    icon: <Cog className="h-5 w-5" />,
  },
];

export default function SettingsIndexPage() {
  return (
    <PageShell title="تنظیمات" description="پیکربندی سیستم">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="p-6 space-y-2">
                <div className="rounded-full bg-primary/10 p-3 text-primary w-fit">
                  {card.icon}
                </div>
                <h3 className="font-bold text-lg">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
