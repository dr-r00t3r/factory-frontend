"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Customer } from "@/types";

interface CustomerSearchProps {
  value?: Customer | null;
  onChange: (customer: Customer | null) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function CustomerSearch({
  value,
  onChange,
  placeholder = "جستجوی مشتری...",
  error,
  className,
}: CustomerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCustomers = async (term: string) => {
    if (term.length < 1) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await apiClient.get(
        `${API_ENDPOINTS.CUSTOMERS}?search=${term}&page_size=10`
      );
      setResults(data.results || []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCustomers(val), 300);
  };

  const selectCustomer = (customer: Customer) => {
    onChange(customer);
    setQuery(customer.name);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
    setQuery("");
    setResults([]);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={value ? value.name : placeholder}
          className="pr-10 pl-10"
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
        />
        {value && (
          <button
            onClick={clearSelection}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              در حال جستجو...
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((customer) => (
                <li
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {customer.phone}
                      {customer.national_code && ` - ${customer.national_code}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              مشتری‌ای یافت نشد
            </div>
          ) : null}
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
