"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toPersianNumber } from "@/lib/utils";
import type { Kiln } from "@/types";

interface KilnStatusGridProps {
  kilns: Kiln[];
}

export function KilnStatusGrid({ kilns }: KilnStatusGridProps) {
  const totalUnits = 30;
  const cells = Array.from({ length: totalUnits }, (_, i) => {
    const kiln = kilns.find((k) => k.number === i + 1);
    return kiln || null;
  });

  const occupied = kilns.filter(
    (k) => k.status === "ACTIVE" || k.status === "MAINTENANCE"
  ).length;
  const available = totalUnits - occupied;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">وضعیت کوره‌ها</CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500 inline-block" />
            آماده: {toPersianNumber(available)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" />
            پر: {toPersianNumber(occupied)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2" dir="ltr">
          {cells.map((kiln, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-sm font-medium border",
                !kiln
                  ? "bg-green-100 border-green-300 text-green-700"
                  : kiln.status === "ACTIVE"
                  ? "bg-red-100 border-red-300 text-red-700"
                  : kiln.status === "MAINTENANCE"
                  ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                  : "bg-green-100 border-green-300 text-green-700"
              )}
              title={
                kiln
                  ? `کوره ${kiln.number} - ${kiln.current_process_info || ""}`
                  : `کوره ${index + 1} - خالی`
              }
            >
              {index + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
