"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toPersianCurrency, formatPersianDate } from "@/lib/utils";
import type { Debtor } from "@/types";

interface DebtorsListProps {
  debtors: Debtor[];
}

export function DebtorsList({ debtors }: DebtorsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(
    () =>
      debtors.filter(
        (d) =>
          d.customer_name.includes(searchTerm) ||
          d.phone?.includes(searchTerm)
      ),
    [debtors, searchTerm]
  );

  const totalDebt = debtors.reduce((sum, d) => sum + (d.total_debt ?? d.debt_amount ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">لیست بدهکاران</CardTitle>
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی بدهکار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="text-sm font-medium">
            جمع بدهی: {toPersianCurrency(totalDebt)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>مشتری</TableHead>
              <TableHead>تلفن</TableHead>
              <TableHead>بدهی</TableHead>
              <TableHead>آخرین تراکنش</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((debtor) => (
                <TableRow key={debtor.customer}>
                  <TableCell className="font-medium">
                    {debtor.customer_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {debtor.phone || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {toPersianCurrency(debtor.total_debt ?? debtor.debt_amount ?? 0)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {debtor.last_transaction
                      ? formatPersianDate(debtor.last_transaction)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm
                    ? "بدهکاری با این مشخصات یافت نشد"
                    : "بدهکاری وجود ندارد"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
