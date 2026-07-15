"use client";

import React from "react";
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

const schema = z.object({
  amount: z.string().min(1, "مبلغ را وارد کنید"),
  expense_date: z.string().min(1, "تاریخ را وارد کنید"),
  category: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  description: z.string().min(1, "توضیحات را وارد کنید"),
  payment_method: z.string().min(1, "روش پرداخت را انتخاب کنید"),
});

type FormData = z.infer<typeof schema>;

interface ExpenseFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const expenseCategories = [
  "برق",
  "آب",
  "گاز",
  "سوخت",
  "تعمیرات",
  "قطعات",
  "حمل و نقل",
  "بسته‌بندی",
  "اداری",
  "سایر",
];

export function ExpenseForm({ initialData, onSubmit, isLoading }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      expense_date: "",
      category: "",
      description: "",
      payment_method: "",
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="مبلغ" error={errors.amount?.message} required>
          <Input type="number" {...register("amount")} />
        </FormField>
        <FormField label="دسته‌بندی" error={errors.category?.message} required>
          <Select
            value={initialData?.category}
            onValueChange={(v) => setValue("category", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="انتخاب دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PersianDatePicker
          label="تاریخ هزینه"
          value={initialData?.expense_date}
          onChange={(v) => setValue("expense_date", v)}
          error={errors.expense_date?.message}
          required
        />
        <FormField label="روش پرداخت" error={errors.payment_method?.message} required>
          <Select
            value={initialData?.payment_method}
            onValueChange={(v) => setValue("payment_method", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="انتخاب روش پرداخت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">نقدی</SelectItem>
              <SelectItem value="card">کارت</SelectItem>
              <SelectItem value="check">چک</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="توضیحات" error={errors.description?.message} required>
        <Textarea {...register("description")} />
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
