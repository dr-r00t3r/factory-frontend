"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProcesses, useChecks } from "@/hooks";

const schema = z.object({
  process_id: z.string({ required_error: "فرآیند را انتخاب کنید" }),
  payment_date: z.string().min(1, "تاریخ را وارد کنید"),
  cash_amount: z.string().optional(),
  card_amount: z.string().optional(),
  discount: z.string().optional(),
  check_ids: z.array(z.string()).optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface KarmozdFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function KarmozdForm({ initialData, onSubmit, isLoading }: KarmozdFormProps) {
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const { data: processesData } = useProcesses({ page_size: 100 });
  const { data: checksData } = useChecks({ page_size: 100 });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cash_amount: "",
      card_amount: "",
      discount: "",
      description: "",
      ...initialData,
    },
  });

  const toggleCheck = (id: string) => {
    const updated = selectedChecks.includes(id)
      ? selectedChecks.filter((c) => c !== id)
      : [...selectedChecks, id];
    setSelectedChecks(updated);
    setValue("check_ids", updated);
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({ ...data, check_ids: selectedChecks });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormField label="فرآیند" error={errors.process_id?.message} required>
        <Select
          value={initialData?.process_id}
          onValueChange={(v) => setValue("process_id", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="انتخاب فرآیند" />
          </SelectTrigger>
          <SelectContent>
            {processesData?.results?.map((process) => (
              <SelectItem key={process.id} value={String(process.id)}>
                {process.customer_name} - {process.rice_type_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <PersianDatePicker
        label="تاریخ پرداخت"
        value={initialData?.payment_date}
        onChange={(v) => setValue("payment_date", v)}
        error={errors.payment_date?.message}
        required
      />

      <div className="grid grid-cols-3 gap-4">
        <FormField label="مبلغ نقد" error={errors.cash_amount?.message}>
          <Input type="number" {...register("cash_amount")} />
        </FormField>
        <FormField label="مبلغ کارت" error={errors.card_amount?.message}>
          <Input type="number" {...register("card_amount")} />
        </FormField>
        <FormField label="تخفیف" error={errors.discount?.message}>
          <Input type="number" {...register("discount")} />
        </FormField>
      </div>

      <FormField label="چک‌ها">
        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
          {checksData?.results?.map((check) => (
            <label
              key={check.id}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent p-1 rounded"
            >
              <input
                type="checkbox"
                checked={selectedChecks.includes(String(check.id))}
                onChange={() => toggleCheck(String(check.id))}
                className="rounded"
              />
              <span>
                {check.check_number} - {check.bank_name} - {check.amount.toLocaleString()} ریال
              </span>
            </label>
          ))}
          {(!checksData?.results || checksData.results.length === 0) && (
            <p className="text-muted-foreground text-sm">چکی موجود نیست</p>
          )}
        </div>
      </FormField>

      <FormField label="توضیحات" error={errors.description?.message}>
        <Textarea {...register("description")} />
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
