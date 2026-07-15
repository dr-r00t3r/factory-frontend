"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { CustomerTypeLabels } from "@/lib/constants";
import { Rice, Package, TrendingUp, Wallet } from "@/lib/icons";
import type { CustomerReport as CustomerReportType, Customer } from "@/types";

interface CustomerReportProps {
  data: CustomerReportType;
  customerName: string;
}

export function CustomerReport({ data, customerName }: CustomerReportProps) {
  const balance = data.balance ?? data.current_balance ?? 0;
  const isPositive = balance >= 0;
  const customer = data.customer as (Customer & { type?: string }) | undefined;
  const customerType = customer?.customer_type ?? customer?.type ?? "FARMER";
  const up = customerType.toUpperCase();
  const isFarmer = up === "FARMER" || up === "کشاورز";
  const typeLabel = isFarmer
    ? CustomerTypeLabels.FARMER
    : up === "TRADER" || up === "تاجر"
      ? CustomerTypeLabels.TRADER
      : customerType;

  const transactions = data.recent_transactions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{customerName}</h2>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline">{typeLabel}</Badge>
          {customer?.phone && (
            <span className="text-sm text-muted-foreground">
              {customer.phone}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<Rice className="h-5 w-5" />}
          label="کل ورودی"
          value={toPersianNumber(data.total_inputs ?? data.total_input_weight) + " کیلو"}
        />
        <StatsCard
          icon={<Package className="h-5 w-5" />}
          label="کل خروجی"
          value={toPersianNumber(data.total_outputs ?? data.total_output_weight) + " کیلو"}
        />
        <StatsCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="پرداخت‌ها"
          value={toPersianCurrency(data.total_payments ?? data.total_paid)}
        />
        <StatsCard
          icon={<Wallet className="h-5 w-5" />}
          label="مانده حساب"
          value={toPersianCurrency(Math.abs(balance))}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">وزن باقی‌مانده</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {toPersianNumber(data.remaining_weight ?? 0)} کیلوگرم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">مانده مالی</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {toPersianCurrency(Math.abs(balance))}
              <span className="text-sm mr-2">
                {isPositive ? "بستانکار" : "بدهکار"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تراکنش‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>توضیحات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge variant="secondary">{tx.type}</Badge>
                    </TableCell>
                    <TableCell>{formatPersianDate(tx.date)}</TableCell>
                    <TableCell>{toPersianCurrency(tx.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.description || "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    تراکنشی یافت نشد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
