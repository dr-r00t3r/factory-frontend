"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import { useCustomerReport } from "@/hooks";
import { toPersianNumber, toPersianCurrency, formatPersianDate } from "@/lib/utils";
import { Search, User, Package, DollarSign, ArrowUpDown, Database } from "lucide-react";
import type { Customer } from "@/types";

export default function CustomerReportPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { data: report, isLoading } = useCustomerReport(selectedCustomer?.id);

  return (
    <PageShell title="گزارش مشتری" description="مشاهده گزارش کامل یک مشتری">
      <Card>
        <CardContent className="p-4">
          <FormField label="انتخاب مشتری">
            <CustomerSearch
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="نام مشتری را جستجو کنید..."
            />
          </FormField>
        </CardContent>
      </Card>

      {!selectedCustomer && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            برای مشاهده گزارش، مشتری را انتخاب کنید
          </CardContent>
        </Card>
      )}

      {isLoading && <LoadingSpinner className="min-h-[40vh]" size="lg" />}

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  اطلاعات مشتری
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">نام:</span>
                    <span className="font-medium">{report.customer?.name || report.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تلفن:</span>
                    <span>{report.customer?.phone || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">نوع:</span>
                    <Badge variant={report.customer?.customer_type === "farmer" ? "success" : "info"}>
                      {report.customer?.customer_type === "farmer" ? "کشاورز" : "تاجر"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  خلاصه وضعیت
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>مجموع ورودی:</span>
                    <span>{toPersianNumber(report.total_input_weight)} کیلو</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مجموع خروجی:</span>
                    <span>{toPersianNumber(report.total_output_weight)} کیلو</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">وزن باقی‌مانده:</span>
                    <span className="font-bold text-lg">{toPersianNumber(report.total_input_weight - report.total_output_weight)} کیلو</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  وضعیت مالی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>مجموع فروش:</span>
                    <span className="text-green-600">{toPersianCurrency(report.total_paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مجموع پرداخت‌ها:</span>
                    <span className="text-red-600">{toPersianCurrency(report.total_debt)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">مانده حساب:</span>
                    <span className={`font-bold text-lg ${report.current_balance >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {toPersianCurrency(Math.abs(report.current_balance))}
                      {report.current_balance >= 0 ? " (بستانکار)" : " (بدهکار)"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5 text-orange-500" />
                  تراکنش‌های اخیر
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.recent_transactions && report.recent_transactions.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {report.recent_transactions.map((t, i) => (
                      <div key={i} className="flex justify-between text-sm border-b last:border-0 pb-1">
                        <div>
                          <Badge variant={t.type === "sale" || t.type === "payment" ? "success" : "warning"} className="ml-2">
                            {t.type === "sale" ? "فروش" : t.type === "payment" ? "پرداخت" : t.type === "input" ? "ورودی" : t.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatPersianDate(t.date)}</span>
                        </div>
                        <span>{toPersianCurrency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">تراکنشی وجود ندارد</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
}
