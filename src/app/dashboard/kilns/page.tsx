"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useKilns } from "@/hooks";
import { toPersianNumber, formatPersianDateTime } from "@/lib/utils";
import type { Kiln } from "@/types";

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "فعال", color: "bg-red-500" },
  INACTIVE: { label: "آزاد", color: "bg-green-500" },
  MAINTENANCE: { label: "تعمیرات", color: "bg-yellow-500" },
};

function KilnCell({ kiln }: { kiln: Kiln }) {
  const config = statusConfig[kiln.status] || { label: kiln.status, color: "bg-gray-500" };
  return (
    <div
      className={`${config.color} rounded-lg p-3 text-white text-center min-h-[80px] flex flex-col items-center justify-center transition-all hover:scale-105 cursor-default`}
    >
      <span className="text-lg font-bold">{toPersianNumber(kiln.number)}</span>
      <span className="text-xs mt-1">{config.label}</span>
      {kiln.temperature && (
        <span className="text-xs mt-0.5">{toPersianNumber(kiln.temperature)}°C</span>
      )}
    </div>
  );
}

export default function KilnsPage() {
  const { data: kilns, isLoading } = useKilns();

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  const activeCount = kilns?.filter((k) => k.status === "ACTIVE").length || 0;
  const inactiveCount = kilns?.filter((k) => k.status === "INACTIVE").length || 0;
  const maintenanceCount = kilns?.filter((k) => k.status === "MAINTENANCE").length || 0;

  return (
    <PageShell
      title="وضعیت فرها"
      description="نمایش لحظه‌ای وضعیت فرهای کارخانه"
    >
      <div className="flex gap-4 flex-wrap">
        <Badge variant="destructive" className="text-sm px-3 py-1">
          فعال: {toPersianNumber(activeCount)}
        </Badge>
        <Badge variant="success" className="text-sm px-3 py-1">
          آزاد: {toPersianNumber(inactiveCount)}
        </Badge>
        <Badge variant="warning" className="text-sm px-3 py-1">
          تعمیرات: {toPersianNumber(maintenanceCount)}
        </Badge>
      </div>

      {kilns && kilns.length > 0 ? (
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {kilns.map((kiln) => (
            <KilnCell key={kiln.id} kiln={kiln} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            اطلاعاتی برای نمایش وجود ندارد
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">جزئیات فرها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-3">شماره</th>
                  <th className="text-right py-2 px-3">وضعیت</th>
                  <th className="text-right py-2 px-3">دما</th>
                  <th className="text-right py-2 px-3">فرآیند جاری</th>
                  <th className="text-right py-2 px-3">آخرین به‌روزرسانی</th>
                </tr>
              </thead>
              <tbody>
                {kilns?.map((kiln) => (
                  <tr key={kiln.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3">{toPersianNumber(kiln.number)}</td>
                    <td className="py-2 px-3">
                      <Badge variant={
                        kiln.status === "ACTIVE" ? "destructive" :
                        kiln.status === "INACTIVE" ? "success" : "warning"
                      }>
                        {statusConfig[kiln.status]?.label}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">{kiln.temperature ? `${toPersianNumber(kiln.temperature)}°C` : "-"}</td>
                    <td className="py-2 px-3">{kiln.current_process_info || "-"}</td>
                    <td className="py-2 px-3">{formatPersianDateTime(kiln.last_updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
