"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown, Search, Pencil, Trash2 } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data?: T[];
  isLoading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onEdit,
  onDelete,
  searchable = false,
  searchPlaceholder = "جستجو...",
  onSearch,
  emptyMessage = "اطلاعاتی یافت نشد",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize);

  const sortedData = useMemo(() => {
    if (!data || !sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.className}
                >
                  <button
                    className="flex items-center gap-1 font-medium"
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="w-[100px] text-center">عملیات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <Skeleton className="h-8 w-[80px]" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : sortedData && sortedData.length > 0 ? (
              sortedData.map((item, idx) => (
                <TableRow key={String(((item as { id?: number | string }).id ?? idx))}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render
                        ? col.render(item)
                        : ((item as Record<string, unknown>)[col.key] as React.ReactNode) ?? "-"}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            نمایش {toPersianNumber((page - 1) * pageSize + 1)} تا{" "}
            {toPersianNumber(Math.min(page * pageSize, totalCount))} از{" "}
            {toPersianNumber(totalCount)} مورد
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              قبلی
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              بعدی
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
