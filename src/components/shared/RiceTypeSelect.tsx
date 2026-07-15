"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { RiceType } from "@/types";

interface RiceTypeSelectProps {
  value?: number | string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function RiceTypeSelect({
  value,
  onChange,
  label,
  error,
  required = false,
  placeholder = "نوع شالی",
}: RiceTypeSelectProps) {
  const { data: riceTypes, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.RICE_TYPES],
    queryFn: async () => {
      const { data } = await apiClient.get<RiceType[]>(API_ENDPOINTS.RICE_TYPES);
      return data;
    },
  });

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
      )}
      <Select
        value={value ? String(value) : undefined}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {riceTypes?.map((rt) => (
            <SelectItem key={rt.id} value={String(rt.id)}>
              {rt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
